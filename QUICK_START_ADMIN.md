# Quick Start Guide: Admin Dashboard

This guide will help you quickly set up and start using the admin dashboard.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Creating Your First Admin User](#creating-your-first-admin-user)
3. [Accessing the Admin Dashboard](#accessing-the-admin-dashboard)
4. [Quick Tour of Features](#quick-tour-of-features)
5. [Common Tasks](#common-tasks)

## Prerequisites

Before you can use the admin dashboard, ensure:
- ✅ The application is running
- ✅ You have Firebase configured
- ✅ You have a user account created

## Creating Your First Admin User

### Method 1: Using Firebase Console (Recommended)

1. **Open Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project

2. **Navigate to Firestore Database**
   - Click on "Firestore Database" in the left sidebar
   - Find the `users` collection

3. **Find Your User Document**
   - Locate the document with your user ID
   - Click to open it

4. **Add Admin Role**
   - Click "Edit document" or add a new field
   - Add/Update the `role` field:
     ```
     Field: role
     Type: string
     Value: admin
     ```
   - Click "Update" or "Save"

5. **Refresh Your Browser**
   - Log out and log back in
   - You should now see the "Admin" link in the header

### Method 2: Using Firestore Admin SDK (For Developers)

If you have backend access:

```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

async function makeUserAdmin(userId) {
  await db.collection('users').doc(userId).update({
    role: 'admin',
    isActive: true
  });
  console.log(`User ${userId} is now an admin!`);
}

// Usage
makeUserAdmin('YOUR_USER_ID_HERE');
```

### Method 3: Direct Firestore Update (Quick Test)

For testing purposes only:

```javascript
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './src/firebase';

// Run this in browser console after logging in
const userId = 'YOUR_USER_ID'; // Get from currentUser.uid
await updateDoc(doc(db, 'users', userId), {
  role: 'admin'
});
// Then refresh the page
```

## Accessing the Admin Dashboard

1. **Log in to the application**
   - Use your admin credentials
   - Make sure your account has `role: 'admin'` in Firestore

2. **Navigate to Admin Dashboard**
   - Click the purple "Admin" link in the header
   - Or directly visit: `http://localhost:5173/admin` (adjust port as needed)

3. **Verify Access**
   - You should see the admin dashboard with tabs:
     - Analytics
     - Users
     - Bookings
     - Settings

## Quick Tour of Features

### 📊 Analytics Tab
**What you'll see:**
- Total users count
- Total bookings
- Revenue statistics
- Monthly revenue chart
- Popular destinations

**Quick Actions:**
- View overall business metrics
- Track revenue trends
- Identify popular routes

### 👥 Users Tab
**What you'll see:**
- List of all users
- User roles and status
- Join dates and last login

**Quick Actions:**
- Search for users by email/name
- Edit user roles
- Activate/deactivate users
- Delete users (with confirmation)

**Try it:**
1. Use the search bar to find a user
2. Click the edit icon to change their role
3. Toggle active status if needed

### ✈️ Bookings Tab
**What you'll see:**
- All flight bookings
- Passenger information
- Booking status
- Payment details

**Quick Actions:**
- Search bookings by passenger name/email/ID
- Filter by status (confirmed, pending, cancelled)
- View detailed booking information
- Confirm pending bookings
- Cancel bookings
- Delete bookings

**Try it:**
1. Click the eye icon to view booking details
2. Use filters to see only pending bookings
3. Click the check icon to confirm a booking

### ⚙️ Settings Tab
**What you'll see:**
- System information
- Application settings
- Quick actions

**Quick Actions:**
- View your admin details
- Toggle email notifications
- Toggle auto-confirm bookings
- Enable/disable maintenance mode
- Access danger zone (super admin only)

## Common Tasks

### Task 1: Promote a User to Admin

```
1. Go to Users tab
2. Search for the user
3. Click edit icon (pencil)
4. Select "Admin" from dropdown
5. Click "Save Changes"
6. Done! User can now access admin panel
```

### Task 2: Confirm a Pending Booking

```
1. Go to Bookings tab
2. Filter by "Pending" status
3. Find the booking to confirm
4. Click the green check icon
5. Booking status updates to "Confirmed"
```

### Task 3: View Revenue This Month

```
1. Go to Analytics tab
2. Look at the "Revenue by Month" chart
3. Current month is the last bar
4. See both revenue and booking count
```

### Task 4: Find a Specific User

```
1. Go to Users tab
2. Type email or name in search box
3. Results filter automatically
4. Click to view/edit user details
```

### Task 5: View Booking Details

```
1. Go to Bookings tab
2. Find the booking (use search if needed)
3. Click the eye icon
4. Modal shows complete booking info:
   - Passenger details
   - Flight information
   - Payment status
   - Selected seats
```

### Task 6: Cancel a Booking

```
1. Go to Bookings tab
2. Find the booking
3. Click the X (cancel) icon
4. Booking status changes to "Cancelled"
```

### Task 7: Deactivate a User

```
1. Go to Users tab
2. Find the user
3. Click the toggle icon (circle with X)
4. User status changes to "Inactive"
5. User can no longer access certain features
```

## Role Hierarchy

Understanding the three role levels:

### 👤 User (Default)
- Access to booking features
- Personal dashboard
- No admin access

### 👨‍💼 Admin
- All user features
- Full admin dashboard access
- User management
- Booking management
- Analytics viewing
- Settings (except danger zone)

### 👨‍💼 Super Admin
- All admin features
- Danger zone access
- Can reset analytics
- Can clear all notifications
- Highest level of control

## Security Tips

1. **Protect Admin Credentials**
   - Use strong passwords
   - Don't share admin accounts
   - Log out when done

2. **Be Careful with Destructive Actions**
   - Always confirm before deleting
   - Deletions are permanent
   - Test on non-production data first

3. **Regular Monitoring**
   - Check analytics regularly
   - Review new bookings
   - Monitor user activity

4. **Backup Important Data**
   - Export data regularly
   - Keep records of important bookings
   - Document major changes

## Troubleshooting

### Problem: Can't See Admin Link
**Solution:**
1. Check your user role in Firestore
2. Ensure `role` field is set to `admin` or `superadmin`
3. Log out and log back in
4. Clear browser cache

### Problem: Access Denied Error
**Solution:**
1. Verify you're logged in
2. Check Firestore rules allow admin access
3. Confirm role is correctly set
4. Check browser console for errors

### Problem: Data Not Loading
**Solution:**
1. Check internet connection
2. Verify Firestore is accessible
3. Check browser console for errors
4. Refresh the page

### Problem: Changes Not Saving
**Solution:**
1. Check Firestore rules
2. Verify write permissions
3. Check for error messages
4. Try again after refreshing

## Next Steps

Now that you're familiar with the basics:

1. **Explore All Features**
   - Click around each tab
   - Try different filters
   - View sample data

2. **Customize Settings**
   - Configure email notifications
   - Set up auto-confirm
   - Adjust preferences

3. **Review Analytics**
   - Monitor business metrics
   - Track trends
   - Identify opportunities

4. **Read Full Documentation**
   - See [ADMIN_IMPLEMENTATION_SUMMARY.md](./ADMIN_IMPLEMENTATION_SUMMARY.md) for detailed features
   - See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for advanced setup

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the full documentation
3. Check browser console for errors
4. Contact your development team

---

**Congratulations!** 🎉 You're now ready to use the admin dashboard. Start by exploring the Analytics tab to get an overview of your application's performance.
