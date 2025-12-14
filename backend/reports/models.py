from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone


class Report(models.Model):
    """Monthly report submitted by an NGO."""
    ngo_id = models.CharField(max_length=100, db_index=True)
    month = models.CharField(max_length=7, help_text="Format: YYYY-MM", db_index=True)
    people_helped = models.IntegerField(validators=[MinValueValidator(0)])
    events_conducted = models.IntegerField(validators=[MinValueValidator(0)])
    funds_utilized = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['ngo_id', 'month']]  # Ensures idempotency
        indexes = [
            models.Index(fields=['ngo_id', 'month']),
            models.Index(fields=['month']),
        ]

    def __str__(self):
        return f"{self.ngo_id} - {self.month}"


class BulkUploadJob(models.Model):
    """Tracks bulk CSV upload processing jobs."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    job_id = models.CharField(max_length=100, unique=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_rows = models.IntegerField(default=0)
    processed_rows = models.IntegerField(default=0)
    successful_rows = models.IntegerField(default=0)
    failed_rows = models.IntegerField(default=0)
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Job {self.job_id} - {self.status}"

