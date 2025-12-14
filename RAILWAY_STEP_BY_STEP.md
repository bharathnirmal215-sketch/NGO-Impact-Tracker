# Complete Railway Deployment Guide - Step by Step

Follow these steps exactly to deploy your NGO Impact Tracker on Railway.

## Prerequisites

- GitHub account with your repository: `NGO-Impact-Tracker`
- Railway account (free signup)

---

## Part 1: Sign Up and Create Project

### Step 1: Sign Up on Railway
1. Go to **https://railway.app**
2. Click **"Start a New Project"** or **"Login"**
3. Choose **"Deploy from GitHub repo"** (recommended)
4. Authorize Railway to access your GitHub account
5. Select your repository: **`NGO-Impact-Tracker`**
6. Click **"Deploy Now"**

---

## Part 2: Deploy Backend (Django)

### Step 2: Add Backend Service
1. In your Railway project dashboard, you'll see your repo
2. Click **"New"** button (top right)
3. Select **"GitHub Repo"**
4. Choose your repository: **`NGO-Impact-Tracker`**
5. Railway will show service configuration

### Step 3: Configure Backend Service
1. **Service Name**: `ngo-tracker-backend` (or any name you prefer)
2. **Root Directory**: **`backend`** ⚠️ **IMPORTANT!**
   - This tells Railway to look in the `backend` folder
   - Click the folder icon and type: `backend`
3. Railway will auto-detect Python/Django

### Step 4: Add PostgreSQL Database
1. In your Railway project, click **"New"** button
2. Select **"Database"** → **"Add PostgreSQL"**
3. Name it: `ngo-tracker-db` (or leave default)
4. Plan: **Free** (or Starter if you prefer)
5. Click **"Add"**
6. **Important**: Railway automatically:
   - Creates the database
   - Sets `DATABASE_URL` environment variable
   - Links it to your services

### Step 5: Link Database to Backend
1. Go to your `ngo-tracker-backend` service
2. Click **"Variables"** tab
3. You should see `DATABASE_URL` already added (Railway auto-adds it)
4. If not, click **"New Variable"** and Railway will show available databases
5. Select your PostgreSQL database

### Step 6: Add Environment Variables
In your backend service → **"Variables"** tab, add:

```
SECRET_KEY=your-random-secret-key-here
```
**To generate a secret key:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

```
DEBUG=False
```

```
USE_SQLITE=False
```

**Optional (for CORS):**
```
FRONTEND_URL=https://your-frontend-url.up.railway.app
```
(Add this after you deploy frontend)

### Step 7: Configure Build Settings
1. Go to backend service → **"Settings"** tab
2. Scroll to **"Build & Deploy"** section
3. **Build Command** (should auto-detect, but verify):
   ```
   pip install -r requirements.txt && python manage.py migrate
   ```
4. **Start Command**:
   ```
   gunicorn ngo_tracker.wsgi:application --bind 0.0.0.0:$PORT
   ```

### Step 8: Deploy Backend
1. Railway will automatically start deploying
2. Go to **"Deployments"** tab to watch progress
3. Wait 2-5 minutes for build to complete
4. Check **"Build Logs"** for any errors

### Step 9: Get Backend URL
1. Go to backend service → **"Settings"** tab
2. Scroll to **"Networking"** section
3. Under **"Public Domain"**, you'll see your URL:
   ```
   https://ngo-tracker-backend-production.up.railway.app
   ```
4. **Copy this URL** - you'll need it for frontend!

### Step 10: Verify Backend is Working
1. Open your backend URL in browser
2. You should see Django 404 page (this is normal - means it's working!)
3. Test API: `https://your-backend-url.up.railway.app/api/dashboard?month=2024-01`
4. Should return JSON data

---

## Part 3: Deploy Frontend (Next.js)

### Step 11: Add Frontend Service
1. In the same Railway project, click **"New"** button
2. Select **"GitHub Repo"**
3. Choose your repository: **`NGO-Impact-Tracker`** (same repo)
4. Railway will show service configuration

### Step 12: Configure Frontend Service
1. **Service Name**: `ngo-tracker-frontend` (or any name)
2. **Root Directory**: **`frontend`** ⚠️ **IMPORTANT!**
   - Click folder icon and type: `frontend`
3. Railway will auto-detect Next.js

### Step 13: Add Environment Variable
1. Go to frontend service → **"Variables"** tab
2. Click **"New Variable"**
3. Add:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://your-backend-url.up.railway.app/api
   ```
   ⚠️ **Replace `your-backend-url` with your actual backend URL from Step 9!**

### Step 14: Deploy Frontend
1. Railway will automatically start building
2. Go to **"Deployments"** tab
3. Wait 3-5 minutes for build to complete
4. Next.js builds can take a bit longer

### Step 15: Get Frontend URL
1. Go to frontend service → **"Settings"** tab
2. Scroll to **"Networking"** section
3. Under **"Public Domain"**, you'll see:
   ```
   https://ngo-tracker-frontend-production.up.railway.app
   ```
4. **This is your live application URL!** 🎉

---

## Part 4: Final Configuration

### Step 16: Update CORS in Backend
1. Go back to backend service → **"Variables"** tab
2. Add new variable:
   ```
   Name: FRONTEND_URL
   Value: https://your-frontend-url.up.railway.app
   ```
   (Use your frontend URL from Step 15)
3. Backend will auto-redeploy

### Step 17: Run Database Migrations (if needed)
If migrations didn't run during build:

**Option A: Using Railway Dashboard**
1. Go to backend service → **"Deployments"** → Latest deployment
2. Click **"View Logs"**
3. Look for migration logs (should be in build logs)

**Option B: Using Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migrations
railway run python manage.py migrate
```

### Step 18: Create Superuser (Optional - for Admin Panel)
```bash
railway run python manage.py createsuperuser
```
Or use Railway dashboard shell if available.

---

## Part 5: Test Your Deployment

### Step 19: Test Frontend
1. Open your frontend URL: `https://your-frontend.up.railway.app`
2. You should see the homepage
3. Try submitting a report
4. Try uploading CSV
5. Check the dashboard

### Step 20: Test Backend API
1. Test dashboard API:
   ```
   https://your-backend.up.railway.app/api/dashboard?month=2024-01
   ```
2. Should return JSON with data

---

## Troubleshooting

### Build Fails with "pip: not found"
**Solution**: 
- Verify **Root Directory** is set to `backend`
- Check that `requirements.txt` exists in `backend` folder
- Railway should auto-detect Python - if not, the config files we added will help

### Database Connection Error
**Solution**:
- Verify PostgreSQL database is created and linked
- Check `DATABASE_URL` is in environment variables
- Ensure `USE_SQLITE=False`
- Verify database is "Online" in Railway dashboard

### Frontend Can't Reach Backend
**Solution**:
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend URL is accessible (try in browser)
- Add `FRONTEND_URL` to backend CORS settings
- Check backend logs for CORS errors

### Port Binding Error
**Solution**:
- Railway provides `$PORT` automatically
- Start command should use: `--bind 0.0.0.0:$PORT`
- Don't hardcode port numbers

### Service Not Starting
**Solution**:
- Check "Deploy Logs" for errors
- Verify all environment variables are set
- Check database is linked and online
- Verify build completed successfully

---

## Quick Reference: Environment Variables

### Backend Variables:
```
SECRET_KEY=your-secret-key
DEBUG=False
USE_SQLITE=False
DATABASE_URL=(auto-set by Railway)
FRONTEND_URL=https://your-frontend.up.railway.app
```

### Frontend Variables:
```
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

---

## Your Live URLs

After deployment, you'll have:

- **Frontend**: `https://your-frontend.up.railway.app`
- **Backend API**: `https://your-backend.up.railway.app/api`
- **Admin Panel**: `https://your-backend.up.railway.app/admin`

---

## Cost Estimate

- **Backend Service**: ~$0-5/month (within free credit)
- **Frontend Service**: ~$0-5/month (within free credit)
- **PostgreSQL**: Free (included)
- **Total**: Usually within $5/month free credit!

---

## Next Steps

1. ✅ Deploy backend
2. ✅ Deploy frontend
3. ✅ Test everything
4. ✅ Share your live URLs!

Your application is now live on Railway! 🚀

