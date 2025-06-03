from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from django.http import HttpResponse
from django.template.loader import render_to_string
from weasyprint import HTML
from .models import Patient, MedicalRecord, PatientFile, Prescription, PrescriptionItem
from .forms import PatientForm, MedicalRecordForm, PatientFileForm, PrescriptionForm, PrescriptionItemFormSet
from accounts.decorators import role_required

@login_required
@role_required(['admin', 'doctor', 'receptionist'])
def patient_list(request):
    search_query = request.GET.get('search', '')
    if search_query:
        patients = Patient.objects.filter(
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query) |
            Q(phone__icontains=search_query)
        )
    else:
        patients = Patient.objects.all()
    return render(request, 'patients/patient_list.html', {'patients': patients})

@login_required
@role_required(['admin', 'doctor', 'receptionist'])
def patient_create(request):
    if request.method == 'POST':
        form = PatientForm(request.POST)
        if form.is_valid():
            patient = form.save(commit=False)
            patient.created_by = request.user
            patient.save()
            messages.success(request, 'Patient record created successfully.')
            return redirect('patients:patient_detail', pk=patient.pk)
    else:
        form = PatientForm()
    return render(request, 'patients/patient_form.html', {'form': form})

@login_required
@role_required(['admin', 'doctor', 'receptionist'])
def patient_update(request, pk):
    patient = get_object_or_404(Patient, pk=pk)
    if request.method == 'POST':
        form = PatientForm(request.POST, instance=patient)
        if form.is_valid():
            form.save()
            messages.success(request, 'Patient record updated successfully.')
            return redirect('patients:patient_detail', pk=patient.pk)
    else:
        form = PatientForm(instance=patient)
    return render(request, 'patients/patient_form.html', {'form': form})

@login_required
@role_required(['admin', 'doctor', 'receptionist'])
def patient_detail(request, pk):
    patient = get_object_or_404(Patient, pk=pk)
    medical_records = patient.medical_records.all()
    files = patient.files.all()
    return render(request, 'patients/patient_detail.html', {
        'patient': patient,
        'medical_records': medical_records,
        'files': files
    })

@login_required
@role_required(['admin', 'doctor'])
def medical_record_create(request, patient_pk):
    patient = get_object_or_404(Patient, pk=patient_pk)
    if request.method == 'POST':
        form = MedicalRecordForm(request.POST)
        if form.is_valid():
            record = form.save(commit=False)
            record.patient = patient
            record.created_by = request.user
            record.save()
            messages.success(request, 'Medical record added successfully.')
            return redirect('patients:patient_detail', pk=patient.pk)
    else:
        form = MedicalRecordForm()
    return render(request, 'patients/medical_record_form.html', {
        'form': form,
        'patient': patient
    })

@login_required
@role_required(['admin', 'doctor'])
def medical_record_update(request, pk):
    record = get_object_or_404(MedicalRecord, pk=pk)
    if request.method == 'POST':
        form = MedicalRecordForm(request.POST, instance=record)
        if form.is_valid():
            form.save()
            messages.success(request, 'Medical record updated successfully.')
            return redirect('patients:patient_detail', pk=record.patient.pk)
    else:
        form = MedicalRecordForm(instance=record)
    return render(request, 'patients/medical_record_form.html', {
        'form': form,
        'patient': record.patient
    })

@login_required
@role_required(['admin', 'doctor', 'receptionist'])
def patient_file_upload(request, patient_pk):
    patient = get_object_or_404(Patient, pk=patient_pk)
    if request.method == 'POST':
        form = PatientFileForm(request.POST, request.FILES)
        if form.is_valid():
            file = form.save(commit=False)
            file.patient = patient
            file.uploaded_by = request.user
            file.save()
            messages.success(request, 'File uploaded successfully.')
            return redirect('patients:patient_detail', pk=patient.pk)
    else:
        form = PatientFileForm()
    return render(request, 'patients/patient_file_form.html', {
        'form': form,
        'patient': patient
    })

@login_required
@role_required(['admin', 'doctor', 'receptionist'])
def patient_file_delete(request, pk):
    file = get_object_or_404(PatientFile, pk=pk)
    patient_pk = file.patient.pk
    file.delete()
    messages.success(request, 'File deleted successfully.')
    return redirect('patients:patient_detail', pk=patient_pk)

@login_required
@role_required(['admin', 'doctor'])
def prescription_create(request, patient_pk):
    patient = get_object_or_404(Patient, pk=patient_pk)
    if request.method == 'POST':
        form = PrescriptionForm(request.POST)
        if form.is_valid():
            prescription = form.save(commit=False)
            prescription.patient = patient
            prescription.doctor = request.user
            prescription.save()
            
            formset = PrescriptionItemFormSet(request.POST, instance=prescription)
            if formset.is_valid():
                formset.save()
                messages.success(request, 'Prescription created successfully.')
                return redirect('patients:prescription_detail', pk=prescription.pk)
    else:
        form = PrescriptionForm()
        formset = PrescriptionItemFormSet()
    
    return render(request, 'patients/prescription_form.html', {
        'form': form,
        'formset': formset,
        'patient': patient
    })

@login_required
@role_required(['admin', 'doctor'])
def prescription_detail(request, pk):
    prescription = get_object_or_404(Prescription, pk=pk)
    return render(request, 'patients/prescription_detail.html', {
        'prescription': prescription
    })

@login_required
@role_required(['admin', 'doctor'])
def prescription_print(request, pk):
    prescription = get_object_or_404(Prescription, pk=pk)
    html_string = render_to_string('patients/prescription_print.html', {
        'prescription': prescription
    })
    
    html = HTML(string=html_string)
    pdf = html.write_pdf()
    
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="prescription_{prescription.pk}.pdf"'
    return response 