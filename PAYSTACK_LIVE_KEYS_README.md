# 🔑 Paystack Live Keys Configuration Guide

## ✅ Configure Your Live Paystack Keys

**Public Key:** `pk_live_YOUR_PUBLIC_KEY_HERE`
**Secret Key:** `sk_live_YOUR_SECRET_KEY_HERE`

⚠️ **NEVER commit actual API keys to version control!**

## 🚀 Quick Setup Instructions

### 1. Run the Setup Script (Windows)
```batch
setup-production.bat
```

### 2. Or Manually Create server/.env
Create a file `server/.env` with this content:

```env
# Paystack Live Keys (PRODUCTION - REAL PAYMENTS)
PAYSTACK_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
PAYSTACK_PUBLIC_KEY=pk_live_YOUR_PUBLIC_KEY_HERE

NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random-32-chars-minimum
FRONTEND_URL=http://localhost:5173

# Add your other credentials here...
```

### 3. Test the Integration
```bash
node test-paystack.js
```

## ⚠️ Critical Security Notes

### 🔴 DANGER ZONE
- **These are LIVE keys** that will process **REAL PAYMENTS**
- **Never commit** `server/.env` to version control
- **Keep keys secure** and rotate them regularly
- **Monitor** your Paystack dashboard constantly

### 🛡️ Security Best Practices
- Use environment-specific keys (test for dev, live for prod)
- Implement proper access controls
- Log all payment activities
- Set up alerts for suspicious activities
- Regularly audit your Paystack account

## 🧪 Testing Strategy

### Phase 1: Safe Testing
1. Use test keys in development
2. Test with small amounts (₦100-500)
3. Verify all payment flows work
4. Test error scenarios

### Phase 2: Live Testing
1. Switch to live keys
2. Test with very small amounts first
3. Monitor Paystack dashboard
4. Have rollback plan ready

### Phase 3: Production
1. Start with limited user access
2. Monitor closely for 24-48 hours
3. Gradually increase traffic
4. Set up comprehensive monitoring

## 📊 Payment Methods Supported

Your Paystack integration supports:
- 💳 **Credit/Debit Cards** (Visa, Mastercard, Verve)
- 🏦 **Bank Transfers**
- 📱 **Mobile Money** (MTN, Airtel, Glo)
- 📠 **USSD** payments
- 🏪 **Bank Branches** and agents
- 🌐 **Internet Banking**

## 📞 Support & Monitoring

### Paystack Resources
- **Dashboard:** https://dashboard.paystack.com
- **Documentation:** https://paystack.com/docs
- **Support:** developers@paystack.com

### Application Monitoring
- Check server logs: `tail -f server/logs/app.log`
- Monitor API health: `GET /health`
- Track payments: Paystack dashboard
- Error monitoring: Check application logs

## 🎯 Go-Live Checklist

- [ ] Run setup script or create server/.env
- [ ] Update Firebase credentials
- [ ] Configure Amadeus API keys
- [ ] Set strong JWT secret
- [ ] Test payment flow with test keys
- [ ] Switch to live keys
- [ ] Test with small real payments
- [ ] Set up monitoring and alerts
- [ ] Monitor for 24-48 hours
- [ ] Scale up gradually

## 🚨 Emergency Contacts

If you encounter issues:
1. **Check Paystack Status:** https://status.paystack.com
2. **Review Logs:** Check server/logs/app.log
3. **Contact Paystack:** developers@paystack.com
4. **Rollback Plan:** Switch back to test keys if needed

## 🎉 You're Ready!

Your flight booking application is now configured to process real payments with Paystack. Start with small amounts and monitor closely. Welcome to the world of live payments! 💰✨

---

*Generated for Paystack Live Key Configuration*
*Add your keys securely through environment variables*











