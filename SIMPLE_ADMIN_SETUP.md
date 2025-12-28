# Simple Admin Setup - No Permissions Needed!

## 🚀 Quick Setup (5 Minutes)

Since you're getting the Firebase permission error, here's a simpler way:

---

## Step 1: Register Your Account (1 minute)

```bash
# Start the app
npm run dev
```

Go to: http://localhost:5173/register

Register with your email: **0243999631a@gmail.com**

---

## Step 2: Get Your UID (1 minute)

### Option A: From Firebase Console
1. Go to https://console.firebase.google.com/
2. Select: **flight-book-82ea4**
3. Click **Authentication** → **Users**
4. Find: `0243999631a@gmail.com`
5. Copy the **UID** (long string like `abc123xyz...`)

### Option B: From Browser Console
1. After registering, press F12 to open console
2. Paste this code:
   ```javascript
   firebase.auth().currentUser.uid
   ```
3. Copy the UID that appears

---

## Step 3: Update Firestore (2 minutes)

1. Go to https://console.firebase.google.com/
2. Select: **flight-book-82ea4**
3. Click **Firestore Database**
4. Click **Start Collection** (or go to **users** if it exists)
5. Collection ID: `users`
6. Document ID: **[YOUR_UID_FROM_STEP_2]**
7. Add fields:

| Field | Type | Value |
|-------|------|-------|
| `email` | string | `0243999631a@gmail.com` |
| `isAdmin` | boolean | `true` |
| `isDisabled` | boolean | `false` |
| `displayName` | string | `Your Name` |

8. Click **Save**

---

## Step 4: Access Admin Panel (1 minute)

1. **Log out** from the app (IMPORTANT!)
2. **Log back in** with `0243999631a@gmail.com`
3. You should see **"Admin Panel"** link in header
4. Click it or go to: http://localhost:5173/admin

**Note**: The Custom Claim won't be set automatically with this method, but the app checks `isAdmin` in Firestore first, so the admin panel will still work! The only limitation is that some Firebase Admin SDK features might not work until you fix the permission issue.

---

## ✅ Done!

You now have access to:
- Dashboard
- Booking Management
- User Management
- University Management
- Application Management
- And all other admin features!

---

## 🔧 Optional: Fix Permission Issue Later

When you're ready to fix the Firebase permission issue:

1. Visit: https://console.cloud.google.com/iam-admin/iam?project=flight-book-82ea4
2. Find: `firebase-adminsdk-fbsvc@flight-book-82ea4.iam.gserviceaccount.com`
3. Click Edit (✏️)
4. Add role: **Service Usage Consumer**
5. Save and wait 5 minutes
6. Run: `node server/scripts/setupFirstAdmin.js 0243999631a@gmail.com`

But this is optional - your admin panel works without it!

---

## 📧 Email Service is Ready!

Your Resend email service is configured and ready:
- ✅ API Key: Set
- ✅ From Email: `onboarding@resend.dev`
- ✅ Real emails will be sent via Resend!

When admin users update booking or application statuses, real emails will be sent to customers! 🎉

---

## 🆘 Troubleshooting

### "I don't see Admin Panel link"
1. Did you set `isAdmin: true` in Firestore?
2. Did you log out and log back in?
3. Check browser console for errors

### "Access Denied" error
- Make sure the Firestore document UID matches your user's UID exactly
- Check that `isAdmin` is set to boolean `true` (not string "true")

### Can't find users collection
- Create it manually in Step 3
- Or register first, then the collection might be created automatically

---

## 🎯 What's Next?

1. Test the admin panel
2. Create another user and make them admin
3. Test booking management
4. Test email notifications (they're real now!)
5. Explore all admin features

Happy admin-ing! 🚀
