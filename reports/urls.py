from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    path('', views.report_list, name='report_list'),
    path('appointments/', views.appointment_report, name='appointment_report'),
    path('revenue/', views.revenue_report, name='revenue_report'),
    path('demographics/', views.patient_demographics, name='patient_demographics'),
] 