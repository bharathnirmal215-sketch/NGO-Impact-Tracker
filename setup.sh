#!/bin/bash

# NGO Impact Tracker Setup Script

echo "Setting up NGO Impact Tracker..."

# Backend setup
echo "Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file. Please update it with your settings."
fi

# Run migrations
python manage.py migrate

echo "Backend setup complete!"

# Frontend setup
echo "Setting up frontend..."
cd ../frontend
npm install

echo "Frontend setup complete!"

echo ""
echo "Setup complete! Next steps:"
echo "1. Update backend/.env with your settings"
echo "2. Start Redis: redis-server (or use Docker)"
echo "3. Start Celery worker: cd backend && celery -A ngo_tracker worker --loglevel=info"
echo "4. Start Django server: cd backend && python manage.py runserver"
echo "5. Start Next.js: cd frontend && npm run dev"
echo ""
echo "Or use Docker Compose: docker-compose up"

