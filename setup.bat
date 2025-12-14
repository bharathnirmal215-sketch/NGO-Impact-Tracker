@echo off
REM NGO Impact Tracker Setup Script for Windows

echo Setting up NGO Impact Tracker...

REM Backend setup
echo Setting up backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt

REM Copy environment file
if not exist .env (
    copy .env.example .env
    echo Created .env file. Please update it with your settings.
)

REM Run migrations
python manage.py migrate

echo Backend setup complete!

REM Frontend setup
echo Setting up frontend...
cd ..\frontend
call npm install

echo Frontend setup complete!

echo.
echo Setup complete! Next steps:
echo 1. Update backend\.env with your settings
echo 2. Start Redis (install from https://redis.io/download or use Docker)
echo 3. Start Celery worker: cd backend ^&^& celery -A ngo_tracker worker --loglevel=info
echo 4. Start Django server: cd backend ^&^& python manage.py runserver
echo 5. Start Next.js: cd frontend ^&^& npm run dev
echo.
echo Or use Docker Compose: docker-compose up

