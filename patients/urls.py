from django.urls import path
from . import views

app_name = 'patients'

urlpatterns = [
    path('', views.patient_list, name='patient_list'),
    path('create/', views.patient_create, name='patient_create'),
    path('<int:pk>/', views.patient_detail, name='patient_detail'),
    path('<int:pk>/update/', views.patient_update, name='patient_update'),
    
    # Medical Records
    path('<int:patient_pk>/medical-records/create/', views.medical_record_create, name='medical_record_create'),
    path('medical-records/<int:pk>/update/', views.medical_record_update, name='medical_record_update'),
    
    # Patient Files
    path('<int:patient_pk>/files/upload/', views.patient_file_upload, name='patient_file_upload'),
    path('files/<int:pk>/delete/', views.patient_file_delete, name='patient_file_delete'),
    
    # Prescriptions
    path('<int:patient_pk>/prescriptions/create/', views.prescription_create, name='prescription_create'),
    path('prescriptions/<int:pk>/', views.prescription_detail, name='prescription_detail'),
    path('prescriptions/<int:pk>/print/', views.prescription_print, name='prescription_print'),
] 