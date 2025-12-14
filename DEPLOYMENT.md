# Deployment Guide

This guide will help you deploy the NGO Impact Tracker to production.

## Recommended Deployment Platforms

### 🚀 Railway (Easiest - Recommended)
- **One platform for both backend and frontend**
- **Automatic detection and configuration**
- **$5 free credit per month**
- **Easiest database setup**
- **URL**: https://railway.app
- **See**: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed guide

### Frontend (Next.js) - Vercel (Alternative)
- **Free tier available**
- **Optimized for Next.js**
- **Automatic deployments from GitHub**
- **URL**: https://vercel.com

### Backend (Django) - Render (Alternative)
- **Render**: https://render.com (Free tier available)
- **See**: [RENDER_SETUP.md](./RENDER_SETUP.md) for troubleshooting

## Step-by-Step Deployment

### Part 1: Deploy Backend (Django) on Render

1. **Sign up at Render**: https://render.com
2. **Create a new Web Service**:
   - Connect your GitHub repository
   - Select the repository: `NGO-Impact-Tracker`
   - Name: `ngo-tracker-backend`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn ngo_tracker.wsgi:application --bind 0.0.0.0:$PORT`

3. **Add Environment Variables**:
   ```
   SECRET_KEY=your-secret-key-here-generate-a-random-one
   DEBUG=False
   USE_SQLITE=False
   DB_NAME=ngo_tracker
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_HOST=your-db-host
   DB_PORT=5432
   CELERY_BROKER_URL=redis://your-redis-url
   CELERY_RESULT_BACKEND=redis://your-redis-url
   ```

4. **Create PostgreSQL Database**:
   - In Render dashboard, create a new PostgreSQL database
   - Copy the connection details to environment variables

5. **Create Redis Instance** (for Celery):
   - In Render dashboard, create a new Redis instance
   - Copy the URL to `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND`

6. **Run Migrations**:
   - After deployment, use Render's shell or add a build command:
   ```bash
   python manage.py migrate
   ```

7. **Get your backend URL**: `https://your-app-name.onrender.com`

### Part 2: Deploy Frontend (Next.js) on Vercel

1. **Sign up at Vercel**: https://vercel.com
2. **Import your GitHub repository**:
   - Click "New Project"
   - Select `NGO-Impact-Tracker`
   - Root Directory: `frontend`
   - Framework Preset: `Next.js`

3. **Add Environment Variable**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
   ```
   (Replace with your actual Render backend URL)

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy
   - You'll get a URL like: `https://your-app-name.vercel.app`

5. **Update CORS in Backend**:
   - In your Render backend environment variables, you might need to update CORS settings
   - Or update `backend/ngo_tracker/settings.py`:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "https://your-frontend-url.vercel.app",
   ]
   ```

### Part 3: Alternative - Deploy Everything on Railway

Railway can host both backend and frontend:

1. **Sign up at Railway**: https://railway.app
2. **Create New Project** from GitHub
3. **Add Backend Service**:
   - Select `backend` directory
   - Add PostgreSQL and Redis plugins
   - Set environment variables
   - Deploy

4. **Add Frontend Service**:
   - Select `frontend` directory
   - Set `NEXT_PUBLIC_API_URL` to your backend URL
   - Deploy

## Quick Deploy Commands

### For Render (Backend)

Create a `render.yaml` file in the root:

```yaml
services:
  - type: web
    name: ngo-tracker-backend
    env: python
    buildCommand: pip install -r requirements.txt && python manage.py migrate
    startCommand: gunicorn ngo_tracker.wsgi:application --bind 0.0.0.0:$PORT
    envVars:
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: False
      - key: USE_SQLITE
        value: False

databases:
  - name: ngo-tracker-db
    plan: free

services:
  - type: redis
    name: ngo-tracker-redis
    plan: free
```

### For Vercel (Frontend)

Create a `vercel.json` in the `frontend` directory:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

## Post-Deployment Steps

1. **Create Superuser** (for Django admin):
   ```bash
   python manage.py createsuperuser
   ```

2. **Test the deployment**:
   - Visit your frontend URL
   - Try submitting a report
   - Check if data is saved

3. **Set up Custom Domain** (optional):
   - Both Vercel and Render support custom domains
   - Add your domain in the dashboard settings

## Environment Variables Checklist

### Backend (Render/Railway):
- [ ] `SECRET_KEY` (generate a strong random key)
- [ ] `DEBUG=False`
- [ ] `USE_SQLITE=False`
- [ ] Database credentials
- [ ] Redis URL
- [ ] CORS origins (your frontend URL)

### Frontend (Vercel):
- [ ] `NEXT_PUBLIC_API_URL` (your backend API URL)

## Troubleshooting

**Backend not connecting to database?**
- Check database credentials in environment variables
- Ensure database is created and running
- Run migrations: `python manage.py migrate`

**Frontend can't reach backend?**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify CORS settings in backend
- Check backend URL is accessible

**CSV upload not working?**
- Ensure Redis is running (for Celery)
- Or the code will fall back to synchronous processing

## Free Tier Limits

- **Render**: 750 hours/month free, sleeps after 15 min inactivity
- **Vercel**: Unlimited for personal projects
- **Railway**: $5 free credit/month

## Need Help?

Check the platform documentation:
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- Railway: https://docs.railway.app

