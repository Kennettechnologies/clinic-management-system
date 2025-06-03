from django import forms
from .models import Prescription, Medication

class PrescriptionForm(forms.ModelForm):
    class Meta:
        model = Prescription
        fields = ['patient', 'diagnosis', 'notes', 'follow_up_date']
        widgets = {
            'follow_up_date': forms.DateInput(attrs={'type': 'date'}),
            'diagnosis': forms.Textarea(attrs={'rows': 3}),
            'notes': forms.Textarea(attrs={'rows': 3}),
        }

class MedicationForm(forms.ModelForm):
    class Meta:
        model = Medication
        fields = ['name', 'dosage', 'frequency', 'duration', 'duration_unit', 
                 'instructions', 'quantity', 'refills']
        widgets = {
            'instructions': forms.Textarea(attrs={'rows': 2}),
            'quantity': forms.NumberInput(attrs={'min': '1'}),
            'refills': forms.NumberInput(attrs={'min': '0'}),
        }

MedicationFormSet = forms.inlineformset_factory(
    Prescription, Medication,
    form=MedicationForm,
    extra=1,
    can_delete=True
)

class PrescriptionStatusForm(forms.ModelForm):
    class Meta:
        model = Prescription
        fields = ['status', 'notes']
        widgets = {
            'notes': forms.Textarea(attrs={'rows': 3}),
        } 