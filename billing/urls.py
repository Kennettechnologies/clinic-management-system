from django.urls import path
from . import views

app_name = 'billing'

urlpatterns = [
    # Charges
    path('charges/', views.charge_list, name='charge_list'),
    path('charges/create/', views.charge_create, name='charge_create'),
    path('charges/<int:pk>/update/', views.charge_update, name='charge_update'),
    
    # Invoices
    path('invoices/', views.invoice_list, name='invoice_list'),
    path('invoices/create/', views.invoice_create, name='invoice_create'),
    path('invoices/<int:pk>/', views.invoice_detail, name='invoice_detail'),
    path('invoices/<int:pk>/update/', views.invoice_update, name='invoice_update'),
    path('invoices/<int:pk>/pdf/', views.invoice_pdf, name='invoice_pdf'),
] 