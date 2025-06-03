from django.urls import path
from . import views

app_name = 'prescriptions'

urlpatterns = [
    path('', views.prescription_list, name='prescription_list'),
    path('<int:pk>/', views.prescription_detail, name='prescription_detail'),
    path('create/', views.prescription_create, name='prescription_create'),
    path('<int:pk>/update/', views.prescription_update, name='prescription_update'),
    path('<int:pk>/status/', views.prescription_status_update, name='prescription_status_update'),
] 