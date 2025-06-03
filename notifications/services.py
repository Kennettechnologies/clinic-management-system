from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import Notification, EmailTemplate, NotificationPreference

class NotificationService:
    @staticmethod
    def send_appointment_confirmation(appointment):
        """Send appointment confirmation email"""
        template = EmailTemplate.objects.get(name='appointment_confirmation')
        notification = Notification.objects.create(
            type='appointment_confirmation',
            recipient=appointment.patient,
            appointment=appointment,
            email_template=template
        )
        
        context = {
            'appointment': appointment,
            'clinic_name': settings.CLINIC_NAME,
        }
        
        html_message = render_to_string('notifications/email/appointment_confirmation.html', context)
        
        try:
            send_mail(
                subject=template.subject,
                message='',  # Plain text version
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[appointment.patient.email],
                html_message=html_message
            )
            notification.mark_as_sent()
            return True
        except Exception as e:
            notification.mark_as_failed()
            return False

    @staticmethod
    def send_appointment_reminder(appointment):
        """Send appointment reminder email"""
        # Check if user has enabled reminders
        try:
            preferences = NotificationPreference.objects.get(user=appointment.patient)
            if not preferences.appointment_reminders:
                return False
        except NotificationPreference.DoesNotExist:
            return False

        template = EmailTemplate.objects.get(name='appointment_reminder')
        notification = Notification.objects.create(
            type='appointment_reminder',
            recipient=appointment.patient,
            appointment=appointment,
            email_template=template
        )
        
        # Calculate days until appointment
        days_until = (appointment.date - timezone.now().date()).days
        
        context = {
            'appointment': appointment,
            'clinic_name': settings.CLINIC_NAME,
            'days_until_appointment': days_until,
        }
        
        html_message = render_to_string('notifications/email/appointment_reminder.html', context)
        
        try:
            send_mail(
                subject=template.subject,
                message='',  # Plain text version
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[appointment.patient.email],
                html_message=html_message
            )
            notification.mark_as_sent()
            return True
        except Exception as e:
            notification.mark_as_failed()
            return False

    @staticmethod
    def send_appointment_cancellation(appointment, reason=None):
        """Send appointment cancellation email"""
        template = EmailTemplate.objects.get(name='appointment_cancellation')
        notification = Notification.objects.create(
            type='appointment_cancellation',
            recipient=appointment.patient,
            appointment=appointment,
            email_template=template
        )
        
        context = {
            'appointment': appointment,
            'clinic_name': settings.CLINIC_NAME,
            'clinic_phone': settings.CLINIC_PHONE,
            'cancellation_reason': reason,
        }
        
        html_message = render_to_string('notifications/email/appointment_cancellation.html', context)
        
        try:
            send_mail(
                subject=template.subject,
                message='',  # Plain text version
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[appointment.patient.email],
                html_message=html_message
            )
            notification.mark_as_sent()
            return True
        except Exception as e:
            notification.mark_as_failed()
            return False

    @staticmethod
    def send_upcoming_appointment_reminders():
        """Send reminders for upcoming appointments"""
        from appointments.models import Appointment
        
        # Get all appointments scheduled for tomorrow
        tomorrow = timezone.now().date() + timedelta(days=1)
        appointments = Appointment.objects.filter(
            date=tomorrow,
            status='scheduled'
        )
        
        for appointment in appointments:
            NotificationService.send_appointment_reminder(appointment) 