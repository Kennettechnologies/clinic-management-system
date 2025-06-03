from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .forms import PatientSearchForm, AppointmentSearchForm, InvoiceSearchForm
from .services import SearchService

@login_required
def search(request):
    """View for handling search functionality"""
    # Initialize forms
    patient_form = PatientSearchForm(request.GET)
    appointment_form = AppointmentSearchForm(request.GET)
    invoice_form = InvoiceSearchForm(request.GET)

    # Initialize context
    context = {
        'patient_form': patient_form,
        'appointment_form': appointment_form,
        'invoice_form': invoice_form,
    }

    # Get active tab from request
    active_tab = request.GET.get('tab', 'patients')
    context['active_tab'] = active_tab

    # Handle patient search
    if active_tab == 'patients' and request.GET:
        if patient_form.is_valid():
            filters = {
                'blood_type': patient_form.cleaned_data.get('blood_type'),
                'gender': patient_form.cleaned_data.get('gender'),
                'age_min': patient_form.cleaned_data.get('age_min'),
                'age_max': patient_form.cleaned_data.get('age_max'),
                'has_medical_condition': patient_form.cleaned_data.get('has_medical_condition'),
                'has_allergies': patient_form.cleaned_data.get('has_allergies'),
            }
            context['patients'] = SearchService.search_patients(
                patient_form.cleaned_data.get('query'),
                filters
            )

    # Handle appointment search
    elif active_tab == 'appointments' and request.GET:
        if appointment_form.is_valid():
            filters = {
                'status': appointment_form.cleaned_data.get('status'),
                'department': appointment_form.cleaned_data.get('department'),
                'doctor': appointment_form.cleaned_data.get('doctor'),
                'date_from': appointment_form.cleaned_data.get('date_from'),
                'date_to': appointment_form.cleaned_data.get('date_to'),
                'time_from': appointment_form.cleaned_data.get('time_from'),
                'time_to': appointment_form.cleaned_data.get('time_to'),
            }
            context['appointments'] = SearchService.search_appointments(
                appointment_form.cleaned_data.get('query'),
                filters
            )

    # Handle invoice search
    elif active_tab == 'invoices' and request.GET:
        if invoice_form.is_valid():
            filters = {
                'status': invoice_form.cleaned_data.get('status'),
                'payment_status': invoice_form.cleaned_data.get('payment_status'),
                'date_from': invoice_form.cleaned_data.get('date_from'),
                'date_to': invoice_form.cleaned_data.get('date_to'),
                'amount_min': invoice_form.cleaned_data.get('amount_min'),
                'amount_max': invoice_form.cleaned_data.get('amount_max'),
            }
            context['invoices'] = SearchService.search_invoices(
                invoice_form.cleaned_data.get('query'),
                filters
            )

    return render(request, 'core/search.html', context) 