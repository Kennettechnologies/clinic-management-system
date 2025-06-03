from django import forms
from django.utils.translation import gettext_lazy as _

class SearchForm(forms.Form):
    query = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': _('Search...'),
            'autocomplete': 'off'
        })
    )

class PatientSearchForm(SearchForm):
    blood_type = forms.ChoiceField(
        required=False,
        choices=[('', '-- Select Blood Type --')] + list(Patient.BLOOD_TYPE_CHOICES),
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    gender = forms.ChoiceField(
        required=False,
        choices=[('', '-- Select Gender --')] + list(Patient.GENDER_CHOICES),
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    age_min = forms.IntegerField(
        required=False,
        min_value=0,
        max_value=120,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Min Age'})
    )
    age_max = forms.IntegerField(
        required=False,
        min_value=0,
        max_value=120,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Max Age'})
    )
    has_medical_condition = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    has_allergies = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )

class AppointmentSearchForm(SearchForm):
    status = forms.ChoiceField(
        required=False,
        choices=[('', '-- Select Status --')] + list(Appointment.STATUS_CHOICES),
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    department = forms.ModelChoiceField(
        required=False,
        queryset=Department.objects.all(),
        empty_label='-- Select Department --',
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    doctor = forms.ModelChoiceField(
        required=False,
        queryset=StaffProfile.objects.filter(role='doctor'),
        empty_label='-- Select Doctor --',
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
    time_from = forms.TimeField(
        required=False,
        widget=forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'})
    )
    time_to = forms.TimeField(
        required=False,
        widget=forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'})
    )

class InvoiceSearchForm(SearchForm):
    status = forms.ChoiceField(
        required=False,
        choices=[('', '-- Select Status --')] + list(Invoice.STATUS_CHOICES),
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    payment_status = forms.ChoiceField(
        required=False,
        choices=[('', '-- Select Payment Status --')] + list(Invoice.PAYMENT_STATUS_CHOICES),
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
    amount_min = forms.DecimalField(
        required=False,
        min_value=0,
        decimal_places=2,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Min Amount'})
    )
    amount_max = forms.DecimalField(
        required=False,
        min_value=0,
        decimal_places=2,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Max Amount'})
    ) 