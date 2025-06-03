from django import forms
from .models import (
    Category, Item, StockMovement, Supplier,
    PurchaseOrder, PurchaseOrderItem, StockAlert
)

class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name', 'description']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
        }

class ItemForm(forms.ModelForm):
    class Meta:
        model = Item
        fields = [
            'name', 'category', 'description', 'sku', 'unit',
            'current_stock', 'minimum_stock', 'reorder_level',
            'unit_price', 'supplier', 'location', 'expiry_date',
            'is_active'
        ]
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
            'expiry_date': forms.DateInput(attrs={'type': 'date'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        minimum_stock = cleaned_data.get('minimum_stock')
        reorder_level = cleaned_data.get('reorder_level')

        if minimum_stock and reorder_level and minimum_stock > reorder_level:
            raise forms.ValidationError(
                "Minimum stock level cannot be higher than reorder level."
            )

        return cleaned_data

class StockMovementForm(forms.ModelForm):
    class Meta:
        model = StockMovement
        fields = ['item', 'movement_type', 'quantity', 'reference_number', 'notes']
        widgets = {
            'notes': forms.Textarea(attrs={'rows': 3}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Only show active items
        self.fields['item'].queryset = Item.objects.filter(is_active=True)

    def clean(self):
        cleaned_data = super().clean()
        item = cleaned_data.get('item')
        movement_type = cleaned_data.get('movement_type')
        quantity = cleaned_data.get('quantity')

        if item and movement_type and quantity:
            if movement_type in ['out', 'adjustment'] and quantity > item.current_stock:
                raise forms.ValidationError(
                    f"Cannot remove more items than available. Current stock: {item.current_stock}"
                )

        return cleaned_data

class SupplierForm(forms.ModelForm):
    class Meta:
        model = Supplier
        fields = ['name', 'contact_person', 'email', 'phone', 'address', 'is_active']
        widgets = {
            'address': forms.Textarea(attrs={'rows': 3}),
        }

class PurchaseOrderForm(forms.ModelForm):
    class Meta:
        model = PurchaseOrder
        fields = [
            'supplier', 'order_number', 'order_date',
            'expected_delivery_date', 'status', 'total_amount', 'notes'
        ]
        widgets = {
            'order_date': forms.DateInput(attrs={'type': 'date'}),
            'expected_delivery_date': forms.DateInput(attrs={'type': 'date'}),
            'notes': forms.Textarea(attrs={'rows': 3}),
        }

class PurchaseOrderItemForm(forms.ModelForm):
    class Meta:
        model = PurchaseOrderItem
        fields = ['item', 'quantity', 'unit_price']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['item'].queryset = Item.objects.filter(is_active=True)

PurchaseOrderItemFormSet = forms.inlineformset_factory(
    PurchaseOrder,
    PurchaseOrderItem,
    form=PurchaseOrderItemForm,
    extra=1,
    can_delete=True
)

class StockAlertFilterForm(forms.Form):
    alert_type = forms.ChoiceField(
        required=False,
        choices=[('', '-- All Alert Types --')] + list(StockAlert.ALERT_TYPES),
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    is_active = forms.ChoiceField(
        required=False,
        choices=[
            ('', '-- All Status --'),
            ('true', 'Active'),
            ('false', 'Resolved')
        ],
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    date_from = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )
    date_to = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    ) 