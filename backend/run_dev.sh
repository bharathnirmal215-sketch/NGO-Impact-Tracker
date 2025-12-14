#!/bin/bash

# Development server startup script

# Activate virtual environment
source venv/bin/activate

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "Warning: Redis is not running. Please start Redis for Celery to work."
    echo "Start Redis with: redis-server"
    echo "Or use Docker: docker run -d -p 6379:6379 redis:7-alpine"
fi

# Run migrations
python manage.py migrate

# Start Celery worker in background
echo "Starting Celery worker..."
celery -A ngo_tracker worker --loglevel=info &
CELERY_PID=$!

# Start Django server
echo "Starting Django server..."
python manage.py runserver

# Cleanup on exit
trap "kill $CELERY_PID" EXIT

