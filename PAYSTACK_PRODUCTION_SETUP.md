# 🚀 Paystack Production Setup Guide

## 🔑 Live API Keys Configuration

Configure your Paystack live keys for production:

- **Live Public Key**: `pk_live_YOUR_PUBLIC_KEY_HERE`
- **Live Secret Key**: `sk_live_YOUR_SECRET_KEY_HERE`

## ⚠️ Security Warning

**IMPORTANT**: These are live production keys that will process real payments. Keep them secure and never expose them in client-side code or public repositories.

## 📁 Environment Configuration

### 1. Create Backend Environment File

Create `server/.env` with your live keys:

```bash
# Create the backend environment file
cp env.example server/.env
```

Or create it manually with this content:

```env
# Backend Environment Variables
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random
FRONTEND_URL=http://localhost:5173

# Firebase Admin (Backend)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Amadeus API
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret
AMADEUS_HOSTNAME=production

# Paystack Live Keys (PRODUCTION)
PAYSTACK_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
PAYSTACK_PUBLIC_KEY=pk_live_YOUR_PUBLIC_KEY_HERE

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### 2. Frontend Environment Variables

The frontend environment variables are already configured in the build system. The public key is safely exposed to the client.

## 🧪 Testing Production Setup

### Development Mode (Test Payments)
For testing without processing real payments, you can temporarily use test keys:

```env
# Test keys (for development/testing)
PAYSTACK_SECRET_KEY=sk_test_your_test_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_test_public_key
```

### Production Mode (Live Payments)
Use the live keys provided above for production deployments.

## 🔐 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files to version control
- ✅ Use different keys for development and production
- ✅ Rotate keys regularly
- ✅ Store secrets securely (use environment-specific secret management)

### 2. API Key Management
- ✅ Store secret keys only on the server
- ✅ Use public keys only on the frontend
- ✅ Implement proper access controls
- ✅ Monitor API usage

### 3. Code Security
- ✅ Validate all payment inputs
- ✅ Use HTTPS in production
- ✅ Implement proper error handling
- ✅ Log security events

## 🚀 Deployment Checklist

Before going live with real payments:

### Backend Configuration
- [ ] Create `server/.env` with live keys
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper JWT secret (long, random string)
- [ ] Set correct frontend URL
- [ ] Configure Firebase credentials

### Frontend Configuration
- [ ] Ensure VITE_PAYSTACK_PUBLIC_KEY is set correctly
- [ ] Test payment flow in development
- [ ] Verify error handling

### Paystack Dashboard
- [ ] Verify account is activated for live transactions
- [ ] Check webhook URLs are configured
- [ ] Set up payment notifications
- [ ] Configure settlement account

### Security & Compliance
- [ ] Implement HTTPS/SSL
- [ ] Set up proper CORS configuration
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts
- [ ] Implement proper logging

## 🔍 Testing Live Payments

### Initial Tests (Small Amounts)
1. Test with ₦100-500 amounts first
2. Verify payment completion flow
3. Check booking creation
4. Test error scenarios

### Payment Methods to Test
- [ ] Card payments (Visa, Mastercard)
- [ ] Bank transfers
- [ ] Mobile money (if applicable)
- [ ] USSD payments

### Error Scenarios
- [ ] Insufficient funds
- [ ] Invalid card details
- [ ] Network timeouts
- [ ] Payment cancellations

## 📊 Monitoring & Analytics

### Paystack Dashboard
- Monitor transaction volume
- Track success/failure rates
- Review chargeback incidents
- Analyze payment methods usage

### Application Logs
- Payment initiation logs
- Verification logs
- Error logs
- Performance metrics

## 🆘 Troubleshooting

### Common Issues

#### 1. "Invalid API key" Error
- Verify keys are correct and match your Paystack account
- Check if you're using live keys in test mode or vice versa
- Ensure keys are properly loaded from environment variables

#### 2. Payment Not Completing
- Check webhook configuration
- Verify callback URLs
- Review server logs for errors
- Test with Paystack's dashboard

#### 3. CORS Errors
- Configure proper CORS origins
- Ensure frontend URL matches backend configuration
- Check for HTTPS requirements

#### 4. Webhook Not Receiving Events
- Verify webhook URL is accessible
- Check Paystack dashboard for webhook delivery status
- Implement webhook signature verification

## 📞 Support

### Paystack Support
- **Email**: developers@paystack.com
- **Dashboard**: https://dashboard.paystack.com
- **Documentation**: https://paystack.com/docs

### Application Issues
- Check server logs: `tail -f server/logs/app.log`
- Verify environment variables: `echo $PAYSTACK_SECRET_KEY`
- Test API endpoints: `curl -X GET http://localhost:3001/api/payments/config`

## 🎯 Next Steps

1. **Test Thoroughly**: Complete all payment testing scenarios
2. **Go Live Gradually**: Start with small transaction volumes
3. **Monitor Closely**: Watch for any issues in the first 24-48 hours
4. **Scale Up**: Gradually increase transaction volume as confidence builds
5. **Optimize**: Monitor performance and optimize as needed

---

## 💡 Pro Tips

- **Always test with small amounts first**
- **Have a rollback plan** in case of issues
- **Monitor your Paystack dashboard** regularly
- **Keep detailed logs** for troubleshooting
- **Set up alerts** for failed payments or unusual activity

Your application is now configured for live Paystack payments! 🎉💳











