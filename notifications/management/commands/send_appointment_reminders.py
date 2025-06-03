from django.core.management.base import BaseCommand
from notifications.services import NotificationService

class Command(BaseCommand):
    help = 'Sends reminders for upcoming appointments'

    def handle(self, *args, **options):
        self.stdout.write('Starting to send appointment reminders...')
        
        try:
            NotificationService.send_upcoming_appointment_reminders()
            self.stdout.write(self.style.SUCCESS('Successfully sent appointment reminders'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error sending appointment reminders: {str(e)}')) 