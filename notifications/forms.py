from django import forms
from .models import NotificationPreference

class NotificationPreferenceForm(forms.ModelForm):
    class Meta:
        model = NotificationPreference
        fields = ['email_notifications', 'appointment_reminders', 'reminder_days_before', 'reminder_time']
        widgets = {
            'reminder_time': forms.TimeInput(attrs={'type': 'time'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['reminder_days_before'].widget.attrs.update({'min': 1, 'max': 7})
        self.fields['reminder_time'].widget.attrs.update({'class': 'form-control'}) 