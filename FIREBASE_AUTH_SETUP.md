# Firebase Authentication Setup Guide

This guide will help you configure Google and Apple authentication providers in your Firebase project.

## Prerequisites
- Firebase project created
- Firebase configuration added to `.env` file

## 1. Enable Google Authentication

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**

### Step 2: Enable Google Provider
1. Click on **Google** in the list of providers
2. Toggle the **Enable** switch to ON
3. Add your **Support email** (required)
4. Click **Save**

That's it! Google authentication is now enabled for your app.

---

## 2. Enable Apple Authentication

### Step 1: Apple Developer Account Setup
You need an **Apple Developer Account** ($99/year) to enable Apple Sign-In.

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Sign in with your Apple ID
3. Enroll in the Apple Developer Program if you haven't already

### Step 2: Create an App ID
1. In Apple Developer Portal, go to **Certificates, Identifiers & Profiles**
2. Click on **Identifiers** → **+** button
3. Select **App IDs** and click **Continue**
4. Choose **App** and click **Continue**
5. Fill in:
   - **Description**: Your app name (e.g., "Flight Booking App")
   - **Bundle ID**: Use explicit Bundle ID (e.g., `com.yourcompany.flightbooking`)
6. Scroll down and enable **Sign in with Apple**
7. Click **Continue** and then **Register**

### Step 3: Create a Service ID
1. Go back to **Identifiers** → **+** button
2. Select **Services IDs** and click **Continue**
3. Fill in:
   - **Description**: Your service name (e.g., "Flight Booking Web")
   - **Identifier**: Use a unique identifier (e.g., `com.yourcompany.flightbooking.web`)
4. Check **Sign in with Apple**
5. Click **Configure** next to Sign in with Apple
6. In the configuration:
   - **Primary App ID**: Select the App ID you created earlier
   - **Web Domain**: Add your domain (e.g., `yourapp.com`)
   - **Return URLs**: Add your Firebase OAuth redirect URL:
     ```
     https://YOUR-PROJECT-ID.firebaseapp.com/__/auth/handler
     ```
     (Replace `YOUR-PROJECT-ID` with your actual Firebase project ID)
7. Click **Save**, then **Continue**, then **Register**

### Step 4: Create a Private Key
1. Go to **Keys** → **+** button
2. Fill in:
   - **Key Name**: "Apple Sign In Key"
3. Check **Sign in with Apple**
4. Click **Configure** and select your Primary App ID
5. Click **Save**, then **Continue**, then **Register**
6. **Download the key file** (.p8) - you can only download it once!
7. Note the **Key ID** shown on the page

### Step 5: Configure Firebase
1. Go to Firebase Console
2. Navigate to **Authentication** → **Sign-in method**
3. Click on **Apple** in the list of providers
4. Toggle the **Enable** switch to ON
5. Fill in:
   - **Service ID**: The identifier you created (e.g., `com.yourcompany.flightbooking.web`)
   - **Apple Team ID**: Found in Apple Developer Portal → **Membership**
   - **Private Key ID**: The Key ID from Step 4
   - **Private Key**: Open the .p8 file you downloaded and paste its contents
6. Click **Save**

### Step 6: Add OAuth Redirect Domain
1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add your production domain (e.g., `yourapp.com`)
3. Click **Add domain**

---

## 3. Testing Authentication

### Local Development
For local testing, Firebase automatically includes `localhost` in authorized domains.

### Test Google Sign-In
1. Clear localStorage: `localStorage.removeItem('flight_booking_welcome_seen')`
2. Refresh the page
3. Click the Google button in the welcome modal
4. Sign in with your Google account

### Test Apple Sign-In
1. Apple Sign-In only works on:
   - Production domains (HTTPS)
   - localhost (for development)
2. Click the Apple button
3. Sign in with your Apple ID

---

## 4. Common Issues & Solutions

### Issue: "Unauthorized domain" error
**Solution**: Add your domain to Firebase authorized domains in Authentication → Settings

### Issue: Apple Sign-In not working on localhost
**Solution**: Apple Sign-In requires HTTPS. Use `https://localhost` or test in production

### Issue: "Invalid service ID" error
**Solution**: Double-check that the Service ID in Firebase matches exactly with Apple Developer Portal

### Issue: "Invalid private key" error
**Solution**:
- Make sure you copied the entire contents of the .p8 file
- Ensure there are no extra spaces or line breaks
- The key should start with `-----BEGIN PRIVATE KEY-----`

---

## 5. Security Best Practices

1. **Never commit** your Firebase config or Apple private key to version control
2. Use **environment variables** for sensitive data
3. Enable **Email enumeration protection** in Firebase Authentication settings
4. Set up **App Check** to prevent abuse
5. Implement **rate limiting** on your backend

---

## 6. Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Google Sign-In Guide](https://firebase.google.com/docs/auth/web/google-signin)
- [Apple Sign-In Guide](https://firebase.google.com/docs/auth/web/apple)
- [Apple Developer Documentation](https://developer.apple.com/sign-in-with-apple/)

---

## Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Firebase configuration in `.env`
3. Ensure all steps above are completed correctly
4. Check Firebase Authentication logs for detailed error information
