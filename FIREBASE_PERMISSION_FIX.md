# Firebase Permission Error - Fix Guide

## The Error You're Seeing

```
Caller does not have required permission to use project flight-book-82ea4.
Grant the caller the roles/serviceusage.serviceUsageConsumer role
```

This means your Firebase service account needs additional permissions.

---

## ✅ SOLUTION 1: Grant Required Permissions (Recommended)

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/iam-admin/iam?project=flight-book-82ea4
2. Or click the link in the error message

### Step 2: Find Your Service Account
Look for:
```
firebase-adminsdk-fbsvc@flight-book-82ea4.iam.gserviceaccount.com
```

### Step 3: Grant Permissions
1. Click the ✏️ (Edit) icon next to the service account
2. Click **"+ ADD ANOTHER ROLE"**
3. Search for and add these roles:
   - **Service Usage Consumer** (`roles/serviceusage.serviceUsageConsumer`)
   - **Firebase Admin SDK Administrator Service Agent** (if not already present)

4. Click **"SAVE"**

### Step 4: Wait & Retry
1. Wait 2-3 minutes for permissions to propagate
2. Run the setup script again:
   ```bash
   node server/scripts/setupFirstAdmin.js 0243999631a@gmail.com
   ```

---

## ✅ SOLUTION 2: Manual Setup via Firebase Console (Alternative)

If Solution 1 doesn't work or you don't have access to Google Cloud Console, use this method:

### Step 1: Register Your Account
1. Go to http://localhost:5173/register
2. Register with: `0243999631a@gmail.com`
3. Complete registration

### Step 2: Get Your User ID
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **flight-book-82ea4**
3. Go to **Authentication** → **Users**
4. Find user: `0243999631a@gmail.com`
5. Copy the **UID** (looks like: `abc123xyz456`)

### Step 3: Update Firestore Manually
1. In Firebase Console, go to **Firestore Database**
2. Go to **users** collection
3. Find or create document with your UID
4. Set these fields:
   ```json
   {
     "email": "0243999631a@gmail.com",
     "isAdmin": true,
     "isDisabled": false,
     "createdAt": [current timestamp],
     "updatedAt": [current timestamp]
   }
   ```
5. Click **Save**

### Step 4: Set Custom Claim (via Browser Console)
Since we can't use the script, we'll use a temporary workaround:

1. Start your server: `npm run dev:server`
2. Create this temporary file: `server/scripts/manualAdmin.js`

```javascript
// server/scripts/manualAdmin.js
import '../config/env.js';
import { auth } from '../config/firebase.js';

const uid = 'YOUR_UID_HERE'; // Replace with your UID from Step 2

auth.setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('✅ Admin claim set successfully!');
    console.log('Log out and log back in to see admin panel.');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
```

3. Replace `'YOUR_UID_HERE'` with your actual UID
4. Run: `node server/scripts/manualAdmin.js`
5. Delete the file after running

### Step 5: Log In
1. Go to http://localhost:5173/login
2. Log in with `0243999631a@gmail.com`
3. You should see **"Admin Panel"** link in header
4. Access: http://localhost:5173/admin

---

## ✅ SOLUTION 3: Use a Different Service Account

### Step 1: Create New Service Account with Full Permissions
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **flight-book-82ea4**
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the new JSON file

### Step 2: Replace the Old Key
1. Replace content of `server/config/firebase-admin-sdk.json` with new key
2. Restart your server
3. Run setup script again

---

## 🎯 Quick Test

After any solution, test with:

```bash
# 1. Make sure server is running
npm run dev:server

# 2. Run setup script
node server/scripts/setupFirstAdmin.js 0243999631a@gmail.com

# 3. If successful, log out and log back in
# 4. Access http://localhost:5173/admin
```

---

## 📧 Emails are Working!

Your Resend email service is now configured:
```
✅ RESEND_API_KEY: re_Wdbdk5N2_AEptMR2pyZi7Jp6f1eFNu9hx
✅ FROM EMAIL: onboarding@resend.dev
```

Emails will now be sent via Resend! 🎉

---

## 🆘 Still Having Issues?

### Check Server Logs
```bash
npm run dev:server
```

Look for:
- `✅ Firebase Admin initialized successfully`
- `✅ Resend email service initialized`

### Verify Email
Make sure you registered with: `0243999631a@gmail.com` (exact match)

### Permissions Take Time
After granting permissions in Google Cloud Console, wait 5 minutes before retrying.

---

## 💡 Why This Happens

Firebase service accounts need specific Google Cloud permissions to work. By default, they don't have the `serviceusage.serviceUsageConsumer` role which is required to interact with Firebase Auth API from the Admin SDK.

This is a security feature to prevent unauthorized access.
