# Netlify Deployment Guide - Fix Firebase Auth Error

## Problem
You're seeing: **Firebase: Error (auth/auth-domain-config-required)**

This happens because Firebase environment variables are not configured in Netlify.

---

## Solution: Configure Environment Variables in Netlify

### Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **flight-book-82ea4**
3. Click the ⚙️ gear icon → **Project settings**
4. Scroll down to "Your apps" → Select your web app
5. Copy the `firebaseConfig` object values

It should look like:
```javascript
{
  apiKey: "AIzaSy...",
  authDomain: "flight-book-82ea4.firebaseapp.com",
  projectId: "flight-book-82ea4",
  storageBucket: "flight-book-82ea4.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123...",
  measurementId: "G-XXXXXXXXXX"
}
```

### Step 2: Add Environment Variables to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site: **boookflight**
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable** and add these **ONE BY ONE**:

| Variable Name | Value (get from Firebase Console) |
|---------------|-----------------------------------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `flight-book-82ea4.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `flight-book-82ea4` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `flight-book-82ea4.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Your App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Your Measurement ID (optional) |
| `VITE_API_URL` | Your backend API URL (e.g., `https://your-backend.com/api`) |
| `VITE_PAYSTACK_PUBLIC_KEY` | Your Paystack public key |

**IMPORTANT**: Use **LIVE** Paystack keys for production, not TEST keys!

### Step 3: Add Netlify Domain to Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **Authentication** from the left sidebar
3. Click the **Settings** tab
4. Scroll to **Authorized domains**
5. Click **Add domain**
6. Add: `boookflight.netlify.app`
7. Click **Add**

### Step 4: Redeploy Your Site

After adding all environment variables:

1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the build to complete
4. Test your login page

---

## Verification Checklist

After redeployment, verify:

- [ ] Login page loads without Firebase error
- [ ] Can sign in with email/password
- [ ] Can sign in with Google
- [ ] Can sign in with Apple (if configured)
- [ ] Can register new account
- [ ] User stays logged in after page refresh

---

## Common Issues & Solutions

### Issue: Still seeing auth error after adding variables
**Solution**: Make sure you clicked "Redeploy" after adding variables. Environment variables only take effect after a new build.

### Issue: Google Sign-In not working
**Solution**:
1. Go to Firebase Console → Authentication → Sign-in method
2. Click Google → Edit
3. Add `boookflight.netlify.app` to authorized domains

### Issue: "API calls are failing"
**Solution**: Update `VITE_API_URL` to point to your deployed backend URL, not `localhost:3001`

### Issue: Environment variables not showing up
**Solution**: Variable names must start with `VITE_` for Vite to include them in the build

---

## Quick Reference: All Required Environment Variables

```bash
# Firebase (REQUIRED)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=flight-book-82ea4.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=flight-book-82ea4
VITE_FIREBASE_STORAGE_BUCKET=flight-book-82ea4.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# API (REQUIRED)
VITE_API_URL=https://your-backend-url.com/api

# Paystack (REQUIRED for payments)
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx

# Optional
VITE_VAPID_PUBLIC_KEY=
VITE_CDN_URL=
VITE_USE_CDN=false
VITE_USE_LOGO_API=false
```

---

## Need Help?

If you're still seeing errors:
1. Check browser console for detailed error messages
2. Verify all environment variables are set correctly (no typos)
3. Make sure Firebase project ID matches everywhere
4. Confirm authorized domains include your Netlify domain
