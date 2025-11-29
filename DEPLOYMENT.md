# 🚀 Deployment Guide - Task Management System

Complete step-by-step guide to deploy your full-stack application for **FREE**!

## 📋 Overview

We'll deploy:
- **Backend (FastAPI)** → Render.com
- **Frontend (Next.js)** → Vercel
- **Database (PostgreSQL)** → Neon.tech
- **Cache (Redis)** → Upstash

All services have **free tiers** - no credit card required initially!

---

## 1️⃣ Database Setup (Neon.tech)

### Step 1: Create Neon Account
1. Go to https://neon.tech
2. Sign up with GitHub (easiest)
3. Click "Create Project"

### Step 2: Configure Database
1. **Project Name**: `task-manager-db`
2. **Region**: Choose closest to you
3. Click "Create Project"

### Step 3: Get Connection String
1. Copy the **Connection String** (looks like):
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
2. Save this - you'll need it later!

---

## 2️⃣ Redis Setup (Upstash)

### Step 1: Create Upstash Account
1. Go to https://upstash.com
2. Sign up with GitHub
3. Click "Create Database"

### Step 2: Configure Redis
1. **Name**: `task-manager-redis`
2. **Type**: Regional
3. **Region**: Choose closest to you
4. Click "Create"

### Step 3: Get Redis URL
1. Go to your database
2. Copy **REST URL** (looks like):
   ```
   https://xxx.upstash.io
   ```
3. Also copy **UPSTASH_REDIS_REST_TOKEN**
4. Save both!

---

## 3️⃣ Backend Deployment (Render.com)

### Step 1: Prepare Backend Files

Create `backend/render.yaml`:
```yaml
services:
  - type: web
    name: task-manager-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.12.0
      - key: DATABASE_URL
        sync: false
      - key: REDIS_URL
        sync: false
      - key: SECRET_KEY
        generateValue: true
      - key: ALGORITHM
        value: HS256
      - key: ACCESS_TOKEN_EXPIRE_MINUTES
        value: 30
      - key: REFRESH_TOKEN_EXPIRE_DAYS
        value: 7
      - key: CACHE_TTL
        value: 300
```

### Step 2: Update Backend Code

Update `backend/app/main.py` CORS settings:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app.vercel.app",  # Add after Vercel deployment
        "*"  # Remove in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 3: Commit Changes
```bash
cd /home/annu/Downloads/Task_api
git add backend/render.yaml backend/app/main.py
git commit -m "feat: Add Render deployment config"
git push origin main
```

### Step 4: Deploy on Render
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select `Task_manager_api`
6. Configure:
   - **Name**: `task-manager-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step 5: Add Environment Variables
In Render dashboard, add:
- `DATABASE_URL` = (Neon connection string)
- `REDIS_URL` = (Upstash Redis URL)
- `SECRET_KEY` = (generate random: `openssl rand -hex 32`)
- `ALGORITHM` = `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES` = `30`
- `REFRESH_TOKEN_EXPIRE_DAYS` = `7`
- `CACHE_TTL` = `300`

### Step 6: Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL: `https://task-manager-api.onrender.com`

### Step 7: Run Migrations
In Render dashboard:
1. Go to "Shell" tab
2. Run:
   ```bash
   alembic upgrade head
   python seed_data.py  # Optional: seed initial data
   ```

---

## 4️⃣ Frontend Deployment (Vercel)

### Step 1: Update Frontend Environment

Update `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://task-manager-api.onrender.com/api/v1
```

### Step 2: Commit Changes
```bash
git add frontend/.env.local
git commit -m "feat: Update API URL for production"
git push origin main
```

### Step 3: Deploy on Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import `Task_manager_api` repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 4: Add Environment Variables
In Vercel project settings:
- `NEXT_PUBLIC_API_URL` = `https://task-manager-api.onrender.com/api/v1`

### Step 5: Deploy
1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. Copy your frontend URL: `https://task-manager-xxx.vercel.app`

---

## 5️⃣ Final Configuration

### Update Backend CORS
1. Go to Render dashboard
2. Update `CORS_ORIGINS` environment variable:
   ```
   https://task-manager-xxx.vercel.app
   ```
3. Or update `backend/app/main.py`:
   ```python
   allow_origins=[
       "https://task-manager-xxx.vercel.app",
       "http://localhost:3000"  # For local development
   ]
   ```
4. Commit and push:
   ```bash
   git add backend/app/main.py
   git commit -m "fix: Update CORS for production"
   git push origin main
   ```

---

## ✅ Verification

### Test Backend
```bash
curl https://task-manager-api.onrender.com/docs
```
Should show Swagger UI.

### Test Frontend
1. Visit: `https://task-manager-xxx.vercel.app`
2. Sign up for a new account
3. Create a task
4. Verify everything works!

---

## 🔧 Troubleshooting

### Backend Issues
- **500 Error**: Check Render logs for database connection
- **CORS Error**: Verify CORS settings in `main.py`
- **Database Error**: Check DATABASE_URL format

### Frontend Issues
- **API Error**: Verify `NEXT_PUBLIC_API_URL` is correct
- **Build Error**: Check Vercel build logs
- **404 Error**: Ensure root directory is `frontend`

### Database Issues
- **Connection Failed**: Check Neon database is active
- **Migration Error**: Run `alembic upgrade head` in Render shell

---

## 📊 Monitoring

### Render (Backend)
- View logs: Render Dashboard → Logs
- Monitor metrics: Render Dashboard → Metrics

### Vercel (Frontend)
- View deployments: Vercel Dashboard → Deployments
- Check analytics: Vercel Dashboard → Analytics

### Neon (Database)
- Monitor queries: Neon Dashboard → Monitoring
- Check storage: Neon Dashboard → Storage

---

## 💰 Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| **Render** | 750 hours/month, sleeps after 15min inactivity |
| **Vercel** | 100GB bandwidth, unlimited deployments |
| **Neon** | 3GB storage, 1 project |
| **Upstash** | 10,000 commands/day |

---

## 🚀 Going to Production

For production deployment:
1. **Custom Domain**: Add in Vercel settings
2. **SSL**: Automatic with Vercel & Render
3. **Monitoring**: Add Sentry for error tracking
4. **Backup**: Enable Neon backups
5. **Scaling**: Upgrade Render plan if needed

---

## 📝 Quick Commands

### Local Development
```bash
# Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```

### Production Deployment
```bash
# Deploy both
git add .
git commit -m "your message"
git push origin main
# Vercel auto-deploys, Render auto-deploys
```

---

## 🎉 Success!

Your app is now live at:
- **Frontend**: https://task-manager-xxx.vercel.app
- **Backend API**: https://task-manager-api.onrender.com
- **API Docs**: https://task-manager-api.onrender.com/docs

**Share your app with the world!** 🌍

---

**Need Help?** Check logs in respective dashboards or create an issue on GitHub!
