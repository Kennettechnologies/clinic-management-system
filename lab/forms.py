from django import forms
from django.utils.translation import gettext_lazy as _
from .models import LabTestType, LabTestRequest, LabReport, LabTestResult, LabTestAttachment

class LabTestTypeForm(forms.ModelForm):
    class Meta:
        model = LabTestType
        fields = ['name', 'code', 'description', 'price', 'preparation_instructions', 'turnaround_time', 'is_active']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
            'preparation_instructions': forms.Textarea(attrs={'rows': 3}),
        }

class LabTestRequestForm(forms.ModelForm):
    class Meta:
        model = LabTestRequest
        fields = ['patient', 'test_type', 'priority', 'clinical_notes', 'scheduled_date']
        widgets = {
            'clinical_notes': forms.Textarea(attrs={'rows': 3}),
            'scheduled_date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['test_type'].queryset = LabTestType.objects.filter(is_active=True)

class LabReportForm(forms.ModelForm):
    class Meta:
        model = LabReport
        fields = ['report_file', 'results', 'reference_range', 'interpretation', 'is_abnormal']
        widgets = {
            'results': forms.Textarea(attrs={'rows': 3}),
            'reference_range': forms.Textarea(attrs={'rows': 3}),
            'interpretation': forms.Textarea(attrs={'rows': 3}),
        }

class LabTestResultForm(forms.ModelForm):
    class Meta:
        model = LabTestResult
        fields = ['parameter', 'value', 'unit', 'reference_range', 'is_abnormal', 'notes']
        widgets = {
            'notes': forms.Textarea(attrs={'rows': 2}),
        }

LabTestResultFormSet = forms.inlineformset_factory(
    LabReport,
    LabTestResult,
    form=LabTestResultForm,
    extra=1,
    can_delete=True
)

class LabTestAttachmentForm(forms.ModelForm):
    class Meta:
        model = LabTestAttachment
        fields = ['file', 'description']

class LabTestRequestFilterForm(forms.Form):
    status = forms.ChoiceField(
        choices=[('', _('All'))] + list(LabTestRequest.STATUS_CHOICES),
        required=False,
        label=_('Status')
    )
    priority = forms.ChoiceField(
        choices=[('', _('All'))] + list(LabTestRequest.PRIORITY_CHOICES),
        required=False,
        label=_('Priority')
    )
    date_from = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'type': 'date'}),
        label=_('From Date')
    )
    date_to = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'type': 'date'}),
        label=_('To Date')
    ) 