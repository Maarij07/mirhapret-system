# Deploy to Cyclic (FREE - No Credit Card!)

## Why Cyclic?
✅ Free tier with NO credit card required  
✅ Made specifically for Node.js/NestJS  
✅ Auto-deploys from GitHub  
✅ Always-on (no spinning down)  
✅ Perfect for development & small projects  

---

## Step 1: Create Cyclic Account
1. Go to https://app.cyclic.sh
2. Click "GitHub" to sign up/login with GitHub
3. Authorize Cyclic to access your repos
4. Done! ✅

---

## Step 2: Connect Your Repository
1. In Cyclic dashboard, click "Link an App"
2. Select your GitHub repo: `mirhapret-system`
3. Confirm you want to connect it

---

## Step 3: Configure Build Settings
Cyclic should auto-detect:
- **Root Directory:** `.` (monorepo)
- **Build Command:** `cd apps/backend && npm install && npm run build`
- **Start Command:** `node apps/backend/dist/main.js`

If not auto-detected, set them manually.

---

## Step 4: Add Environment Variables
1. Go to Variables tab in Cyclic
2. Add Supabase connection details:

```
NODE_ENV=production
PORT=8080
API_PREFIX=api/v1

DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<your-supabase-password>
DB_DATABASE=postgres
DB_SYNCHRONIZE=true
DB_LOGGING=false

JWT_SECRET=<random-32-char-secret>
JWT_REFRESH_SECRET=<random-32-char-secret>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

CORS_ORIGINS=http://localhost:3001,http://localhost:3002,http://localhost:5173

APP_NAME=Mirhapret E-commerce
APP_VERSION=1.0.0
```

⚠️ **Replace:**
- `db.xxxxx.supabase.co` with your Supabase host
- `<your-supabase-password>` with Supabase password
- `<random-32-char-secret>` with random strings (min 32 chars)

---

## Step 5: Deploy
1. Click "Deploy"
2. Watch the logs
3. Get your API URL from Cyclic dashboard

Your API will be at: `https://xxxxx.cyclic.app/api/v1`

---

## Cyclic Limits (Free Tier)
- **Requests:** Unlimited
- **Uptime:** 99.9% SLA
- **Always-on:** Yes (no spin-down!)
- **Storage:** Supabase handles DB (500MB free)
- **RAM:** Sufficient for Node.js
- **Custom Domain:** Supported (free)

---

## Advantages Over Render
✅ No credit card ever  
✅ Always-on (no cold starts)  
✅ Better for Node.js apps  
✅ Easier GitHub integration  
✅ Same performance on free tier  

---

## Next Steps
1. Create free Supabase account (if not done)
2. Get Supabase connection details
3. Sign up to Cyclic with GitHub
4. Connect your repo
5. Add environment variables
6. Deploy!

**Total setup time: 10 minutes, ZERO cost** 🚀
