#!/bin/bash

# Production Setup Script for Paystack Live Keys
# Run this script to set up your production environment

echo "🚀 Setting up production environment with Paystack live keys..."

# Create server/.env if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server/.env file..."
    cat > server/.env << 'EOF'
# Production Environment Variables for Paystack Live Mode
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random-32-chars-minimum
FRONTEND_URL=http://localhost:5173

# Firebase Admin (Backend) - Configure with your Firebase project
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Amadeus API - Switch to production when ready
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret
AMADEUS_HOSTNAME=production

# Paystack Live Keys (PRODUCTION - REAL PAYMENTS)
PAYSTACK_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
PAYSTACK_PUBLIC_KEY=pk_live_YOUR_PUBLIC_KEY_HERE

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
EOF
    echo "✅ Created server/.env with live Paystack keys"
else
    echo "⚠️  server/.env already exists. Please update it manually if needed."
fi

# Create logs directory
mkdir -p server/logs

echo ""
echo "🔑 Paystack Live Keys Configuration:"
echo "   ⚠️  Please update the keys in server/.env with your actual keys"
echo "   ⚠️  Never commit real keys to version control"
echo ""
echo "⚠️  IMPORTANT SECURITY REMINDERS:"
echo "   • Never commit server/.env to version control"
echo "   • Keep these keys secure and rotate regularly"
echo "   • Use test keys for development"
echo "   • Monitor your Paystack dashboard for transactions"
echo ""
echo "📚 Next Steps:"
echo "   1. Update Firebase credentials in server/.env"
echo "   2. Configure Amadeus API keys for production"
echo "   3. Set a strong JWT_SECRET (min 32 characters)"
echo "   4. Test with small amounts first"
echo "   5. Monitor logs and Paystack dashboard"
echo ""
echo "🚀 Ready for production! Your app will now process real payments."







