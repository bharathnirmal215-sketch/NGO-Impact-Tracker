from rest_framework import serializers
from .models import Report, BulkUploadJob


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'ngo_id', 'month', 'people_helped', 'events_conducted', 'funds_utilized', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_month(self, value):
        """Validate month format (YYYY-MM)."""
        try:
            year, month = value.split('-')
            if len(year) != 4 or len(month) != 2:
                raise serializers.ValidationError("Month must be in YYYY-MM format")
            if not (1 <= int(month) <= 12):
                raise serializers.ValidationError("Month must be between 01 and 12")
        except ValueError:
            raise serializers.ValidationError("Month must be in YYYY-MM format")
        return value


class BulkUploadJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = BulkUploadJob
        fields = ['job_id', 'status', 'total_rows', 'processed_rows', 'successful_rows', 'failed_rows', 'error_message', 'created_at', 'updated_at']
        read_only_fields = ['job_id', 'status', 'total_rows', 'processed_rows', 'successful_rows', 'failed_rows', 'error_message', 'created_at', 'updated_at']


class DashboardSerializer(serializers.Serializer):
    month = serializers.CharField()
    total_ngos_reporting = serializers.IntegerField()
    total_people_helped = serializers.IntegerField()
    total_events_conducted = serializers.IntegerField()
    total_funds_utilized = serializers.DecimalField(max_digits=15, decimal_places=2)
    reports = ReportSerializer(many=True, read_only=True)

