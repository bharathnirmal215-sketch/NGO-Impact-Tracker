# Render Deployment Setup Guide

## Quick Fix for Database Connection Error

The error shows Django is trying to connect to `localhost` instead of Render's PostgreSQL database.

## Solution: Set Environment Variables in Render

### Step 1: Create PostgreSQL Database in Render

1. Go to your Render dashboard
2. Click "New +" → "PostgreSQL"
3. Name it: `ngo-tracker-db`
4. Plan: Free
5. Click "Create Database"
6. Wait for it to be created (1-2 minutes)

### Step 2: Link Database to Your Web Service

1. Go to your web service settings
2. Scroll to "Environment" section
3. Click "Link Resource" or "Add Environment Variable"
4. Link the PostgreSQL database you just created

### Step 3: Add Required Environment Variables

In your web service, add these environment variables:

**Required:**
```
SECRET_KEY=your-random-secret-key-here
DEBUG=False
USE_SQLITE=False
```

**Database (Render will auto-provide DATABASE_URL, but add these if needed):**
```
DB_NAME=(auto-filled from database)
DB_USER=(auto-filled from database)
DB_PASSWORD=(auto-filled from database)
DB_HOST=(auto-filled from database)
DB_PORT=5432
```

**Important:** Render automatically provides `DATABASE_URL` when you link a database. The updated code will use this automatically.

### Step 4: Update Your Service Settings

Make sure your service has:
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt && python manage.py migrate`
- **Start Command**: `gunicorn ngo_tracker.wsgi:application --bind 0.0.0.0:$PORT`

### Step 5: Redeploy

After setting environment variables:
1. Go to "Manual Deploy" → "Deploy latest commit"
2. Or push a new commit to trigger auto-deploy

## Alternative: Use render.yaml (Easier)

1. Delete your current service
2. In Render dashboard, click "New +" → "Blueprint"
3. Connect your GitHub repo
4. Render will automatically detect `render.yaml` and create everything

This is the easiest way as it auto-configures the database connection!

