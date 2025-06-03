from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Appointment, AppointmentReminder, AppointmentHistory
from .forms import (
    AppointmentForm, AppointmentStatusForm,
    AppointmentRescheduleForm, AppointmentReminderForm
)
from accounts.decorators import role_required, can_book_appointments
from patients.models import Patient

@login_required
@role_required(['admin', 'doctor', 'receptionist'])
def appointment_list(request):
    if request.user.user_type == 'doctor':
        appointments = Appointment.objects.filter(doctor=request.user)
    else:
        appointments = Appointment.objects.all()
    return render(request, 'appointments/appointment_list.html', {'appointments': appointments})

@login_required
@role_required(['admin', 'doctor', 'receptionist', 'patient'])
def appointment_detail(request, pk):
    appointment = get_object_or_404(Appointment, pk=pk)
    if request.user.user_type == 'patient' and appointment.patient.user != request.user:
        messages.error(request, 'You do not have permission to view this appointment.')
        return redirect('appointments:appointment_list')
    if request.user.user_type == 'doctor' and appointment.doctor != request.user:
        messages.error(request, 'You do not have permission to view this appointment.')
        return redirect('appointments:appointment_list')
    return render(request, 'appointments/appointment_detail.html', {'appointment': appointment})

@login_required
@can_book_appointments
def appointment_create(request):
    if request.method == 'POST':
        form = AppointmentForm(request.POST)
        if form.is_valid():
            appointment = form.save(commit=False)
            if request.user.user_type == 'patient':
                appointment.patient = request.user.patient
            appointment.status = 'scheduled'
            appointment.save()
            
            # Create appointment history
            AppointmentHistory.objects.create(
                appointment=appointment,
                status='scheduled',
                notes='Appointment created'
            )
            
            messages.success(request, 'Appointment created successfully.')
            return redirect('appointments:appointment_detail', pk=appointment.pk)
    else:
        form = AppointmentForm()
        if request.user.user_type == 'patient':
            form.fields['patient'].initial = request.user.patient
            form.fields['patient'].widget = forms.HiddenInput()
    return render(request, 'appointments/appointment_form.html', {'form': form})

@login_required
@role_required(['admin', 'doctor', 'receptionist'])
def appointment_update(request, pk):
    appointment = get_object_or_404(Appointment, pk=pk)
    if request.method == 'POST':
        form = AppointmentForm(request.POST, instance=appointment)
        if form.is_valid():
            appointment = form.save()
            messages.success(request, 'Appointment updated successfully.')
            return redirect('appointments:appointment_detail', pk=appointment.pk)
    else:
        form = AppointmentForm(instance=appointment)
    return render(request, 'appointments/appointment_form.html', {'form': form})

@login_required
@role_required(['admin', 'doctor', 'receptionist'])
def appointment_status_update(request, pk):
    appointment = get_object_or_404(Appointment, pk=pk)
    if request.method == 'POST':
        form = AppointmentStatusForm(request.POST, instance=appointment)
        if form.is_valid():
            old_status = appointment.status
            appointment = form.save()
            
            # Create appointment history
            AppointmentHistory.objects.create(
                appointment=appointment,
                status=appointment.status,
                notes=f'Status changed from {old_status} to {appointment.status}'
            )
            
            messages.success(request, 'Appointment status updated successfully.')
            return redirect('appointments:appointment_detail', pk=appointment.pk)
    else:
        form = AppointmentStatusForm(instance=appointment)
    return render(request, 'appointments/appointment_status_form.html', {'form': form, 'appointment': appointment})

@login_required
@role_required(['admin', 'doctor', 'receptionist'])
def appointment_reschedule(request, pk):
    appointment = get_object_or_404(Appointment, pk=pk)
    if request.method == 'POST':
        form = AppointmentRescheduleForm(request.POST, instance=appointment)
        if form.is_valid():
            old_date = appointment.date
            old_time = appointment.time
            appointment = form.save()
            
            # Create appointment history
            AppointmentHistory.objects.create(
                appointment=appointment,
                status='rescheduled',
                notes=f'Appointment rescheduled from {old_date} {old_time} to {appointment.date} {appointment.time}'
            )
            
            messages.success(request, 'Appointment rescheduled successfully.')
            return redirect('appointments:appointment_detail', pk=appointment.pk)
    else:
        form = AppointmentRescheduleForm(instance=appointment)
    return render(request, 'appointments/appointment_reschedule_form.html', {'form': form, 'appointment': appointment})

@login_required
@role_required(['admin', 'doctor', 'receptionist'])
def appointment_reminder_create(request, pk):
    appointment = get_object_or_404(Appointment, pk=pk)
    if request.method == 'POST':
        form = AppointmentReminderForm(request.POST)
        if form.is_valid():
            reminder = form.save(commit=False)
            reminder.appointment = appointment
            reminder.save()
            
            # Send reminder based on type
            if reminder.reminder_type == 'email':
                send_mail(
                    'Appointment Reminder',
                    f'You have an appointment on {appointment.date} at {appointment.time}',
                    settings.DEFAULT_FROM_EMAIL,
                    [appointment.patient.user.email],
                    fail_silently=False,
                )
            elif reminder.reminder_type == 'sms':
                # Implement SMS sending logic here
                pass
            
            messages.success(request, 'Reminder created successfully.')
            return redirect('appointments:appointment_detail', pk=appointment.pk)
    else:
        form = AppointmentReminderForm()
    return render(request, 'appointments/appointment_reminder_form.html', {'form': form, 'appointment': appointment})

@login_required
@role_required(['admin', 'doctor', 'receptionist'])
def appointment_cancel(request, pk):
    appointment = get_object_or_404(Appointment, pk=pk)
    if request.method == 'POST':
        appointment.status = 'cancelled'
        appointment.save()
        
        # Create appointment history
        AppointmentHistory.objects.create(
            appointment=appointment,
            status='cancelled',
            notes='Appointment cancelled'
        )
        
        messages.success(request, 'Appointment cancelled successfully.')
        return redirect('appointments:appointment_detail', pk=appointment.pk)
    return render(request, 'appointments/appointment_cancel_confirm.html', {'appointment': appointment})

@role_required(['doctor'])
def doctor_appointments(request):
    appointments = Appointment.objects.filter(
        doctor=request.user,
        appointment_date__gte=timezone.now().date()
    ).order_by('appointment_date', 'appointment_time')
    return render(request, 'appointments/doctor_appointments.html', {'appointments': appointments})

@role_required(['patient'])
def patient_appointments(request):
    appointments = Appointment.objects.filter(
        patient__user=request.user,
        appointment_date__gte=timezone.now().date()
    ).order_by('appointment_date', 'appointment_time')
    return render(request, 'appointments/patient_appointments.html', {'appointments': appointments}) 