from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from datetime import datetime, timedelta
from appointments.models import Appointment
from patients.models import Patient
from accounts.decorators import role_required

@login_required
@role_required(['doctor'])
def dashboard(request):
    # Get today's appointments
    today = timezone.now().date()
    today_appointments = Appointment.objects.filter(
        doctor=request.user,
        start_time__date=today
    ).order_by('start_time')

    # Get recent patients (last 10 patients seen)
    recent_patients = Patient.objects.filter(
        medical_records__created_by=request.user
    ).distinct().order_by('-medical_records__created_at')[:10]

    context = {
        'today_appointments': today_appointments,
        'recent_patients': recent_patients,
    }
    return render(request, 'doctor/dashboard.html', context) 