from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from .models import Department, StaffProfile, StaffSchedule
from .forms import DepartmentForm, StaffProfileForm, StaffScheduleFormSet
from accounts.decorators import role_required

@login_required
@role_required(['admin'])
def department_list(request):
    departments = Department.objects.all()
    return render(request, 'staff/department_list.html', {'departments': departments})

@login_required
@role_required(['admin'])
def department_create(request):
    if request.method == 'POST':
        form = DepartmentForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Department created successfully.')
            return redirect('staff:department_list')
    else:
        form = DepartmentForm()
    return render(request, 'staff/department_form.html', {'form': form})

@login_required
@role_required(['admin'])
def department_update(request, pk):
    department = get_object_or_404(Department, pk=pk)
    if request.method == 'POST':
        form = DepartmentForm(request.POST, instance=department)
        if form.is_valid():
            form.save()
            messages.success(request, 'Department updated successfully.')
            return redirect('staff:department_list')
    else:
        form = DepartmentForm(instance=department)
    return render(request, 'staff/department_form.html', {'form': form})

@login_required
@role_required(['admin'])
def staff_list(request):
    search_query = request.GET.get('search', '')
    role_filter = request.GET.get('role', '')
    department_filter = request.GET.get('department', '')

    staff = StaffProfile.objects.all()

    if search_query:
        staff = staff.filter(
            Q(user__first_name__icontains=search_query) |
            Q(user__last_name__icontains=search_query) |
            Q(phone__icontains=search_query)
        )

    if role_filter:
        staff = staff.filter(role=role_filter)

    if department_filter:
        staff = staff.filter(department_id=department_filter)

    departments = Department.objects.all()
    return render(request, 'staff/staff_list.html', {
        'staff': staff,
        'departments': departments
    })

@login_required
@role_required(['admin'])
def staff_create(request):
    if request.method == 'POST':
        form = StaffProfileForm(request.POST, request.FILES)
        if form.is_valid():
            staff = form.save(commit=False)
            staff.user = request.user
            staff.save()
            
            formset = StaffScheduleFormSet(request.POST, instance=staff)
            if formset.is_valid():
                formset.save()
                messages.success(request, 'Staff profile created successfully.')
                return redirect('staff:staff_list')
    else:
        form = StaffProfileForm()
        formset = StaffScheduleFormSet()
    
    return render(request, 'staff/staff_form.html', {
        'form': form,
        'formset': formset
    })

@login_required
@role_required(['admin'])
def staff_update(request, pk):
    staff = get_object_or_404(StaffProfile, pk=pk)
    if request.method == 'POST':
        form = StaffProfileForm(request.POST, request.FILES, instance=staff)
        if form.is_valid():
            form.save()
            
            formset = StaffScheduleFormSet(request.POST, instance=staff)
            if formset.is_valid():
                formset.save()
                messages.success(request, 'Staff profile updated successfully.')
                return redirect('staff:staff_list')
    else:
        form = StaffProfileForm(instance=staff)
        formset = StaffScheduleFormSet(instance=staff)
    
    return render(request, 'staff/staff_form.html', {
        'form': form,
        'formset': formset
    })

@login_required
@role_required(['admin'])
def staff_detail(request, pk):
    staff = get_object_or_404(StaffProfile, pk=pk)
    return render(request, 'staff/staff_detail.html', {'staff': staff}) 