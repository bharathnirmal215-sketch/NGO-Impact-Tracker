# How to Start All Services

## Required Services for Bulk Upload

The bulk CSV upload feature requires:
1. **Django Backend** (already running)
2. **Redis** (message broker for Celery)
3. **Celery Worker** (processes CSV files in background)

## Step-by-Step Instructions

### Terminal 1: Django Backend (Already Running)
```powershell
cd C:\Users\Nirmal\Videos\Project\backend
.\venv\Scripts\activate
python manage.py runserver
```

### Terminal 2: Start Redis
```powershell
# Option 1: Using Docker (Recommended)
docker run -d -p 6379:6379 redis:7-alpine

# Option 2: If you have Redis installed locally
redis-server
```

### Terminal 3: Start Celery Worker
```powershell
cd C:\Users\Nirmal\Videos\Project\backend
.\venv\Scripts\activate
celery -A ngo_tracker worker --loglevel=info
```

### Terminal 4: Frontend (Already Running)
```powershell
cd C:\Users\Nirmal\Videos\Project\frontend
npm run dev
```

## Verify Everything is Running

1. **Check Redis:** Open browser to `http://localhost:6379` (should fail, but means Redis is running)
   - Or run: `docker ps` to see Redis container

2. **Check Celery:** You should see output like:
   ```
   celery@hostname v5.3.4 (singularity)
   ...
   [INFO/MainProcess] Connected to redis://localhost:6379/0
   ```

3. **Test Upload:** Try uploading the CSV file again

## Quick Start Script

If you have Docker, you can start Redis quickly:
```powershell
docker run -d -p 6379:6379 --name redis-ngo redis:7-alpine
```

Then start Celery worker in another terminal.

