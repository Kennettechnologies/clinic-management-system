from django.urls import path
from . import views

app_name = 'appointments'

urlpatterns = [
    path('', views.appointment_list, name='appointment_list'),
    path('<int:pk>/', views.appointment_detail, name='appointment_detail'),
    path('create/', views.appointment_create, name='appointment_create'),
    path('<int:pk>/update/', views.appointment_update, name='appointment_update'),
    path('<int:pk>/status/', views.appointment_status_update, name='appointment_status_update'),
    path('<int:pk>/reschedule/', views.appointment_reschedule, name='appointment_reschedule'),
    path('<int:pk>/reminder/', views.appointment_reminder_create, name='appointment_reminder_create'),
    path('<int:pk>/cancel/', views.appointment_cancel, name='appointment_cancel'),
    path('doctor/', views.doctor_appointments, name='doctor_appointments'),
    path('patient/', views.patient_appointments, name='patient_appointments'),
] 