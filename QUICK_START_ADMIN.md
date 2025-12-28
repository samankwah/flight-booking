# Quick Start Guide - Admin Panel

## ⚡ 5-Minute Setup

### 1. Register Your Admin Account (1 min)

```bash
# Start the app
npm run dev
```

Go to http://localhost:5173/register and create an account

### 2. Make Yourself Admin (2 min)

```bash
# Run the admin setup script with YOUR email
node server/scripts/setupFirstAdmin.js your@email.com
```

Expected output:
```
✅ User found: abc123xyz
✅ Admin custom claim set
✅ Firestore document updated
🎉 SUCCESS! Admin setup complete!
```

### 3. Access Admin Panel (1 min)

1. **Log out** from the app (IMPORTANT!)
2. **Log back in** with your credentials
3. You should see "Admin Panel" link in the header
4. Click it or go to: http://localhost:5173/admin

### 4. Done! 🎉

You now have full admin access to:
- Dashboard
- Booking Management
- User Management
- University Management
- Application Management
- Analytics
- And more!

---

## ⚠️ SECURITY WARNING

**Your Firebase private key is now public!** After setup, rotate it:

1. [Firebase Console](https://console.firebase.google.com/) → flight-book-82ea4
2. Project Settings → Service Accounts
3. Generate New Private Key
4. Replace `server/config/firebase-admin-sdk.json`

---

## 🐛 Troubleshooting

### "I don't see Admin Panel link"
- Did you log out and log back in?
- Check browser console for errors
- Run the setup script again

### "Access Denied" error
- Make sure you ran: `node server/scripts/setupFirstAdmin.js your@email.com`
- Use the EXACT email you registered with
- Log out and log back in

### "Firebase credentials not configured"
- The credentials file was created automatically
- Check `server/config/firebase-admin-sdk.json` exists
- Restart your server: `npm run dev:server`

---

## 📧 Email Setup (Optional)

For now, emails are mocked (logged to console). To enable real emails:

### SendGrid Issue Fix

If you can't log into SendGrid:
1. Create a NEW account at https://sendgrid.com/
2. Use a different email address
3. Or use an alternative like Resend (https://resend.com/)

For now, the app works fine without real emails!

---

## 🎯 Next Steps

1. Create a test booking to see data in the dashboard
2. Create another user account and make them admin
3. Explore all admin pages
4. Check `SETUP_GUIDE.md` for full documentation

---

## 📞 Need Help?

Check:
- `SETUP_GUIDE.md` - Full setup documentation
- `ADMIN_IMPLEMENTATION_SUMMARY.md` - Technical details
- Server console - Look for "✅ Firebase Admin initialized"
- Browser console - Look for errors

Happy admin-ing! 🚀
