# Admin Panel Setup Guide

## ⚠️ SECURITY WARNING

**IMPORTANT**: The Firebase private key you shared is now public. After completing this setup, you MUST rotate the service account key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project "flight-book-82ea4"
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Replace the content of `server/config/firebase-admin-sdk.json` with the new key

---

## Setup Status

### ✅ Completed
- Firebase Admin SDK credentials saved
- Admin backend API (72 endpoints)
- Admin frontend pages (10 pages)
- Authentication with Custom Claims
- Email service (with mock fallback)

### 🔧 To Do
1. Set up first admin user
2. (Optional) Configure SendGrid for emails
3. Test admin panel
4. Deploy Firestore security rules

---

## Step 1: Install Dependencies

Make sure all dependencies are installed:

```bash
# Install SendGrid (optional - will use mock emails if not configured)
npm install @sendgrid/mail

# If any other dependencies are missing
npm install
```

---

## Step 2: Set Up First Admin User

### Option A: Using the Setup Script (Recommended)

1. **Register a user account**:
   - Start your frontend: `npm run dev`
   - Go to http://localhost:5173/register
   - Register with your email (e.g., your@email.com)

2. **Run the setup script**:
   ```bash
   node server/scripts/setupFirstAdmin.js your@email.com
   ```

   The script will:
   - Find your user account
   - Set the admin Custom Claim
   - Update Firestore with admin status
   - Display success message

3. **Log out and log back in**:
   - The admin status won't take effect until you log out and log back in
   - After logging in, you can access: http://localhost:5173/admin

### Option B: Manual Setup via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **flight-book-82ea4**
3. Go to **Authentication** → **Users**
4. Find your user and copy the UID
5. Go to **Firestore Database** → **users** collection
6. Find or create document with your UID
7. Set fields:
   ```json
   {
     "isAdmin": true,
     "isDisabled": false,
     "email": "your@email.com"
   }
   ```
8. For Custom Claims, you need to use Firebase Admin SDK or the setup script

---

## Step 3: SendGrid Setup (Optional)

### Issue: "You are not authorized to access this account"

This error typically means:
- The account is locked/suspended
- Wrong login credentials
- Account doesn't exist

### Solutions:

#### Solution 1: Create New SendGrid Account
1. Go to https://sendgrid.com/
2. Click "Sign Up" (not "Log In")
3. Create a NEW account with a different email
4. Verify your email
5. Complete account setup

#### Solution 2: Password Reset
1. Go to https://sendgrid.com/
2. Click "Forgot Password?"
3. Enter your email
4. Check your email for reset link

#### Solution 3: Contact SendGrid Support
1. Go to https://support.sendgrid.com/
2. Submit a ticket about account access

#### Solution 4: Use Alternative Email Service (Recommended for Testing)

**For now, emails will be mocked**. The app will work fine, but emails will only be logged to console.

When you're ready for production, you have these alternatives:

1. **Resend** (easiest):
   - Sign up at https://resend.com/
   - Free tier: 100 emails/day
   - Update `server/services/emailService.js` to use Resend

2. **Mailgun**:
   - Sign up at https://www.mailgun.com/
   - Free tier: 5,000 emails/month

3. **Amazon SES**:
   - Sign up at https://aws.amazon.com/ses/
   - Very cheap, pay-as-you-go

### If You Get SendGrid Working

1. Get your API key from SendGrid dashboard
2. Update `.env`:
   ```env
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```
3. Restart your server

---

## Step 4: Test Admin Panel

### Start the Application

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev
```

### Test Checklist

1. **Login as Admin**:
   - Go to http://localhost:5173/login
   - Login with your admin account
   - You should see "Admin Panel" link in header

2. **Access Admin Panel**:
   - Click "Admin Panel" or go to http://localhost:5173/admin
   - You should see the dashboard with stats

3. **Test Each Page**:
   - ✅ Dashboard - View overview
   - ✅ Bookings - No bookings yet (that's normal)
   - ✅ Users - Should see yourself
   - ✅ Universities - No data yet (need to import or create)
   - ✅ Applications - No data yet
   - ✅ Programs - No data yet
   - ✅ Offers - No data yet
   - ✅ Deals - No data yet
   - ✅ Analytics - No data yet
   - ✅ Settings - View settings

4. **Test User Management**:
   - Go to Users page
   - You should see yourself listed
   - Try to click "Revoke Admin" on yourself - it should be disabled
   - Create another user account (register with different email)
   - Make them admin using the "Make Admin" button
   - Log in as that user - they should now have admin access

---

## Step 5: Deploy Firestore Security Rules

### Update Firestore Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **flight-book-82ea4**
3. Go to **Firestore Database** → **Rules**
4. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check admin status
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }

    // Bookings - users can read their own, admins can do anything
    match /bookings/{bookingId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if request.auth != null;
      allow update, delete: if isAdmin();
    }

    // Users - users can read their own, admins can do anything
    match /users/{userId} {
      allow read: if request.auth != null &&
        (userId == request.auth.uid || isAdmin());
      allow create: if request.auth != null && userId == request.auth.uid;
      allow update, delete: if isAdmin();
    }

    // Special Offers - public read, admin write
    match /specialOffers/{offerId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Top Deals - public read, admin write
    match /topDeals/{dealId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Universities - public read, admin write
    match /universities/{universityId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Study Abroad Applications
    match /studyAbroadApplications/{applicationId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAdmin();
    }

    // Study Abroad Programs - public read, admin write
    match /studyAbroadPrograms/{programId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

5. Click **Publish**

---

## Common Issues & Solutions

### Issue: "Firebase credentials not configured"

**Solution**: Check that `server/config/firebase-admin-sdk.json` exists and has valid credentials.

### Issue: "Cannot access admin panel"

**Solutions**:
1. Make sure you're logged in
2. Make sure you ran the `setupFirstAdmin.js` script
3. Log out and log back in (Custom Claims only update on new login)
4. Check browser console for errors

### Issue: Admin users can't see other users

**Solution**: Make sure Firestore security rules are deployed (Step 5)

### Issue: Emails not sending

**Solution**: This is normal if SendGrid isn't configured. Emails will be logged to the server console. The app works fine without emails.

### Issue: "Admin Panel" link not showing in header

**Solution**:
1. Check that `isAdmin` is true in your user's Firestore document
2. Check that Custom Claim is set (run setup script again)
3. Log out and log back in

---

## Next Steps

### For Development
1. ✅ Admin panel is ready to use
2. Create some test bookings to see data
3. Import university data (optional)
4. Test all admin features

### For Production
1. Rotate your Firebase service account key (IMPORTANT!)
2. Set up SendGrid or another email service
3. Deploy Firestore security rules
4. Set up environment variables on your hosting platform
5. Enable CORS for your production domain
6. Set up rate limiting
7. Enable audit logging

---

## Environment Variables Reference

Current setup (`.env`):
```env
# Firebase (already configured via file)
FIREBASE_PROJECT_ID=flight-book-82ea4

# Email (optional - using mock for now)
SENDGRID_API_KEY=your_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# API (if not default)
VITE_API_URL=http://localhost:3001
PORT=3001
```

---

## Support

If you encounter any issues:

1. Check the server console for errors
2. Check the browser console for errors
3. Verify Firebase is initialized (look for "✅ Firebase Admin initialized" message)
4. Make sure you're logged in as an admin user
5. Try logging out and back in

---

## Admin Panel Features

Once set up, you'll have access to:

✅ **Dashboard** - Overview with stats and recent bookings
✅ **Booking Management** - View, refund, delete bookings
✅ **User Management** - Assign admin roles, disable accounts
✅ **University Management** - CRUD operations, toggle featured
✅ **Application Management** - Update status, send emails
✅ **Program Management** - Manage study programs
✅ **Offer Management** - Manage special offers
✅ **Deal Management** - Manage top deals
✅ **Analytics** - Revenue stats, popular routes
✅ **Settings** - Admin preferences

All with proper authentication, security, and role-based access control!
