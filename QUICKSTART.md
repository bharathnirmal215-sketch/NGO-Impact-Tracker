# Quick Start Guide

## Fastest Way to Get Started (Docker)

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Run migrations:**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin: http://localhost:8000/admin

## Manual Setup (5 minutes)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser  # Optional
```

**Start Redis** (required for Celery):
```bash
# Option 1: Docker
docker run -d -p 6379:6379 redis:7-alpine

# Option 2: Install locally
# macOS: brew install redis && brew services start redis
# Linux: sudo apt-get install redis && sudo systemctl start redis
```

**Start Celery worker** (new terminal):
```bash
cd backend
source venv/bin/activate
celery -A ngo_tracker worker --loglevel=info
```

**Start Django** (new terminal):
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

## Testing the Application

1. **Submit a single report:**
   - Go to http://localhost:3000/submit-report
   - Fill in the form and submit

2. **Upload bulk CSV:**
   - Go to http://localhost:3000/bulk-upload
   - Use the provided `sample_data.csv` file
   - Upload and watch the progress

3. **View dashboard:**
   - Go to http://localhost:3000/dashboard
   - Enter a month (e.g., "2024-01")
   - Click "Load Data"

## Sample API Calls

### Submit Report
```bash
curl -X POST http://localhost:8000/api/report \
  -H "Content-Type: application/json" \
  -d '{
    "ngo_id": "NGO001",
    "month": "2024-01",
    "people_helped": 150,
    "events_conducted": 5,
    "funds_utilized": 50000.00
  }'
```

### Get Dashboard Data
```bash
curl http://localhost:8000/api/dashboard?month=2024-01
```

### Upload CSV
```bash
curl -X POST http://localhost:8000/api/reports/upload \
  -F "file=@sample_data.csv"
```

## Troubleshooting

**Celery not processing tasks?**
- Make sure Redis is running: `redis-cli ping`
- Check Celery worker logs for errors

**Database errors?**
- Run migrations: `python manage.py migrate`
- Check database settings in `.env`

**Frontend can't connect to backend?**
- Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Check CORS settings in `backend/ngo_tracker/settings.py`
- Ensure backend is running on port 8000

