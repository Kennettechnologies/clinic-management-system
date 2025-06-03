from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta
from patients.models import Patient
from appointments.models import Appointment
from billing.models import Invoice
from staff.models import Department, StaffProfile

class SearchService:
    @staticmethod
    def search_patients(query, filters=None):
        """
        Search patients with advanced filtering
        filters: dict containing filter parameters
        """
        if filters is None:
            filters = {}

        patients = Patient.objects.all()

        # Basic search
        if query:
            patients = patients.filter(
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(email__icontains=query) |
                Q(phone__icontains=query) |
                Q(medical_record_number__icontains=query)
            )

        # Apply filters
        if filters.get('blood_type'):
            patients = patients.filter(blood_type=filters['blood_type'])

        if filters.get('gender'):
            patients = patients.filter(gender=filters['gender'])

        if filters.get('age_min'):
            patients = patients.filter(age__gte=filters['age_min'])

        if filters.get('age_max'):
            patients = patients.filter(age__lte=filters['age_max'])

        if filters.get('has_medical_condition'):
            patients = patients.filter(medical_conditions__isnull=False).distinct()

        if filters.get('has_allergies'):
            patients = patients.filter(allergies__isnull=False).distinct()

        return patients.order_by('last_name', 'first_name')

    @staticmethod
    def search_appointments(query, filters=None):
        """
        Search appointments with advanced filtering
        filters: dict containing filter parameters
        """
        if filters is None:
            filters = {}

        appointments = Appointment.objects.all()

        # Basic search
        if query:
            appointments = appointments.filter(
                Q(patient__first_name__icontains=query) |
                Q(patient__last_name__icontains=query) |
                Q(doctor__first_name__icontains=query) |
                Q(doctor__last_name__icontains=query) |
                Q(notes__icontains=query)
            )

        # Apply filters
        if filters.get('status'):
            appointments = appointments.filter(status=filters['status'])

        if filters.get('department'):
            appointments = appointments.filter(doctor__department=filters['department'])

        if filters.get('doctor'):
            appointments = appointments.filter(doctor=filters['doctor'])

        if filters.get('date_from'):
            appointments = appointments.filter(date__gte=filters['date_from'])

        if filters.get('date_to'):
            appointments = appointments.filter(date__lte=filters['date_to'])

        if filters.get('time_from'):
            appointments = appointments.filter(time__gte=filters['time_from'])

        if filters.get('time_to'):
            appointments = appointments.filter(time__lte=filters['time_to'])

        return appointments.order_by('-date', '-time')

    @staticmethod
    def search_invoices(query, filters=None):
        """
        Search invoices with advanced filtering
        filters: dict containing filter parameters
        """
        if filters is None:
            filters = {}

        invoices = Invoice.objects.all()

        # Basic search
        if query:
            invoices = invoices.filter(
                Q(invoice_number__icontains=query) |
                Q(patient__first_name__icontains=query) |
                Q(patient__last_name__icontains=query) |
                Q(notes__icontains=query)
            )

        # Apply filters
        if filters.get('status'):
            invoices = invoices.filter(status=filters['status'])

        if filters.get('date_from'):
            invoices = invoices.filter(date__gte=filters['date_from'])

        if filters.get('date_to'):
            invoices = invoices.filter(date__lte=filters['date_to'])

        if filters.get('amount_min'):
            invoices = invoices.filter(total_amount__gte=filters['amount_min'])

        if filters.get('amount_max'):
            invoices = invoices.filter(total_amount__lte=filters['amount_max'])

        if filters.get('payment_status'):
            invoices = invoices.filter(payment_status=filters['payment_status'])

        return invoices.order_by('-date')

    @staticmethod
    def get_filter_options():
        """
        Get all available filter options for the search interface
        """
        return {
            'departments': Department.objects.all(),
            'doctors': StaffProfile.objects.filter(role='doctor'),
            'blood_types': Patient.BLOOD_TYPE_CHOICES,
            'genders': Patient.GENDER_CHOICES,
            'appointment_statuses': Appointment.STATUS_CHOICES,
            'invoice_statuses': Invoice.STATUS_CHOICES,
            'payment_statuses': Invoice.PAYMENT_STATUS_CHOICES,
        } 