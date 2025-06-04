import os
import django
from django.core.mail import send_mail
from django.conf import settings

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_management.settings')
django.setup()

def test_email():
    # Temporarily change email backend to console
    original_backend = settings.EMAIL_BACKEND
    settings.EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    
    try:
        send_mail(
            'Test Email from Clinic Management System',
            'This is a test email to verify your email configuration is working correctly.',
            settings.DEFAULT_FROM_EMAIL,
            [settings.EMAIL_HOST_USER],  # Send to yourself
            fail_silently=False,
        )
        print("Test email configuration is correct!")
        print("The email would have been sent to:", settings.EMAIL_HOST_USER)
        print("From:", settings.DEFAULT_FROM_EMAIL)
    except Exception as e:
        print(f"Error in email configuration: {str(e)}")
    finally:
        # Restore original email backend
        settings.EMAIL_BACKEND = original_backend

if __name__ == "__main__":
    test_email() 