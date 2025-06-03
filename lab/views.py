from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils.translation import gettext_lazy as _
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils import timezone
from .models import (
    LabTestType, LabTestRequest, LabReport,
    LabTestResult, LabTestAttachment
)
from .forms import (
    LabTestTypeForm, LabTestRequestForm, LabReportForm,
    LabTestResultFormSet, LabTestAttachmentForm,
    LabTestRequestFilterForm
)
from .permissions import (
    has_lab_permission, can_access_patient_data,
    can_manage_lab_tests
)

@login_required
@has_lab_permission('view_lab_tests')
def test_type_list(request):
    """View for listing lab test types"""
    test_types = LabTestType.objects.all()
    return render(request, 'lab/test_type_list.html', {'test_types': test_types})

@login_required
@has_lab_permission('manage_lab_tests')
def test_type_create(request):
    """View for creating new lab test types"""
    if request.method == 'POST':
        form = LabTestTypeForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Lab test type created successfully.')
            return redirect('lab:test_type_list')
    else:
        form = LabTestTypeForm()
    return render(request, 'lab/test_type_form.html', {'form': form})

@login_required
@has_lab_permission('manage_lab_tests')
def test_type_update(request, pk):
    """View for updating lab test types"""
    test_type = get_object_or_404(LabTestType, pk=pk)
    if request.method == 'POST':
        form = LabTestTypeForm(request.POST, instance=test_type)
        if form.is_valid():
            form.save()
            messages.success(request, 'Lab test type updated successfully.')
            return redirect('lab:test_type_list')
    else:
        form = LabTestTypeForm(instance=test_type)
    return render(request, 'lab/test_type_form.html', {'form': form})

@login_required
@has_lab_permission('request_lab_tests')
@can_access_patient_data
def test_request_create(request):
    """View for creating new lab test requests"""
    if request.method == 'POST':
        form = LabTestRequestForm(request.POST)
        if form.is_valid():
            test_request = form.save(commit=False)
            test_request.requesting_doctor = request.user
            test_request.save()
            messages.success(request, _('Lab test request created successfully.'))
            return redirect('lab:test_request_detail', pk=test_request.pk)
    else:
        form = LabTestRequestForm()
    return render(request, 'lab/test_request_form.html', {'form': form})

@login_required
def test_request_list(request):
    filter_form = LabTestRequestFilterForm(request.GET)
    test_requests = LabTestRequest.objects.all()

    if filter_form.is_valid():
        if status := filter_form.cleaned_data.get('status'):
            test_requests = test_requests.filter(status=status)
        if priority := filter_form.cleaned_data.get('priority'):
            test_requests = test_requests.filter(priority=priority)
        if date_from := filter_form.cleaned_data.get('date_from'):
            test_requests = test_requests.filter(scheduled_date__date__gte=date_from)
        if date_to := filter_form.cleaned_data.get('date_to'):
            test_requests = test_requests.filter(scheduled_date__date__lte=date_to)

    # Filter based on user role
    if request.user.role == 'receptionist':
        test_requests = test_requests.filter(status='pending')
    elif request.user.role == 'lab_technician':
        test_requests = test_requests.filter(status__in=['pending', 'in_progress'])

    # Pagination
    paginator = Paginator(test_requests, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'test_requests': page_obj,
        'filter_form': filter_form,
        'is_paginated': page_obj.has_other_pages(),
        'page_obj': page_obj,
    }
    return render(request, 'lab/test_request_list.html', context)

@login_required
@has_lab_permission('view_lab_tests')
@can_access_patient_data
def test_request_detail(request, pk):
    """View for displaying lab test request details"""
    test_request = get_object_or_404(LabTestRequest, pk=pk)
    
    # Check if user has permission to view this specific request
    if request.user.role == 'doctor' and test_request.requesting_doctor != request.user:
        raise PermissionDenied('You do not have permission to view this test request.')
    
    return render(request, 'lab/test_request_detail.html', {'test_request': test_request})

@login_required
@has_lab_permission('process_lab_tests')
def test_request_update_status(request, pk):
    """View for updating lab test request status"""
    test_request = get_object_or_404(LabTestRequest, pk=pk)
    if request.method == 'POST':
        status = request.POST.get('status')
        if status in dict(LabTestRequest.STATUS_CHOICES):
            test_request.status = status
            if status == 'completed':
                test_request.completed_date = timezone.now()
            test_request.save()
            messages.success(request, _('Test request status updated successfully.'))
    return redirect('lab:test_request_detail', pk=test_request.pk)

@login_required
@has_lab_permission('manage_lab_reports')
@can_access_patient_data
def report_upload(request, pk):
    """View for uploading lab test reports"""
    test_request = get_object_or_404(LabTestRequest, pk=pk)
    
    if request.method == 'POST':
        form = LabReportForm(request.POST, request.FILES)
        result_formset = LabTestResultFormSet(request.POST)
        
        if form.is_valid() and result_formset.is_valid():
            report = form.save(commit=False)
            report.test_request = test_request
            report.uploaded_by = request.user
            report.save()
            
            # Save test results
            result_formset.instance = report
            result_formset.save()
            
            # Update test request status
            test_request.status = 'completed'
            test_request.completed_date = timezone.now()
            test_request.save()
            
            messages.success(request, _('Lab report uploaded successfully.'))
            return redirect('lab:test_request_detail', pk=test_request.pk)
    else:
        form = LabReportForm()
        result_formset = LabTestResultFormSet()
    
    context = {
        'form': form,
        'result_formset': result_formset,
        'test_request': test_request,
    }
    return render(request, 'lab/report_upload.html', context)

@login_required
@has_lab_permission('manage_lab_reports')
@can_access_patient_data
def attachment_upload(request, pk):
    """View for uploading additional attachments to lab reports"""
    report = get_object_or_404(LabReport, pk=pk)
    
    if request.method == 'POST':
        form = LabTestAttachmentForm(request.POST, request.FILES)
        if form.is_valid():
            attachment = form.save(commit=False)
            attachment.report = report
            attachment.uploaded_by = request.user
            attachment.save()
            messages.success(request, _('Attachment uploaded successfully.'))
            return redirect('lab:test_request_detail', pk=report.test_request.pk)
    else:
        form = LabTestAttachmentForm()
    
    return render(request, 'lab/attachment_upload.html', {
        'form': form,
        'report': report
    })

@login_required
def attachment_delete(request, pk):
    attachment = get_object_or_404(LabTestAttachment, pk=pk)
    if request.method == 'POST':
        test_request_pk = attachment.report.test_request.pk
        attachment.delete()
        messages.success(request, _('Attachment deleted successfully.'))
        return redirect('lab:test_request_detail', pk=test_request_pk)
    return redirect('lab:test_request_list')

def test_request_update(request, pk):
    test_request = get_object_or_404(LabTestRequest, pk=pk)
    if request.method == 'POST':
        form = LabTestRequestForm(request.POST, instance=test_request)
        if form.is_valid():
            form.save()
            messages.success(request, 'Lab test request updated successfully!')
            return redirect('lab:test_request_detail', pk=test_request.pk)
    else:
        form = LabTestRequestForm(instance=test_request)
    return render(request, 'lab/test_request_form.html', {'form': form}) 