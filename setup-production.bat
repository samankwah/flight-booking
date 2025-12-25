@echo off
REM Production Setup Script for Paystack Live Keys
REM Run this script to set up your production environment

echo 🚀 Setting up production environment with Paystack live keys...

REM Create server/.env if it doesn't exist
if not exist "server\.env" (
    echo 📝 Creating server/.env file...
    (
        echo # Production Environment Variables for Paystack Live Mode
        echo NODE_ENV=production
        echo PORT=3001
        echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random-32-chars-minimum
        echo FRONTEND_URL=http://localhost:5173
        echo.
        echo # Firebase Admin (Backend) - Configure with your Firebase project
        echo FIREBASE_PROJECT_ID=your-project-id
        echo FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
        echo FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
        echo.
        echo # Amadeus API - Switch to production when ready
        echo AMADEUS_API_KEY=your_amadeus_api_key
        echo AMADEUS_API_SECRET=your_amadeus_api_secret
        echo AMADEUS_HOSTNAME=production
        echo.
        echo # Paystack Live Keys (PRODUCTION - REAL PAYMENTS)
        echo PAYSTACK_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
        echo PAYSTACK_PUBLIC_KEY=pk_live_YOUR_PUBLIC_KEY_HERE
        echo.
        echo # Logging
        echo LOG_LEVEL=info
        echo LOG_FILE=logs/app.log
    ) > server\.env
    echo ✅ Created server/.env with live Paystack keys
) else (
    echo ⚠️  server/.env already exists. Please update it manually if needed.
)

REM Create logs directory
if not exist "server\logs" mkdir server\logs

echo.
echo 🔑 Paystack Live Keys Configuration:
echo    ⚠️  Please update the keys in server/.env with your actual keys
echo    ⚠️  Never commit real keys to version control
echo.
echo ⚠️  IMPORTANT SECURITY REMINDERS:
echo    • Never commit server/.env to version control
echo    • Keep these keys secure and rotate regularly
echo    • Use test keys for development
echo    • Monitor your Paystack dashboard for transactions
echo.
echo 📚 Next Steps:
echo    1. Update Firebase credentials in server/.env
echo    2. Configure Amadeus API keys for production
echo    3. Set a strong JWT_SECRET (min 32 characters)
echo    4. Test with small amounts first
echo    5. Monitor logs and Paystack dashboard
echo.
echo 🚀 Ready for production! Your app will now process real payments.
pause



