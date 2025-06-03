from django.urls import path
from . import views

app_name = 'lab'

urlpatterns = [
    # Test Type URLs
    path('test-types/', views.test_type_list, name='test_type_list'),
    path('test-types/create/', views.test_type_create, name='test_type_create'),
    path('test-types/<int:pk>/update/', views.test_type_update, name='test_type_update'),
    
    # Test Request URLs
    path('requests/', views.test_request_list, name='test_request_list'),
    path('requests/create/', views.test_request_create, name='test_request_create'),
    path('requests/<int:pk>/', views.test_request_detail, name='test_request_detail'),
    path('requests/<int:pk>/update/', views.test_request_update, name='test_request_update'),
    path('requests/<int:pk>/update-status/', views.test_request_update_status, name='test_request_update_status'),
    
    # Report URLs
    path('requests/<int:pk>/upload-report/', views.report_upload, name='report_upload'),
    path('reports/<int:pk>/upload-attachment/', views.attachment_upload, name='attachment_upload'),
    path('attachments/<int:pk>/delete/', views.attachment_delete, name='attachment_delete'),
] 