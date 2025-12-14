from celery import shared_task
from django.db import transaction
from django.utils import timezone
import csv
import io
from datetime import datetime

from .models import Report, BulkUploadJob


def _process_csv_upload_internal(job_id, file_content):
    """Internal function to process CSV upload (can be called directly or via Celery)."""
    job = BulkUploadJob.objects.get(job_id=job_id)
    job.status = 'processing'
    job.save()
    
    successful_rows = 0
    failed_rows = 0
    errors = []
    
    try:
        # Parse CSV
        csv_file = io.StringIO(file_content)
        reader = csv.DictReader(csv_file)
        
        # Get all rows first to count total
        rows = list(reader)
        total_rows = len(rows)
        job.total_rows = total_rows
        job.save()
        
        # Process each row
        for idx, row in enumerate(rows):
            try:
                # Validate required fields
                required_fields = ['ngo_id', 'month', 'people_helped', 'events_conducted', 'funds_utilized']
                missing_fields = [field for field in required_fields if not row.get(field)]
                
                if missing_fields:
                    errors.append(f"Row {idx + 1}: Missing fields: {', '.join(missing_fields)}")
                    failed_rows += 1
                    job.processed_rows = idx + 1
                    job.failed_rows = failed_rows
                    job.save()
                    continue
                
                # Validate month format
                try:
                    datetime.strptime(row['month'], '%Y-%m')
                except ValueError:
                    errors.append(f"Row {idx + 1}: Invalid month format '{row['month']}'. Use YYYY-MM")
                    failed_rows += 1
                    job.processed_rows = idx + 1
                    job.failed_rows = failed_rows
                    job.save()
                    continue
                
                # Validate numeric fields
                try:
                    people_helped = int(row['people_helped'])
                    events_conducted = int(row['events_conducted'])
                    funds_utilized = float(row['funds_utilized'])
                    
                    if people_helped < 0 or events_conducted < 0 or funds_utilized < 0:
                        errors.append(f"Row {idx + 1}: Negative values not allowed")
                        failed_rows += 1
                        job.processed_rows = idx + 1
                        job.failed_rows = failed_rows
                        job.save()
                        continue
                except ValueError as e:
                    errors.append(f"Row {idx + 1}: Invalid numeric values - {str(e)}")
                    failed_rows += 1
                    job.processed_rows = idx + 1
                    job.failed_rows = failed_rows
                    job.save()
                    continue
                
                # Create or update report (idempotent)
                with transaction.atomic():
                    report, created = Report.objects.get_or_create(
                        ngo_id=row['ngo_id'],
                        month=row['month'],
                        defaults={
                            'people_helped': people_helped,
                            'events_conducted': events_conducted,
                            'funds_utilized': funds_utilized,
                        }
                    )
                    
                    if not created:
                        # Update existing report
                        report.people_helped = people_helped
                        report.events_conducted = events_conducted
                        report.funds_utilized = funds_utilized
                        report.save()
                
                successful_rows += 1
                job.processed_rows = idx + 1
                job.successful_rows = successful_rows
                job.save()
                
            except Exception as e:
                errors.append(f"Row {idx + 1}: {str(e)}")
                failed_rows += 1
                job.processed_rows = idx + 1
                job.failed_rows = failed_rows
                job.save()
        
        # Mark job as completed
        job.status = 'completed'
        if errors:
            job.error_message = '\n'.join(errors[:10])  # Store first 10 errors
        job.save()
        
    except Exception as e:
        job.status = 'failed'
        job.error_message = f"Processing failed: {str(e)}"
        job.save()
        raise


@shared_task(bind=True)
def process_csv_upload(self, job_id, file_content):
    """Process CSV file upload asynchronously via Celery."""
    return _process_csv_upload_internal(job_id, file_content)

