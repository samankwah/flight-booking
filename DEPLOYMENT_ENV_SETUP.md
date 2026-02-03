# Deployment Environment Variables Setup Guide

## Overview

This guide explains how to set up environment variables for deploying your flight booking application to:
- **Vercel** (Frontend - React App)
- **Railway** or **Render** (Backend - Express API)

---

## Prerequisites

- ✅ Vercel account: https://vercel.com/signup
- ✅ Railway account: https://railway.app/ OR Render account: https://render.com/
- ✅ Local `.env` files configured and working
- ✅ Git repository connected to deployment platforms

---

## Part 1: Frontend Deployment (Vercel)

### Step 1: Create Vercel Project

```bash
# Option A: Deploy via Vercel CLI
npm install -g vercel
vercel

# Option B: Deploy via Vercel Dashboard
# 1. Go to: https://vercel.com/new
# 2. Import your GitHub repository
# 3. Select the root directory
# 4. Click "Deploy"
```

### Step 2: Configure Vercel Build Settings

In Vercel Dashboard → Project Settings → Build & Development Settings:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 3: Add Environment Variables in Vercel

Go to: **Project Settings → Environment Variables**

Add the following variables:

#### Firebase Configuration
```
VITE_FIREBASE_API_KEY=[your_firebase_api_key]
VITE_FIREBASE_AUTH_DOMAIN=[your-project-id.firebaseapp.com]
VITE_FIREBASE_PROJECT_ID=[your-project-id]
VITE_FIREBASE_STORAGE_BUCKET=[your-project-id.firebasestorage.app]
VITE_FIREBASE_MESSAGING_SENDER_ID=[your_sender_id]
VITE_FIREBASE_APP_ID=[your_app_id]
VITE_FIREBASE_MEASUREMENT_ID=[G-YOUR_ID]
```

#### API Configuration
```
VITE_API_URL=[https://your-backend-url.railway.app/api]
```
**Note**: Update this after deploying backend

#### Paystack Public Key
```
# For staging/preview:
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_test_key_here

# For production:
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here
```

#### Push Notifications
```
VITE_VAPID_PUBLIC_KEY=[your_vapid_public_key]
VITE_VAPID_SUBJECT=mailto:[your-email@example.com]
```

### Step 4: Configure Environment Scopes

For each variable, select which environments should use it:
- ✅ **Production** - Live site (use production keys)
- ✅ **Preview** - PR deployments (use test keys)
- ✅ **Development** - Development builds (use test keys)

### Step 5: Redeploy

After adding all variables:
```bash
# Trigger a new deployment
git commit --allow-empty -m "Trigger redeploy with env vars"
git push
```

---

## Part 2: Backend Deployment (Railway)

### Option A: Deploy to Railway

#### Step 1: Create Railway Project

```bash
# Option 1: Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up

# Option 2: Railway Dashboard
# 1. Go to: https://railway.app/new
# 2. Select "Deploy from GitHub repo"
# 3. Select your repository
# 4. Railway will auto-detect Node.js
```

#### Step 2: Configure Railway

In Railway Dashboard → Your Project → Settings:

```
Start Command: npm run server
Build Command: npm install
Root Directory: /
```

#### Step 3: Add Environment Variables in Railway

Go to: **Your Service → Variables Tab**

Click "Raw Editor" and paste (replace with your actual values):

```bash
# Server Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend.vercel.app

# Security
JWT_SECRET=your_64_character_jwt_secret_here

# Firebase Backend
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=G-YOUR_ID

# Firebase Admin SDK - CRITICAL!
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project",...}

# Amadeus API
AMADEUS_API_KEY=your_amadeus_key
AMADEUS_API_SECRET=your_amadeus_secret
AMADEUS_HOSTNAME=production

# Paystack
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key

# Email Services
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=your-email@yourdomain.com
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# Web Push
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your-email@example.com

# Logging
LOG_LEVEL=info
```

**Important**:
- Copy `FIREBASE_SERVICE_ACCOUNT` as a single line (no line breaks)
- Use **production** keys for AMADEUS_HOSTNAME and Paystack keys
- Update FRONTEND_URL with your actual Vercel URL

#### Step 4: Get Railway Backend URL

After deployment:
1. Go to **Settings → Domains**
2. Click "Generate Domain"
3. Copy the URL (e.g., `your-backend.railway.app`)
4. Update `VITE_API_URL` in Vercel with: `https://your-backend.railway.app/api`

---

## Option B: Deploy to Render

### Step 1: Create Render Web Service

1. Go to: https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   ```
   Name: flight-booking-backend
   Region: Choose closest to users
   Branch: main
   Root Directory: ./
   Environment: Node
   Build Command: npm install
   Start Command: npm run server
   ```

### Step 2: Add Environment Variables in Render

Go to: **Your Service → Environment Tab**

Add each variable individually or use "Add from .env":

```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend.vercel.app
JWT_SECRET=your_64_character_jwt_secret_here

# ... (same variables as Railway above)
```

### Step 3: Configure Render Settings

- **Instance Type**: Select appropriate tier (Starter or higher)
- **Auto-Deploy**: Enable for automatic deployments on push
- **Health Check Path**: `/health` (if you have this endpoint)

### Step 4: Get Render Backend URL

After deployment:
1. Copy your service URL (e.g., `your-backend.onrender.com`)
2. Update `VITE_API_URL` in Vercel with: `https://your-backend.onrender.com/api`

---

## Part 3: Post-Deployment Configuration

### Update Frontend with Backend URL

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Update `VITE_API_URL`:
   ```
   # Railway:
   VITE_API_URL=https://your-backend.railway.app/api

   # OR Render:
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
3. Redeploy frontend

### Update Backend with Frontend URL

1. Go to Railway/Render → Environment Variables
2. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
3. Redeploy backend

### Enable Production Services

1. **Firebase**: Ensure production project is set up
2. **Paystack**: Use live keys (`pk_live_*` and `sk_live_*`)
3. **Amadeus**: Set `AMADEUS_HOSTNAME=production`

---

## Part 4: Verification

### Test Frontend

```bash
# Visit your Vercel URL
https://your-project.vercel.app

# Check console for errors
# Verify Firebase authentication works
# Test API calls to backend
```

### Test Backend

```bash
# Check health endpoint
curl https://your-backend.railway.app/health

# Test API endpoint
curl https://your-backend.railway.app/api/flights/airports

# Check logs in Railway/Render dashboard
```

### Test Integration

1. **Sign up/Login**: Test Firebase authentication
2. **Search Flights**: Verify Amadeus API integration
3. **Make Booking**: Test full booking flow
4. **Payment**: Test Paystack payment (use test card first!)
5. **Email**: Verify confirmation emails are sent

---

## Part 5: Environment-Specific Configuration

### Development Environment
```
API: localhost:3001
Database: Firebase development project
Payment: Paystack test keys
Amadeus: test hostname
```

### Staging/Preview Environment (Vercel Preview Deployments)
```
API: staging-backend.railway.app
Database: Firebase staging project
Payment: Paystack test keys
Amadeus: test hostname
```

### Production Environment
```
API: production-backend.railway.app
Database: Firebase production project
Payment: Paystack LIVE keys
Amadeus: production hostname
```

---

## Part 6: Security Best Practices

### ✅ DO:
- Use different Firebase projects for dev/staging/prod
- Use Paystack test keys in non-production environments
- Rotate credentials regularly
- Use HTTPS for all production URLs
- Enable Railway/Render/Vercel authentication logs
- Set up monitoring and alerts

### ❌ DON'T:
- Commit .env files to git
- Share credentials via email/Slack
- Use production keys in development
- Expose secret keys in frontend code
- Use the same database for dev/staging/prod

---

## Part 7: Troubleshooting

### Frontend Issues

**Issue**: Environment variables not working
```bash
# Solution 1: Ensure variables start with VITE_
# Solution 2: Redeploy after adding variables
# Solution 3: Check browser console for variable values
```

**Issue**: API calls failing
```bash
# Solution: Verify VITE_API_URL is correct
# Check Network tab for actual URL being called
# Ensure backend CORS allows frontend domain
```

### Backend Issues

**Issue**: Firebase authentication failing
```bash
# Solution: Verify FIREBASE_SERVICE_ACCOUNT is formatted correctly
# Ensure it's a single line with no breaks
# Check Firebase console for errors
```

**Issue**: CORS errors
```bash
# Solution: Update FRONTEND_URL in backend environment
# Ensure it matches exact Vercel URL (no trailing slash)
```

---

## Part 8: Maintenance

### Updating Environment Variables

**Vercel**:
1. Go to Settings → Environment Variables
2. Edit variable
3. Redeploy (or enable "Redeploy on change")

**Railway**:
1. Go to Variables tab
2. Edit in Raw Editor or individually
3. Changes apply on next deployment

**Render**:
1. Go to Environment tab
2. Edit variable
3. Save (triggers auto-redeploy if enabled)

### Monitoring

- **Vercel**: Deployment logs, Analytics, Real-time logs
- **Railway**: Deployments tab, Logs tab, Metrics
- **Render**: Logs tab, Events, Metrics

---

## Quick Reference

### Vercel Dashboard URLs
- Projects: https://vercel.com/dashboard
- Settings: https://vercel.com/[username]/[project]/settings
- Deployments: https://vercel.com/[username]/[project]/deployments

### Railway Dashboard URLs
- Projects: https://railway.app/dashboard
- Service Settings: https://railway.app/project/[id]
- Logs: https://railway.app/project/[id]/service/[id]

### Render Dashboard URLs
- Services: https://dashboard.render.com/
- Service Logs: https://dashboard.render.com/web/[service-id]

---

## Need Help?

- Vercel Documentation: https://vercel.com/docs
- Railway Documentation: https://docs.railway.app/
- Render Documentation: https://render.com/docs

## Checklist

Before going live:
- [ ] All frontend environment variables configured in Vercel
- [ ] All backend environment variables configured in Railway/Render
- [ ] Frontend VITE_API_URL points to correct backend
- [ ] Backend FRONTEND_URL points to correct Vercel URL
- [ ] Using production Firebase project
- [ ] Using Paystack LIVE keys
- [ ] Using Amadeus production hostname
- [ ] Tested authentication flow
- [ ] Tested payment flow
- [ ] Tested email notifications
- [ ] Verified all API endpoints work
- [ ] Checked logs for errors
- [ ] Set up monitoring/alerts
