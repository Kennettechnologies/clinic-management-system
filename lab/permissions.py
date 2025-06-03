from functools import wraps
from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect
from django.contrib import messages

def has_lab_permission(permission):
    """
    Decorator to check if user has specific lab permission
    Available permissions:
    - view_lab_tests
    - manage_lab_tests
    - request_lab_tests
    - process_lab_tests
    - view_lab_reports
    - manage_lab_reports
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                messages.error(request, 'You must be logged in to access this page.')
                return redirect('login')
            
            # Admin has all permissions
            if request.user.role == 'admin':
                return view_func(request, *args, **kwargs)
            
            # Role-based permission mapping
            role_permissions = {
                'doctor': [
                    'view_lab_tests',
                    'request_lab_tests',
                    'view_lab_reports'
                ],
                'lab_technician': [
                    'view_lab_tests',
                    'process_lab_tests',
                    'view_lab_reports',
                    'manage_lab_reports'
                ],
                'receptionist': [
                    'view_lab_tests'
                ]
            }
            
            # Check if user's role has the required permission
            if (request.user.role in role_permissions and 
                permission in role_permissions[request.user.role]):
                return view_func(request, *args, **kwargs)
            
            raise PermissionDenied('You do not have permission to access this page.')
        return _wrapped_view
    return decorator

def can_access_patient_data(view_func):
    """
    Decorator to check if user can access patient data
    Only doctors, lab technicians, and admins can access patient data
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, 'You must be logged in to access this page.')
            return redirect('login')
        
        allowed_roles = ['doctor', 'lab_technician', 'admin']
        if request.user.role in allowed_roles:
            return view_func(request, *args, **kwargs)
        
        raise PermissionDenied('You do not have permission to access patient data.')
    return _wrapped_view

def can_manage_lab_tests(view_func):
    """
    Decorator to check if user can manage lab tests
    Only lab technicians and admins can manage lab tests
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, 'You must be logged in to access this page.')
            return redirect('login')
        
        allowed_roles = ['lab_technician', 'admin']
        if request.user.role in allowed_roles:
            return view_func(request, *args, **kwargs)
        
        raise PermissionDenied('You do not have permission to manage lab tests.')
    return _wrapped_view 