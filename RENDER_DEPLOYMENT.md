# Deployment Instructions for Render + Supabase

⚠️ **NOTE:** Render requires credit card (even for free tier with $1 charge). 
👉 **RECOMMENDED:** Use **Cyclic** instead - completely free, no CC needed!  
See `CYCLIC_DEPLOYMENT.md` for the best option.

---

## Prerequisites
1. GitHub repository with your code pushed ✅
2. Render account (free at https://render.com) - requires CC
3. Supabase account (free PostgreSQL at https://supabase.com) - NO CC

## Step 1: Create Supabase Account (Database)
1. Go to https://supabase.com and sign up (free, **NO CREDIT CARD**)
2. Create new project:
   - **Project Name:** mirhapret
   - **Database Password:** Save this!
   - **Region:** Choose closest to you
3. Go to Project Settings → Database
4. Copy these connection details:
   - **Host:** `db.xxxxx.supabase.co`
   - **Port:** `5432`
   - **User:** `postgres`
   - **Password:** Your password from step 2
   - **Database:** `postgres`

## Step 2: Create Render Account
- Go to https://render.com and sign up (free)
- Connect your GitHub account

## Step 3: Deploy Backend Service on Render
1. Go to Dashboard → New+ → Web Service
2. Connect your GitHub repo
3. Set deployment settings:
   - **Name:** mirhapret-backend
   - **Runtime:** Node
   - **Build Command:** `cd apps/backend && npm install && npm run build`
   - **Start Command:** `node apps/backend/dist/main.js`
   - **Plan:** Free

## Step 4: Add Environment Variables (Supabase Connection)
In Render dashboard → Environment tab, add these variables:
```
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<your-supabase-password>
DB_DATABASE=postgres
DB_SYNCHRONIZE=true
DB_LOGGING=false

JWT_SECRET=2ea138f234a325b7c98f3a7739ea6435
JWT_REFRESH_SECRET=7c4b49856c76146153492ea0e44e871d
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

CORS_ORIGINS=http://localhost:3001,http://localhost:3002,http://localhost:5173

APP_NAME=Mirhapret E-commerce
APP_VERSION=1.0.0
```

⚠️ **Replace:**
- `db.xxxxx.supabase.co` with your actual Supabase host
- `<your-supabase-password>` with your Supabase database password
- `<generate-a-random-32-char-string>` with random secrets (min 32 chars)

## Step 5: Deploy
1. In Render, click "Deploy"
2. Wait for build completion (2-3 minutes)
3. Check logs if there are issues

## Step 6: Get Your API URL
- Your API will be at: `https://mirhapret-backend.onrender.com/api/v1`
- Use this URL in your frontend `.env` files

## Limitations (Free Tier)
**Render:**
- Service spins down after 15 min of inactivity (startup takes ~30s)
- Limited to 0.5GB RAM
- 100 hours/month (shared across free projects)

**Supabase:**
- Free tier limited to 2 projects
- Database storage: 500 MB
- Monthly data limit resets automatically
- Good for development & testing

## Production Upgrades (When Ready)
**Render:**
- Upgrade to paid plan for always-on service ($7+/month)
- Enable auto-deploy on git push

**Supabase:**
- Upgrade to paid plan for more storage & performance
- Add custom domain
- Enable backups & point-in-time recovery
