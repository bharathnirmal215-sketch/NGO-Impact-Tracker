from django.contrib import admin
from .models import Report, BulkUploadJob


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['ngo_id', 'month', 'people_helped', 'events_conducted', 'funds_utilized', 'created_at']
    list_filter = ['month', 'created_at']
    search_fields = ['ngo_id']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(BulkUploadJob)
class BulkUploadJobAdmin(admin.ModelAdmin):
    list_display = ['job_id', 'status', 'total_rows', 'processed_rows', 'successful_rows', 'failed_rows', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['job_id']
    readonly_fields = ['job_id', 'created_at', 'updated_at']

