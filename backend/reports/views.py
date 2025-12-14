from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q
from django.db import transaction
from django.utils import timezone
from datetime import datetime
import uuid
import csv
import io

from .models import Report, BulkUploadJob
from .serializers import ReportSerializer, BulkUploadJobSerializer, DashboardSerializer
from .tasks import process_csv_upload


@api_view(['POST'])
def submit_report(request):
    """Submit a single monthly report."""
    serializer = ReportSerializer(data=request.data)
    if serializer.is_valid():
        ngo_id = serializer.validated_data['ngo_id']
        month = serializer.validated_data['month']
        
        # Use get_or_create for idempotency
        report, created = Report.objects.get_or_create(
            ngo_id=ngo_id,
            month=month,
            defaults=serializer.validated_data
        )
        
        if not created:
            # Update existing report
            for key, value in serializer.validated_data.items():
                setattr(report, key, value)
            report.save()
        
        return Response(ReportSerializer(report).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BulkUploadView(APIView):
    """Handle bulk CSV upload for reports."""
    
    def post(self, request):
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        
        # Validate file type
        if not file.name.endswith('.csv'):
            return Response({'error': 'File must be a CSV'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate job ID
        job_id = str(uuid.uuid4())
        
        # Read file content
        try:
            file_content = file.read().decode('utf-8')
        except UnicodeDecodeError:
            return Response({'error': 'File must be UTF-8 encoded'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create job record
        job = BulkUploadJob.objects.create(
            job_id=job_id,
            status='pending',
            total_rows=0,
        )
        
        # Process CSV synchronously (for now, since Redis/Celery not set up)
        # This processes immediately without background workers
        print(f"Starting synchronous CSV processing for job {job_id}")  # Debug
        try:
            from .tasks import _process_csv_upload_internal
            
            # Call the internal function directly (synchronous)
            print(f"Calling _process_csv_upload_internal for job {job_id}")  # Debug
            _process_csv_upload_internal(job_id, file_content)
            print(f"Processing completed for job {job_id}")  # Debug
            
            # Refresh job from database to get latest status
            job.refresh_from_db()
            print(f"Job status after processing: {job.status}")  # Debug
            
            # Return completed status immediately
            response_data = {
                'job_id': job_id,
                'status': job.status,
                'total_rows': job.total_rows,
                'processed_rows': job.processed_rows,
                'successful_rows': job.successful_rows,
                'failed_rows': job.failed_rows,
                'error_message': job.error_message if job.error_message else None,
                'message': 'Upload processed successfully'
            }
            print(f"Returning response: {response_data}")  # Debug
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as sync_error:
            import traceback
            error_trace = traceback.format_exc()
            print(f"ERROR processing CSV: {error_trace}")  # Debug log
            
            # Update job status to failed
            try:
                job.status = 'failed'
                job.error_message = str(sync_error)
                job.save()
            except Exception as save_error:
                print(f"ERROR saving job status: {save_error}")
            
            return Response({
                'error': f'Processing failed: {str(sync_error)}',
                'job_id': job_id,
                'status': 'failed',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def job_status(request, job_id):
    """Get the status of a bulk upload job."""
    try:
        job = BulkUploadJob.objects.get(job_id=job_id)
        serializer = BulkUploadJobSerializer(job)
        return Response(serializer.data)
    except BulkUploadJob.DoesNotExist:
        return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def dashboard(request):
    """Get aggregated dashboard data for a specific month."""
    month = request.query_params.get('month')
    
    if not month:
        return Response({'error': 'Month parameter is required (format: YYYY-MM)'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Trim whitespace
    month = month.strip()
    
    # Validate month format
    try:
        datetime.strptime(month, '%Y-%m')
    except ValueError as e:
        # More detailed error message
        return Response({
            'error': f'Invalid month format. Use YYYY-MM (received: "{month}")'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Aggregate data for the month
    reports = Report.objects.filter(month=month)
    
    aggregated = reports.aggregate(
        total_ngos_reporting=Count('ngo_id', distinct=True),
        total_people_helped=Sum('people_helped'),
        total_events_conducted=Sum('events_conducted'),
        total_funds_utilized=Sum('funds_utilized'),
    )
    
    # Get individual reports
    individual_reports = reports.order_by('ngo_id')
    
    # Serialize individual reports
    reports_serializer = ReportSerializer(individual_reports, many=True)
    
    # Handle None values
    data = {
        'month': month,
        'total_ngos_reporting': aggregated['total_ngos_reporting'] or 0,
        'total_people_helped': aggregated['total_people_helped'] or 0,
        'total_events_conducted': aggregated['total_events_conducted'] or 0,
        'total_funds_utilized': float(aggregated['total_funds_utilized'] or 0),
        'reports': reports_serializer.data,
    }
    
    serializer = DashboardSerializer(data)
    return Response(serializer.data)

