from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Sum, F, Q
from django.utils import timezone
from datetime import timedelta
from .models import (
    Category, Item, StockMovement, Supplier,
    PurchaseOrder, PurchaseOrderItem, StockAlert
)
from .forms import (
    CategoryForm, ItemForm, StockMovementForm, SupplierForm,
    PurchaseOrderForm, PurchaseOrderItemFormSet,
    StockAlertFilterForm
)
from accounts.decorators import role_required

@login_required
@role_required(['admin', 'receptionist'])
def inventory_dashboard(request):
    total_items = Item.objects.count()
    low_stock_items = Item.objects.filter(quantity__lte=F('reorder_level')).count()
    total_value = Item.objects.aggregate(total=Sum(F('quantity') * F('unit_price')))['total'] or 0
    recent_movements = StockMovement.objects.select_related('item').order_by('-date')[:10]
    pending_orders = PurchaseOrder.objects.filter(status__in=['draft', 'pending']).count()

    context = {
        'total_items': total_items,
        'low_stock_items': low_stock_items,
        'total_value': total_value,
        'recent_movements': recent_movements,
        'pending_orders': pending_orders,
    }
    return render(request, 'inventory/dashboard.html', context)

@login_required
@role_required(['admin', 'receptionist'])
def category_list(request):
    categories = Category.objects.all()
    return render(request, 'inventory/category_list.html', {'categories': categories})

@login_required
@role_required(['admin', 'receptionist'])
def category_create(request):
    if request.method == 'POST':
        form = CategoryForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Category created successfully.')
            return redirect('inventory:category_list')
    else:
        form = CategoryForm()
    return render(request, 'inventory/category_form.html', {'form': form})

@login_required
@role_required(['admin', 'receptionist'])
def category_update(request, pk):
    category = get_object_or_404(Category, pk=pk)
    if request.method == 'POST':
        form = CategoryForm(request.POST, instance=category)
        if form.is_valid():
            form.save()
            messages.success(request, 'Category updated successfully.')
            return redirect('inventory:category_list')
    else:
        form = CategoryForm(instance=category)
    return render(request, 'inventory/category_form.html', {'form': form})

@login_required
@role_required(['admin', 'receptionist'])
def item_list(request):
    items = Item.objects.select_related('category').all()
    return render(request, 'inventory/item_list.html', {'items': items})

@login_required
@role_required(['admin', 'receptionist'])
def item_create(request):
    if request.method == 'POST':
        form = ItemForm(request.POST)
        if form.is_valid():
            item = form.save(commit=False)
            item.created_by = request.user
            item.save()
            messages.success(request, 'Item created successfully.')
            return redirect('inventory:item_list')
    else:
        form = ItemForm()
    return render(request, 'inventory/item_form.html', {'form': form})

@login_required
@role_required(['admin', 'receptionist'])
def item_update(request, pk):
    item = get_object_or_404(Item, pk=pk)
    if request.method == 'POST':
        form = ItemForm(request.POST, instance=item)
        if form.is_valid():
            form.save()
            messages.success(request, 'Item updated successfully.')
            return redirect('inventory:item_list')
    else:
        form = ItemForm(instance=item)
    return render(request, 'inventory/item_form.html', {'form': form})

@login_required
@role_required(['admin', 'receptionist'])
def stock_movement_create(request):
    if request.method == 'POST':
        form = StockMovementForm(request.POST)
        if form.is_valid():
            movement = form.save(commit=False)
            movement.performed_by = request.user
            movement.save()
            
            # Create alerts if needed
            item = movement.item
            if item.is_low_stock:
                StockAlert.objects.create(
                    item=item,
                    alert_type='low_stock',
                    message=f'Stock level ({item.current_stock}) is below minimum ({item.minimum_stock})'
                )
            elif item.needs_reorder:
                StockAlert.objects.create(
                    item=item,
                    alert_type='reorder',
                    message=f'Stock level ({item.current_stock}) has reached reorder level ({item.reorder_level})'
                )
            
            messages.success(request, 'Stock movement recorded successfully.')
            return redirect('inventory:item_list')
    else:
        form = StockMovementForm()
    return render(request, 'inventory/stock_movement_form.html', {'form': form})

@login_required
@role_required(['admin', 'receptionist'])
def supplier_list(request):
    suppliers = Supplier.objects.all()
    return render(request, 'inventory/supplier_list.html', {'suppliers': suppliers})

@login_required
@role_required(['admin', 'receptionist'])
def supplier_create(request):
    if request.method == 'POST':
        form = SupplierForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Supplier created successfully.')
            return redirect('inventory:supplier_list')
    else:
        form = SupplierForm()
    return render(request, 'inventory/supplier_form.html', {'form': form})

@login_required
@role_required(['admin', 'receptionist'])
def supplier_update(request, pk):
    supplier = get_object_or_404(Supplier, pk=pk)
    if request.method == 'POST':
        form = SupplierForm(request.POST, instance=supplier)
        if form.is_valid():
            form.save()
            messages.success(request, 'Supplier updated successfully.')
            return redirect('inventory:supplier_list')
    else:
        form = SupplierForm(instance=supplier)
    return render(request, 'inventory/supplier_form.html', {'form': form})

@login_required
@role_required(['admin', 'receptionist'])
def purchase_order_list(request):
    orders = PurchaseOrder.objects.select_related('supplier').all()
    return render(request, 'inventory/purchase_order_list.html', {'orders': orders})

@login_required
@role_required(['admin', 'receptionist'])
def purchase_order_create(request):
    if request.method == 'POST':
        form = PurchaseOrderForm(request.POST)
        formset = PurchaseOrderItemFormSet(request.POST)
        if form.is_valid() and formset.is_valid():
            order = form.save(commit=False)
            order.created_by = request.user
            order.save()
            formset.instance = order
            formset.save()
            messages.success(request, 'Purchase order created successfully.')
            return redirect('inventory:purchase_order_list')
    else:
        form = PurchaseOrderForm()
        formset = PurchaseOrderItemFormSet()
    return render(request, 'inventory/purchase_order_form.html', {
        'form': form,
        'formset': formset
    })

@login_required
@role_required(['admin', 'receptionist'])
def purchase_order_update(request, pk):
    order = get_object_or_404(PurchaseOrder, pk=pk)
    if request.method == 'POST':
        form = PurchaseOrderForm(request.POST, instance=order)
        formset = PurchaseOrderItemFormSet(request.POST, instance=order)
        if form.is_valid() and formset.is_valid():
            form.save()
            formset.save()
            messages.success(request, 'Purchase order updated successfully.')
            return redirect('inventory:purchase_order_list')
    else:
        form = PurchaseOrderForm(instance=order)
        formset = PurchaseOrderItemFormSet(instance=order)
    return render(request, 'inventory/purchase_order_form.html', {
        'form': form,
        'formset': formset
    })

@login_required
@role_required(['admin', 'receptionist'])
def purchase_order_detail(request, pk):
    order = get_object_or_404(PurchaseOrder.objects.select_related('supplier'), pk=pk)
    items = order.items.select_related('item').all()
    return render(request, 'inventory/purchase_order_detail.html', {
        'order': order,
        'items': items
    })

@login_required
@role_required(['admin', 'receptionist'])
def purchase_order_receive(request, pk):
    order = get_object_or_404(PurchaseOrder, pk=pk)
    if request.method == 'POST':
        for item in order.items.all():
            if item.received_quantity < item.quantity:
                StockMovement.objects.create(
                    item=item.item,
                    movement_type='in',
                    quantity=item.quantity - item.received_quantity,
                    reference_number=order.order_number,
                    notes=f'Received from PO-{order.order_number}',
                    performed_by=request.user
                )
                item.received_quantity = item.quantity
                item.save()
        order.status = 'received'
        order.save()
        messages.success(request, 'Purchase order received successfully.')
        return redirect('inventory:purchase_order_detail', pk=order.pk)
    return render(request, 'inventory/purchase_order_receive.html', {'order': order})

@login_required
def inventory_list(request):
    """View for listing inventory items"""
    items = Item.objects.all().order_by('name')
    categories = Category.objects.all()
    
    # Filter by category
    category_id = request.GET.get('category')
    if category_id:
        items = items.filter(category_id=category_id)
    
    # Filter by stock status
    stock_status = request.GET.get('stock_status')
    if stock_status == 'low':
        items = items.filter(current_stock__lte=F('minimum_stock'))
    elif stock_status == 'reorder':
        items = items.filter(current_stock__lte=F('reorder_level'))
    
    # Filter by expiry
    expiry_status = request.GET.get('expiry_status')
    if expiry_status == 'expired':
        items = items.filter(expiry_date__lt=timezone.now().date())
    elif expiry_status == 'expiring_soon':
        items = items.filter(
            expiry_date__gte=timezone.now().date(),
            expiry_date__lte=timezone.now().date() + timedelta(days=30)
        )
    
    context = {
        'items': items,
        'categories': categories,
        'current_category': category_id,
        'current_stock_status': stock_status,
        'current_expiry_status': expiry_status,
    }
    return render(request, 'inventory/inventory_list.html', context)

@login_required
def item_detail(request, pk):
    """View for displaying item details"""
    item = get_object_or_404(Item, pk=pk)
    movements = item.movements.all().order_by('-created_at')[:10]
    alerts = item.alerts.filter(is_active=True)
    
    context = {
        'item': item,
        'movements': movements,
        'alerts': alerts,
    }
    return render(request, 'inventory/item_detail.html', context)

@login_required
def stock_alerts(request):
    """View for displaying stock alerts"""
    alerts = StockAlert.objects.all().order_by('-created_at')
    form = StockAlertFilterForm(request.GET)
    
    if form.is_valid():
        if form.cleaned_data.get('alert_type'):
            alerts = alerts.filter(alert_type=form.cleaned_data['alert_type'])
        
        if form.cleaned_data.get('is_active'):
            is_active = form.cleaned_data['is_active'] == 'true'
            alerts = alerts.filter(is_active=is_active)
        
        if form.cleaned_data.get('date_from'):
            alerts = alerts.filter(created_at__gte=form.cleaned_data['date_from'])
        
        if form.cleaned_data.get('date_to'):
            alerts = alerts.filter(created_at__lte=form.cleaned_data['date_to'])
    
    context = {
        'alerts': alerts,
        'form': form,
    }
    return render(request, 'inventory/stock_alerts.html', context)

@login_required
def resolve_alert(request, pk):
    """View for resolving stock alerts"""
    alert = get_object_or_404(StockAlert, pk=pk)
    if request.method == 'POST':
        alert.resolve()
        messages.success(request, 'Alert resolved successfully.')
        return redirect('inventory:stock_alerts')
    
    return render(request, 'inventory/resolve_alert.html', {'alert': alert})

@login_required
def check_stock_levels(request):
    """View for checking stock levels and creating alerts"""
    items = Item.objects.filter(is_active=True)
    alerts_created = 0
    
    for item in items:
        # Check for low stock
        if item.is_low_stock:
            StockAlert.objects.get_or_create(
                item=item,
                alert_type='low_stock',
                is_active=True,
                defaults={
                    'message': f'Stock level ({item.current_stock}) is below minimum ({item.minimum_stock})'
                }
            )
            alerts_created += 1
        
        # Check for reorder level
        elif item.needs_reorder:
            StockAlert.objects.get_or_create(
                item=item,
                alert_type='reorder',
                is_active=True,
                defaults={
                    'message': f'Stock level ({item.current_stock}) has reached reorder level ({item.reorder_level})'
                }
            )
            alerts_created += 1
        
        # Check for expiry
        if item.expiry_date and item.is_expired:
            StockAlert.objects.get_or_create(
                item=item,
                alert_type='expiry',
                is_active=True,
                defaults={
                    'message': f'Item has expired on {item.expiry_date}'
                }
            )
            alerts_created += 1
    
    messages.success(request, f'Stock levels checked. {alerts_created} new alerts created.')
    return redirect('inventory:stock_alerts') 