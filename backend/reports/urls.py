from django.urls import path
from . import views

urlpatterns = [
    path('report', views.submit_report, name='submit_report'),
    path('reports/upload', views.BulkUploadView.as_view(), name='bulk_upload'),
    path('job-status/<str:job_id>', views.job_status, name='job_status'),
    path('dashboard', views.dashboard, name='dashboard'),
]

