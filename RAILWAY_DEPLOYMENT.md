# Railway Deployment Guide

Railway is one of the easiest platforms to deploy Django + Next.js applications. This guide will walk you through deploying your NGO Impact Tracker on Railway.

> **📖 For the most detailed step-by-step guide, see [RAILWAY_STEP_BY_STEP.md](./RAILWAY_STEP_BY_STEP.md)**

## Why Railway?

- ✅ **Easier than Render** - Automatic detection and configuration
- ✅ **Free tier available** - $5 free credit per month
- ✅ **Auto-deploys from GitHub** - Every push triggers a new deployment
- ✅ **Built-in PostgreSQL & Redis** - One-click database setup
- ✅ **Great developer experience** - Simple UI, fast deployments

## Step-by-Step Deployment

### Part 1: Deploy Backend (Django)

1. **Sign up at Railway**: https://railway.app
   - Sign up with GitHub (recommended for easy repo access)

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `NGO-Impact-Tracker`

3. **Add Backend Service**:
   - Railway will detect your repo
   - Click "Add Service" → "GitHub Repo"
   - Select your repo again
   - **Important**: Set "Root Directory" to `backend`
   - Railway will auto-detect it's a Python/Django app

4. **Add PostgreSQL Database**:
   - In your project, click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically:
     - Create the database
     - Set `DATABASE_URL` environment variable
     - Link it to your service

5. **Add Redis** (Optional, for Celery):
   - Click "New" → "Database" → "Add Redis"
   - Railway will auto-link it

6. **Configure Environment Variables**:
   - Go to your backend service → "Variables" tab
   - Add these variables:
     ```
     SECRET_KEY=your-random-secret-key-here
     DEBUG=False
     USE_SQLITE=False
     ```
   - **Note**: `DATABASE_URL` is automatically set by Railway when you add PostgreSQL

7. **Set Start Command** (if not auto-detected):
   - Go to "Settings" → "Deploy"
   - Start Command: `gunicorn ngo_tracker.wsgi:application --bind 0.0.0.0:$PORT`

8. **Deploy**:
   - Railway will automatically deploy when you push to GitHub
   - Or click "Deploy" to deploy immediately
   - Wait for deployment to complete (2-3 minutes)

9. **Run Migrations**:
   - Go to your backend service
   - Click "Deployments" → Latest deployment → "View Logs"
   - Or use Railway CLI:
     ```bash
     railway run python manage.py migrate
     ```

10. **Get your Backend URL**:
    - Go to "Settings" → "Networking"
    - Your backend URL: `https://your-service-name.up.railway.app`

### Part 2: Deploy Frontend (Next.js)

1. **Add Frontend Service**:
   - In the same Railway project, click "New" → "GitHub Repo"
   - Select your repo again
   - **Important**: Set "Root Directory" to `frontend`
   - Railway will auto-detect it's a Next.js app

2. **Add Environment Variable**:
   - Go to frontend service → "Variables" tab
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app/api
     ```
   - (Replace with your actual backend URL from Step 1)

3. **Deploy**:
   - Railway will automatically build and deploy
   - Wait for deployment (2-3 minutes)

4. **Get your Frontend URL**:
   - Go to "Settings" → "Networking"
   - Your frontend URL: `https://your-frontend-name.up.railway.app`

### Part 3: Update CORS Settings

1. **Go to Backend Service** → "Variables"
2. **Add**:
   ```
   FRONTEND_URL=https://your-frontend-url.up.railway.app
   ```
3. **Redeploy** backend (or it will auto-redeploy)

## Railway-Specific Configuration

Railway automatically:
- Detects Python/Django and installs dependencies
- Detects Next.js and runs `npm install` and `npm run build`
- Provides `$PORT` environment variable
- Links databases automatically via `DATABASE_URL`

## Quick Setup Checklist

### Backend:
- [ ] Create project from GitHub repo
- [ ] Add backend service (root: `backend`)
- [ ] Add PostgreSQL database
- [ ] Add environment variables (SECRET_KEY, DEBUG, USE_SQLITE)
- [ ] Verify start command: `gunicorn ngo_tracker.wsgi:application --bind 0.0.0.0:$PORT`
- [ ] Run migrations
- [ ] Get backend URL

### Frontend:
- [ ] Add frontend service (root: `frontend`)
- [ ] Add `NEXT_PUBLIC_API_URL` environment variable
- [ ] Deploy
- [ ] Get frontend URL

### Final:
- [ ] Add `FRONTEND_URL` to backend variables
- [ ] Test both URLs
- [ ] Create superuser for admin panel

## Running Migrations on Railway

**Option 1: Using Railway Dashboard**
1. Go to your backend service
2. Click "Deployments" → Latest deployment
3. Click "View Logs" → "Shell"
4. Run: `python manage.py migrate`

**Option 2: Using Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run python manage.py migrate

# Create superuser
railway run python manage.py createsuperuser
```

## Troubleshooting

**Build fails?**
- Check build logs in Railway dashboard
- Ensure `requirements.txt` is in `backend` directory
- Verify Python version (Railway auto-detects)

**Database connection error?**
- Verify PostgreSQL is added and linked
- Check `DATABASE_URL` is set (Railway sets this automatically)
- Ensure `USE_SQLITE=False` in environment variables

**Frontend can't reach backend?**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend URL is accessible
- Add `FRONTEND_URL` to backend CORS settings

**Port binding error?**
- Railway provides `$PORT` automatically
- Use: `gunicorn ngo_tracker.wsgi:application --bind 0.0.0.0:$PORT`

## Railway vs Render

| Feature | Railway | Render |
|---------|---------|--------|
| Setup Complexity | ⭐ Easy | ⭐⭐ Medium |
| Auto-detection | ✅ Excellent | ⚠️ Manual config |
| Database Setup | ✅ One-click | ⚠️ Manual linking |
| Free Tier | $5/month credit | 750 hours/month |
| Deployment Speed | ⚡ Fast | ⚡ Fast |

## Cost Estimate (Free Tier)

- **Backend Service**: ~$0-5/month (within free credit)
- **Frontend Service**: ~$0-5/month (within free credit)
- **PostgreSQL**: Free (included)
- **Redis**: Optional, ~$0-3/month

**Total**: Usually within $5/month free credit for small projects!

## Next Steps

1. Deploy backend on Railway
2. Deploy frontend on Railway
3. Test your live application
4. Share your URLs!

Your application will be live at:
- Frontend: `https://your-app.up.railway.app`
- Backend API: `https://your-backend.up.railway.app/api`

