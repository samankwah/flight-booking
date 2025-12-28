# Quick Start Guide - Admin Dashboard

## Getting Started

This guide will help you quickly set up and start using the admin dashboard.

## Prerequisites

- Node.js installed
- Firebase project configured
- Admin user account

## Step 1: Create an Admin User

### Method 1: Via Firestore Console

1. Go to Firebase Console → Firestore Database
2. Navigate to the `users` collection
3. Find your user document (by email or UID)
4. Add a field:
   - Field: `role`
   - Type: `string`
   - Value: `admin`
5. Save the document

### Method 2: Via Firebase CLI

```javascript
// In Firebase Console or using Admin SDK
const admin = require('firebase-admin');
const db = admin.firestore();

await db.collection('users').doc('USER_UID').set({
  role: 'admin',
  email: 'admin@example.com',
  displayName: 'Admin User',
  createdAt: new Date().toISOString(),
  emailVerified: true
}, { merge: true });
```

## Step 2: Access the Admin Dashboard

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:5173/login`

3. Log in with your admin credentials

4. Navigate to: `http://localhost:5173/admin`

## Step 3: Navigate the Dashboard

### Main Navigation

- **Dashboard**: Overview and statistics
- **Bookings**: Manage all flight bookings
- **Users**: Manage user accounts and roles
- **Special Offers**: Create and manage promotional offers
- **Top Deals**: Manage featured travel deals
- **Settings**: System settings and configuration

## Common Tasks

### Managing Bookings

1. Go to **Bookings** from the sidebar
2. Use the search bar to find specific bookings
3. Filter by status (confirmed, pending, cancelled)
4. Click the eye icon to view details
5. Click the edit icon to change status
6. Click the delete icon to remove a booking

### Managing Users

1. Go to **Users** from the sidebar
2. Search by name, email, or user ID
3. Filter by role (admin/user)
4. Click edit icon to change user role
5. Click delete icon to remove a user

### Creating Special Offers

1. Go to **Special Offers** from the sidebar
2. Click **Add Offer** button
3. Fill in the form:
   - Title: e.g., "Summer Sale to Paris"
   - Description: Detailed description
   - Image URL: Link to offer image
   - Destination: e.g., "Paris"
   - Country: e.g., "France"
   - Price: Offer price
   - Original Price: (optional) For showing discounts
   - Valid From/Until: Date range
   - Category: Select type (flight, hotel, package, visa)
   - Featured: Toggle for homepage display
   - Active: Toggle to enable/disable
4. Click **Create Offer**

### Creating Top Deals

1. Go to **Top Deals** from the sidebar
2. Click **Add Deal** button
3. Fill in the form:
   - Title: e.g., "Luxury Hotel in Maldives"
   - Description: Detailed description
   - Image URL: Link to deal image
   - Destination: e.g., "Malé"
   - Country: e.g., "Maldives"
   - Price: Deal price
   - Category: e.g., "Luxury Resort"
   - Rating: 1-5 stars
   - Reviews: Number of reviews
   - Per Night: Toggle if price is per night
   - Featured/Active: Toggle accordingly
4. Click **Create Deal**

## Tips & Tricks

### Search Functionality

- **Bookings**: Search by booking ID, passenger name, email, or route codes
- **Users**: Search by name, email, or user ID

### Status Management

- **Bookings**: Update status to track booking progress
  - `pending`: Awaiting confirmation
  - `confirmed`: Confirmed booking
  - `cancelled`: Cancelled booking

### Active/Inactive Toggles

- Use the toggle switch on offers and deals to quickly enable/disable them
- Inactive items won't be shown to regular users
- You can see all items (active and inactive) in the admin panel

### Featured Items

- Mark offers and deals as "featured" to display them prominently
- Featured items typically appear on the homepage or in special sections

## Keyboard Shortcuts

- **Esc**: Close modals
- **Ctrl/Cmd + K**: Search (in search fields)

## Mobile Access

The admin dashboard is fully responsive:
- Tap the menu icon (☰) to open the sidebar on mobile
- All features work on tablets and phones
- Forms are optimized for touch input

## Security Best Practices

1. **Never share admin credentials**
2. **Use strong passwords** for admin accounts
3. **Regularly audit admin users** in the Users section
4. **Log out** when done using the admin panel
5. **Review bookings** regularly for suspicious activity

## Troubleshooting

### Can't Access Admin Dashboard

**Problem**: Redirected to homepage or see "Access Denied"

**Solution**:
1. Verify your user has `role: "admin"` in Firestore
2. Log out and log back in
3. Clear browser cache and cookies
4. Check browser console for errors

### Data Not Loading

**Problem**: Dashboard shows "Loading..." indefinitely

**Solution**:
1. Check internet connection
2. Verify Firebase configuration
3. Check Firestore security rules
4. Open browser console to see errors

### Can't Create/Update Items

**Problem**: Form submissions fail

**Solution**:
1. Check all required fields are filled
2. Verify Firestore security rules allow admin writes
3. Check browser console for errors
4. Try logging out and back in

## Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Review Firestore security rules
3. Verify Firebase configuration in `.env` file
4. Check the `ADMIN_IMPLEMENTATION_SUMMARY.md` for technical details

## Next Steps

Once you're comfortable with the basics:

1. Explore all sections of the admin dashboard
2. Set up some sample data (offers, deals)
3. Test the search and filter functionality
4. Review the statistics on the Dashboard page
5. Consider configuring email notifications (if implemented)

## Important Notes

- Changes made in the admin panel are immediately reflected to users
- Always double-check before deleting items (action is irreversible)
- Use the preview features before making offers/deals live
- Keep the admin user list minimal for security

---

**You're all set!** Start managing your flight booking platform with ease. 🚀
