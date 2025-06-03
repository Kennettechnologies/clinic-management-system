from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.db.models import Sum
from .models import Invoice, Payment
from .forms import InvoiceForm, InvoiceItemFormSet, PaymentForm
from accounts.decorators import can_manage_billing, role_required

@can_manage_billing
def invoice_list(request):
    if request.user.user_type == 'patient':
        invoices = Invoice.objects.filter(patient__user=request.user)
    else:
        invoices = Invoice.objects.all()
    return render(request, 'billing/invoice_list.html', {'invoices': invoices})

@can_manage_billing
def invoice_detail(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk)
    payments = invoice.payments.all()
    total_paid = payments.aggregate(Sum('amount'))['amount__sum'] or 0
    remaining_balance = invoice.total_amount - total_paid
    
    context = {
        'invoice': invoice,
        'payments': payments,
        'total_paid': total_paid,
        'remaining_balance': remaining_balance,
    }
    return render(request, 'billing/invoice_detail.html', context)

@role_required(['admin', 'receptionist'])
def invoice_create(request):
    if request.method == 'POST':
        form = InvoiceForm(request.POST)
        if form.is_valid():
            invoice = form.save(commit=False)
            invoice.created_by = request.user
            invoice.save()
            
            formset = InvoiceItemFormSet(request.POST, instance=invoice)
            if formset.is_valid():
                formset.save()
                invoice.total_amount = sum(item.total for item in invoice.items.all())
                invoice.save()
                messages.success(request, 'Invoice created successfully!')
                return redirect('billing:invoice_detail', pk=invoice.pk)
    else:
        form = InvoiceForm()
        formset = InvoiceItemFormSet()
    
    return render(request, 'billing/invoice_form.html', {
        'form': form,
        'formset': formset
    })

@role_required(['admin', 'receptionist'])
def invoice_update(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk)
    if request.method == 'POST':
        form = InvoiceForm(request.POST, instance=invoice)
        if form.is_valid():
            invoice = form.save()
            
            formset = InvoiceItemFormSet(request.POST, instance=invoice)
            if formset.is_valid():
                formset.save()
                invoice.total_amount = sum(item.total for item in invoice.items.all())
                invoice.save()
                messages.success(request, 'Invoice updated successfully!')
                return redirect('billing:invoice_detail', pk=invoice.pk)
    else:
        form = InvoiceForm(instance=invoice)
        formset = InvoiceItemFormSet(instance=invoice)
    
    return render(request, 'billing/invoice_form.html', {
        'form': form,
        'formset': formset
    })

@role_required(['admin', 'receptionist'])
def payment_create(request, invoice_pk):
    invoice = get_object_or_404(Invoice, pk=invoice_pk)
    if request.method == 'POST':
        form = PaymentForm(request.POST)
        if form.is_valid():
            payment = form.save(commit=False)
            payment.invoice = invoice
            payment.created_by = request.user
            payment.save()
            
            # Update invoice status if fully paid
            total_paid = invoice.payments.aggregate(Sum('amount'))['amount__sum'] or 0
            if total_paid >= invoice.total_amount:
                invoice.status = 'paid'
                invoice.save()
            
            messages.success(request, 'Payment recorded successfully!')
            return redirect('billing:invoice_detail', pk=invoice.pk)
    else:
        form = PaymentForm()
    
    return render(request, 'billing/payment_form.html', {
        'form': form,
        'invoice': invoice
    }) 