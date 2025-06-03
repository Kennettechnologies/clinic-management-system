from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

class LabTestType(models.Model):
    """Model for different types of lab tests"""
    name = models.CharField(_("Name"), max_length=100)
    code = models.CharField(_("Code"), max_length=20, unique=True)
    description = models.TextField(_("Description"), blank=True)
    price = models.DecimalField(_("Price"), max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    preparation_instructions = models.TextField(_("Preparation Instructions"), blank=True)
    turnaround_time = models.PositiveIntegerField(_("Turnaround Time (hours)"))
    is_active = models.BooleanField(_("Active"), default=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    class Meta:
        verbose_name = _("Lab Test Type")
        verbose_name_plural = _("Lab Test Types")
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"

class LabTestRequest(models.Model):
    """Model for lab test requests"""
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('in_progress', _('In Progress')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
    ]

    PRIORITY_CHOICES = [
        ('normal', _('Normal')),
        ('high', _('High')),
        ('urgent', _('Urgent')),
    ]

    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, verbose_name=_("Patient"))
    test_type = models.ForeignKey(LabTestType, on_delete=models.PROTECT, verbose_name=_("Test Type"))
    requesting_doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, verbose_name=_("Requesting Doctor"))
    status = models.CharField(_("Status"), max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(_("Priority"), max_length=20, choices=PRIORITY_CHOICES, default='normal')
    clinical_notes = models.TextField(_("Clinical Notes"), blank=True)
    request_date = models.DateTimeField(_("Request Date"), auto_now_add=True)
    scheduled_date = models.DateTimeField(_("Scheduled Date"))
    completed_date = models.DateTimeField(_("Completed Date"), null=True, blank=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    class Meta:
        verbose_name = _("Lab Test Request")
        verbose_name_plural = _("Lab Test Requests")
        ordering = ['-request_date']

    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.test_type.name}"

    @property
    def is_overdue(self):
        if self.scheduled_date and self.status not in ['completed', 'cancelled']:
            return timezone.now() > self.scheduled_date
        return False

class LabReport(models.Model):
    """Model for lab test reports"""
    test_request = models.OneToOneField(LabTestRequest, on_delete=models.CASCADE, related_name='report', verbose_name=_("Test Request"))
    report_file = models.FileField(_("Report File"), upload_to='lab_reports/')
    results = models.TextField(_("Results"))
    reference_range = models.TextField(_("Reference Range"), blank=True)
    interpretation = models.TextField(_("Interpretation"), blank=True)
    is_abnormal = models.BooleanField(_("Abnormal Results"), default=False)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, verbose_name=_("Uploaded By"))
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    class Meta:
        verbose_name = _("Lab Report")
        verbose_name_plural = _("Lab Reports")
        ordering = ['-created_at']

    def __str__(self):
        return f"Report for {self.test_request}"

    def save(self, *args, **kwargs):
        # Update test request status when report is uploaded
        if not self.test_request.completed_date:
            self.test_request.status = 'completed'
            self.test_request.completed_date = timezone.now()
            self.test_request.save()
        super().save(*args, **kwargs)

class LabTestResult(models.Model):
    """Model for individual test results within a report"""
    test_request = models.ForeignKey(LabTestRequest, on_delete=models.CASCADE, related_name='results')
    report = models.ForeignKey(LabReport, on_delete=models.CASCADE, related_name='test_results')
    parameter = models.CharField(_("Parameter"), max_length=100)
    value = models.CharField(_("Value"), max_length=50)
    unit = models.CharField(_("Unit"), max_length=20)
    reference_range = models.CharField(_("Reference Range"), max_length=100)
    is_abnormal = models.BooleanField(_("Abnormal"), default=False)
    notes = models.TextField(_("Notes"), blank=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    class Meta:
        verbose_name = _("Lab Test Result")
        verbose_name_plural = _("Lab Test Results")
        ordering = ['parameter']

    def __str__(self):
        return f"{self.test_request} - {self.created_at}"

class LabTestAttachment(models.Model):
    """Model for additional attachments to lab reports"""
    report = models.ForeignKey(LabReport, on_delete=models.CASCADE, related_name='attachments', verbose_name=_("Report"))
    file = models.FileField(_("File"), upload_to='lab_attachments/')
    description = models.CharField(_("Description"), max_length=200, blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, verbose_name=_("Uploaded By"))
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    class Meta:
        verbose_name = _("Lab Test Attachment")
        verbose_name_plural = _("Lab Test Attachments")
        ordering = ['-created_at']

    def __str__(self):
        return self.description or self.file.name 