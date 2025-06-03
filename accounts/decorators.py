from django.shortcuts import redirect
from django.contrib import messages
from functools import wraps

def role_required(allowed_roles=[], own_data=False):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                messages.error(request, 'Please login to access this page.')
                return redirect('login')
            
            if request.user.user_type not in allowed_roles:
                messages.error(request, 'You do not have permission to access this page.')
                return redirect('home')
            
            # Handle own data access
            if own_data and request.user.user_type in ['doctor', 'patient']:
                # For doctors, they can only access their own patients' data
                if request.user.user_type == 'doctor':
                    if 'patient_pk' in kwargs:
                        from patients.models import PatientProfile
                        patient = PatientProfile.objects.get(pk=kwargs['patient_pk'])
                        if patient.doctor != request.user:
                            messages.error(request, 'You can only access your own patients\' data.')
                            return redirect('home')
                
                # For patients, they can only access their own data
                if request.user.user_type == 'patient':
                    if 'pk' in kwargs:
                        from patients.models import PatientProfile
                        try:
                            patient = PatientProfile.objects.get(pk=kwargs['pk'])
                            if patient.user != request.user:
                                messages.error(request, 'You can only access your own data.')
                                return redirect('home')
                        except PatientProfile.DoesNotExist:
                            pass
            
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator

def can_book_appointments(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        allowed_roles = ['admin', 'receptionist']
        if request.user.user_type == 'patient':
            # Patients can only book their own appointments
            if 'patient_pk' in kwargs and str(kwargs['patient_pk']) != str(request.user.patientprofile.pk):
                messages.error(request, 'You can only book appointments for yourself.')
                return redirect('home')
            return view_func(request, *args, **kwargs)
        
        if request.user.user_type not in allowed_roles:
            messages.error(request, 'You do not have permission to book appointments.')
            return redirect('home')
        
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def can_manage_billing(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        allowed_roles = ['admin', 'receptionist']
        if request.user.user_type == 'patient':
            # Patients can only view their own billing
            if 'invoice_pk' in kwargs:
                from billing.models import Invoice
                invoice = Invoice.objects.get(pk=kwargs['invoice_pk'])
                if invoice.patient.user != request.user:
                    messages.error(request, 'You can only view your own billing information.')
                    return redirect('home')
            return view_func(request, *args, **kwargs)
        
        if request.user.user_type not in allowed_roles:
            messages.error(request, 'You do not have permission to manage billing.')
            return redirect('home')
        
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def can_add_notes(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        allowed_roles = ['admin', 'doctor']
        if request.user.user_type not in allowed_roles:
            messages.error(request, 'You do not have permission to add medical notes.')
            return redirect('home')
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def can_view_reports(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if request.user.user_type != 'admin':
            messages.error(request, 'Only administrators can view reports.')
            return redirect('home')
        return view_func(request, *args, **kwargs)
    return _wrapped_view 