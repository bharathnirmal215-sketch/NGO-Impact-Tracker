# NGO Impact Tracker

A scalable web application for NGOs to track and report their monthly impact metrics. The system supports individual report submissions, bulk CSV uploads with background processing, and an admin dashboard for viewing aggregated data.

## Tech Stack

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - API development
- **Celery** - Asynchronous task processing
- **Redis** - Message broker and result backend for Celery
- **PostgreSQL** - Primary database (SQLite for local development)
- **Python 3.11+**

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **Axios** - HTTP client

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Redis** - Task queue broker

## Features

✅ **Report Submission Form** - Submit individual monthly reports with validation  
✅ **Bulk CSV Upload** - Upload multiple reports via CSV with async processing  
✅ **Job Status Tracking** - Real-time progress updates for bulk uploads  
✅ **Admin Dashboard** - View aggregated impact data by month  
✅ **Idempotency** - Prevents duplicate reports (same NGO + month)  
✅ **Error Handling** - Graceful handling of partial failures in CSV uploads  
✅ **Background Processing** - CSV files processed asynchronously using Celery  

## Project Structure

```
.
├── backend/
│   ├── ngo_tracker/          # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── celery_app.py
│   ├── reports/              # Main app
│   │   ├── models.py         # Report and BulkUploadJob models
│   │   ├── views.py          # API endpoints
│   │   ├── serializers.py   # DRF serializers
│   │   ├── tasks.py          # Celery tasks for CSV processing
│   │   └── urls.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── pages/
│   │   ├── index.tsx         # Home page
│   │   ├── submit-report.tsx # Report submission form
│   │   ├── bulk-upload.tsx   # CSV upload with job tracking
│   │   └── dashboard.tsx     # Admin dashboard
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (optional, SQLite can be used for local dev)
- Redis (for Celery)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Project
   ```

2. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env if needed
   ```

3. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Run migrations**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

5. **Create superuser (optional)**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin Panel: http://localhost:8000/admin

### Option 2: Local Development Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env - set USE_SQLITE=True for local development
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start Redis** (required for Celery)
   ```bash
   # On macOS with Homebrew
   brew install redis
   brew services start redis
   
   # On Linux
   sudo systemctl start redis
   
   # Or use Docker
   docker run -d -p 6379:6379 redis:7-alpine
   ```

8. **Start Celery worker** (in a separate terminal)
   ```bash
   celery -A ngo_tracker worker --loglevel=info
   ```

9. **Start Django server**
   ```bash
   python manage.py runserver
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local (already included)
   # NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000

## API Endpoints

### Submit Single Report
```http
POST /api/report
Content-Type: application/json

{
  "ngo_id": "NGO001",
  "month": "2024-01",
  "people_helped": 150,
  "events_conducted": 5,
  "funds_utilized": 50000.00
}
```

### Bulk Upload CSV
```http
POST /api/reports/upload
Content-Type: multipart/form-data

file: <CSV file>
```

**Response:**
```json
{
  "job_id": "uuid-here",
  "status": "pending",
  "message": "Upload received, processing started"
}
```

### Get Job Status
```http
GET /api/job-status/{job_id}
```

**Response:**
```json
{
  "job_id": "uuid-here",
  "status": "processing",
  "total_rows": 50,
  "processed_rows": 35,
  "successful_rows": 32,
  "failed_rows": 3,
  "error_message": "..."
}
```

### Get Dashboard Data
```http
GET /api/dashboard?month=2024-01
```

**Response:**
```json
{
  "month": "2024-01",
  "total_ngos_reporting": 10,
  "total_people_helped": 1500,
  "total_events_conducted": 50,
  "total_funds_utilized": 500000.00
}
```

## CSV Format

The bulk upload CSV should have the following format:

```csv
ngo_id,month,people_helped,events_conducted,funds_utilized
NGO001,2024-01,150,5,50000.00
NGO002,2024-01,200,8,75000.00
```

A sample CSV file (`sample_data.csv`) is included in the repository.

## Key Features Explained

### Idempotency
Reports with the same `ngo_id` and `month` combination are treated as updates rather than duplicates. The system uses `get_or_create` to ensure data consistency.

### Background Processing
CSV uploads are processed asynchronously using Celery. This allows:
- Non-blocking API responses
- Progress tracking via job status endpoint
- Handling of large files without timeouts

### Error Handling
- Individual row validation with detailed error messages
- Partial success support (some rows may fail while others succeed)
- Error messages stored in job record for review

## Deployment

### Backend (Django)

**Render / Railway / Heroku:**
1. Set environment variables
2. Run migrations: `python manage.py migrate`
3. Start Celery worker separately
4. Configure Redis addon

**Vercel / Netlify:**
- Not recommended for Django (use Render/Railway instead)

### Frontend (Next.js)

**Vercel (Recommended):**
```bash
cd frontend
vercel
```

**Netlify:**
```bash
cd frontend
npm run build
# Deploy the .next folder
```

**Update API URL:**
Set `NEXT_PUBLIC_API_URL` environment variable to your backend URL.

## Development Notes

### Running Tests
```bash
cd backend
python manage.py test
```

### Database Migrations
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### Celery Monitoring
```bash
# Start Celery worker with logging
celery -A ngo_tracker worker --loglevel=info

# Start Celery beat (for scheduled tasks, if needed)
celery -A ngo_tracker beat --loglevel=info
```

## Future Improvements

With more time, I would add:

1. **Authentication & Authorization**
   - JWT-based auth for NGOs
   - Admin authentication for dashboard
   - Role-based access control

2. **Enhanced Features**
   - Retry logic for failed CSV rows
   - Pagination in dashboard
   - Region/filter support
   - Export functionality (PDF/Excel)

3. **Production Readiness**
   - Comprehensive test coverage
   - API rate limiting
   - Request validation middleware
   - Structured logging (e.g., with Sentry)
   - Metrics and monitoring (Prometheus/Grafana)
   - CI/CD pipeline (GitHub Actions)

4. **Scalability**
   - Database connection pooling
   - Caching layer (Redis for dashboard queries)
   - CDN for static assets
   - Load balancing

5. **Documentation**
   - OpenAPI/Swagger specification
   - Postman collection
   - API documentation site

## License

This project is built for demonstration purposes.

## Contact

For questions or issues, please open an issue in the repository.

