from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import Prescription, PrescriptionHistory
from .forms import PrescriptionForm, MedicationFormSet, PrescriptionStatusForm
from accounts.decorators import role_required, can_add_notes

@role_required(['admin', 'doctor', 'receptionist', 'patient'])
def prescription_list(request):
    if request.user.user_type == 'doctor':
        prescriptions = Prescription.objects.filter(doctor=request.user)
    elif request.user.user_type == 'patient':
        prescriptions = Prescription.objects.filter(patient__user=request.user)
    else:
        prescriptions = Prescription.objects.all()
    return render(request, 'prescriptions/prescription_list.html', {'prescriptions': prescriptions})

@role_required(['admin', 'doctor', 'receptionist', 'patient'])
def prescription_detail(request, pk):
    prescription = get_object_or_404(Prescription, pk=pk)
    if request.user.user_type == 'patient' and prescription.patient.user != request.user:
        messages.error(request, 'You can only view your own prescriptions.')
        return redirect('home')
    if request.user.user_type == 'doctor' and prescription.doctor != request.user:
        messages.error(request, 'You can only view prescriptions you created.')
        return redirect('home')
    
    context = {
        'prescription': prescription,
        'medications': prescription.medications.all(),
        'history': prescription.history.all().order_by('-date_changed'),
    }
    return render(request, 'prescriptions/prescription_detail.html', context)

@can_add_notes
def prescription_create(request):
    if request.method == 'POST':
        form = PrescriptionForm(request.POST)
        if form.is_valid():
            prescription = form.save(commit=False)
            prescription.doctor = request.user
            prescription.save()
            
            formset = MedicationFormSet(request.POST, instance=prescription)
            if formset.is_valid():
                formset.save()
                messages.success(request, 'Prescription created successfully!')
                return redirect('prescriptions:prescription_detail', pk=prescription.pk)
    else:
        form = PrescriptionForm()
        formset = MedicationFormSet()
    
    return render(request, 'prescriptions/prescription_form.html', {
        'form': form,
        'formset': formset
    })

@can_add_notes
def prescription_update(request, pk):
    prescription = get_object_or_404(Prescription, pk=pk)
    if request.user.user_type == 'doctor' and prescription.doctor != request.user:
        messages.error(request, 'You can only update prescriptions you created.')
        return redirect('home')
    
    if request.method == 'POST':
        form = PrescriptionForm(request.POST, instance=prescription)
        if form.is_valid():
            prescription = form.save()
            
            formset = MedicationFormSet(request.POST, instance=prescription)
            if formset.is_valid():
                formset.save()
                messages.success(request, 'Prescription updated successfully!')
                return redirect('prescriptions:prescription_detail', pk=prescription.pk)
    else:
        form = PrescriptionForm(instance=prescription)
        formset = MedicationFormSet(instance=prescription)
    
    return render(request, 'prescriptions/prescription_form.html', {
        'form': form,
        'formset': formset
    })

@can_add_notes
def prescription_status_update(request, pk):
    prescription = get_object_or_404(Prescription, pk=pk)
    if request.user.user_type == 'doctor' and prescription.doctor != request.user:
        messages.error(request, 'You can only update prescriptions you created.')
        return redirect('home')
    
    if request.method == 'POST':
        form = PrescriptionStatusForm(request.POST, instance=prescription)
        if form.is_valid():
            old_status = prescription.status
            prescription = form.save()
            
            # Record status change in history
            if old_status != prescription.status:
                PrescriptionHistory.objects.create(
                    prescription=prescription,
                    status=prescription.status,
                    notes=form.cleaned_data['notes'],
                    changed_by=request.user
                )
            
            messages.success(request, 'Prescription status updated successfully!')
            return redirect('prescriptions:prescription_detail', pk=prescription.pk)
    else:
        form = PrescriptionStatusForm(instance=prescription)
    
    return render(request, 'prescriptions/prescription_status_form.html', {
        'form': form,
        'prescription': prescription
    }) 