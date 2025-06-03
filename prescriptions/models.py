from django.db import models
from django.conf import settings
from accounts.models import CustomUser
from patients.models import PatientProfile

class Prescription(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE)
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='prescriptions')
    date_prescribed = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    notes = models.TextField(blank=True)
    diagnosis = models.TextField()
    follow_up_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Prescription for {self.patient.user.get_full_name()} - {self.date_prescribed.strftime('%Y-%m-%d')}"

class Medication(models.Model):
    FREQUENCY_CHOICES = [
        ('once', 'Once a day'),
        ('twice', 'Twice a day'),
        ('thrice', 'Three times a day'),
        ('four', 'Four times a day'),
        ('as_needed', 'As needed'),
    ]

    DURATION_UNIT_CHOICES = [
        ('days', 'Days'),
        ('weeks', 'Weeks'),
        ('months', 'Months'),
    ]

    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='medications')
    name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    duration = models.PositiveIntegerField()
    duration_unit = models.CharField(max_length=10, choices=DURATION_UNIT_CHOICES)
    instructions = models.TextField()
    quantity = models.PositiveIntegerField()
    refills = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.name} - {self.dosage}"

class PrescriptionHistory(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='history')
    status = models.CharField(max_length=20, choices=Prescription.STATUS_CHOICES)
    notes = models.TextField(blank=True)
    date_changed = models.DateTimeField(auto_now_add=True)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Status change for {self.prescription} - {self.status}" 