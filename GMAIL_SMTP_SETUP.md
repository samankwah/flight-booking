# Gmail SMTP Setup Guide

This guide will help you configure Gmail SMTP for sending booking confirmation emails with PDF boarding passes.

## Why Gmail SMTP?

Resend's test API has restrictions that prevent sending emails to different recipients. Gmail SMTP is a reliable, free alternative that works immediately after setup.

## Prerequisites

- Gmail account (you already have: **0243999631a@gmail.com**)
- 5-10 minutes for setup

## Step-by-Step Setup

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/security
2. Under "Signing in to Google", click on "2-Step Verification"
3. Follow the prompts to enable 2FA (you'll need your phone)
4. Complete the 2FA setup

**Why?** Gmail requires 2FA before you can generate App Passwords.

### Step 2: Generate App Password

1. After enabling 2FA, go to: https://myaccount.google.com/apppasswords

   Or navigate manually:
   - Go to https://myaccount.google.com
   - Click "Security" in the left sidebar
   - Under "Signing in to Google", click "2-Step Verification"
   - Scroll down and click "App passwords"

2. You may need to sign in again

3. In the "Select app" dropdown, choose **"Mail"**

4. In the "Select device" dropdown, choose **"Other (Custom name)"**

5. Type: **Flight Booking System**

6. Click "Generate"

7. Google will show you a 16-character password like: `abcd efgh ijkl mnop`

8. **IMPORTANT**: Copy this password immediately (you won't see it again!)

### Step 3: Update .env File

1. Open `server/.env` file

2. Find the line:
   ```
   GMAIL_APP_PASSWORD=your-16-char-app-password-here
   ```

3. Replace with your generated password (remove spaces):
   ```
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```

4. Verify `GMAIL_USER` is set correctly:
   ```
   GMAIL_USER=0243999631a@gmail.com
   ```

5. Save the file

### Step 4: Restart Server

```bash
cd server
npm start
```

### Step 5: Test Email Sending

Run the test script:

```bash
cd server
node test-email-send.js
```

**Expected output:**
```
✅ PDF ticket generated successfully
✅ confirmed email sent for booking TEST-123456
✅ EMAIL SENT SUCCESSFULLY!
Check your inbox at: stephenamankwah233@gmail.com
```

### Step 6: Check Email

1. Check the inbox at **stephenamankwah233@gmail.com**
2. You should receive an email with:
   - Subject: "✈️ Flight Booking Confirmed - TEST-123456"
   - Beautiful HTML email with flight details
   - **PDF boarding pass attached**

## Complete .env Configuration

Your final `.env` file should look like this:

```bash
# Gmail SMTP - Used for booking confirmation emails with PDF attachments
GMAIL_USER=0243999631a@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop  # Your actual 16-char password
```

## Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution**:
- Make sure 2FA is enabled
- Regenerate App Password
- Copy password without spaces
- Verify `GMAIL_USER` matches the Google account that generated the App Password

### Error: "Gmail SMTP not configured"

**Solution**:
- Check that both `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set in `.env`
- Restart the server after updating `.env`

### Email not received

**Solutions**:
1. Check spam/junk folder
2. Wait 1-2 minutes (Gmail SMTP can be slightly delayed)
3. Check server logs for errors
4. Verify the recipient email is correct in the booking

### Rate Limits

Gmail has sending limits:
- **500 emails per day** (for standard Gmail accounts)
- **100 emails per day** (for trial/new accounts)

This should be more than enough for testing and small-scale production.

## Security Notes

1. **Never commit `.env` file to Git** - It contains sensitive credentials
2. **App Password is like a password** - Keep it secret
3. **Revoke App Passwords** you're not using at https://myaccount.google.com/apppasswords
4. **Each app should have its own App Password** - Don't reuse them

## Production Recommendations

For production, consider:
1. **Verify a custom domain in Resend** - More professional FROM address
2. **Use SendGrid or Mailgun** - Better deliverability and analytics
3. **Dedicated email service** - Separate from personal Gmail

But for now, Gmail SMTP is perfect for testing and getting started!

## What Happens After Setup?

Once configured, the system will automatically:

1. ✅ Generate PDF boarding pass with QR code when booking is created
2. ✅ Send beautiful HTML email to customer
3. ✅ Attach PDF boarding pass to email
4. ✅ Customer receives professional booking confirmation

No additional code changes needed - it just works!

## Questions?

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs for specific error messages
3. Verify all environment variables are set correctly
4. Make sure the server was restarted after updating `.env`
