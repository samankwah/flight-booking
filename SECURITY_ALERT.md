# 🚨 CRITICAL SECURITY ALERT

## Date: December 23, 2025

## IMMEDIATE ACTION REQUIRED

Your repository contains **EXPOSED CREDENTIALS** that have been committed to version control. This is a **CRITICAL SECURITY VULNERABILITY** that must be addressed immediately.

---

## ⚠️ Exposed Credentials Found

### 1. Firebase API Keys
**Files:** `.env`, `src/firebase.ts`
```
VITE_FIREBASE_API_KEY=AIzaSyDCMSIB3IE2I54kLdTGtyXB1r2w5cSN5AE
```
**Impact:** Unauthorized access to your Firebase project, potential data breaches

### 2. Amadeus API Credentials
**File:** `server/.env`
```
AMADEUS_API_KEY=<exposed>
AMADEUS_API_SECRET=<exposed>
```
**Impact:** Unauthorized API usage, quota consumption, potential charges

### 3. Paystack LIVE Keys (MOST CRITICAL!)
**File:** `server/.env`
```
PAYSTACK_SECRET_KEY=<exposed_key_removed>
PAYSTACK_PUBLIC_KEY=<exposed_key_removed>
```
**Impact:**
- Real money transactions can be processed
- Financial fraud risk
- PCI compliance violation
- Potential chargebacks and legal issues

### 4. JWT Secret
**File:** `server/.env`
```
JWT_SECRET=d847bcd96d07bbc35ce0c6579c855421ac80feffcc6b7d0da070c9b8097c54701bdfd32c25e9973f8785d303babc30895dfbee61fb64446b70a5be17d0420b60
```
**Impact:** Session hijacking, unauthorized access to user accounts

### 5. VAPID Keys
**Files:** `.env`, `server/.env`
```
VAPID_PRIVATE_KEY=5fp8xaEHvAlInx02J8lgOdGGDj_PEOAxI46DZJHkIqc
```
**Impact:** Unauthorized push notifications to your users

---

## 🔥 IMMEDIATE STEPS (Complete within 24 hours)

### Step 1: Rotate ALL Credentials (RIGHT NOW)

#### 1.1 Firebase
1. Go to https://console.firebase.google.com
2. Select your project
3. Go to Project Settings → Service Accounts
4. Generate new API keys
5. Update Firestore security rules if needed

#### 1.2 Amadeus
1. Go to https://developers.amadeus.com/my-apps
2. Revoke current API key
3. Create new API credentials
4. Update rate limits if compromised

#### 1.3 Paystack (URGENT!)
1. **Immediately revoke** any exposed live secret keys
2. Log into https://dashboard.paystack.com
3. Go to Settings → API Keys & Webhooks
4. Revoke all live keys
5. Generate NEW live keys (for production only)
6. Use TEST keys for development:
   - Test Secret: sk_test_... (get from dashboard)
   - Test Public: pk_test_... (get from dashboard)

#### 1.4 JWT Secret
Generate a new 64-character random string:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 1.5 VAPID Keys
Generate new VAPID keys:
```bash
npx web-push generate-vapid-keys
```

### Step 2: Remove .env Files from Git History

```bash
# WARNING: This rewrites git history!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env server/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (if you're okay with rewriting history)
git push origin --force --all
```

**Alternative (Safer):** If you can't rewrite history:
1. Create a new repository
2. Copy clean code (without .env files)
3. Update remote URL
4. Start fresh

### Step 3: Verify .gitignore

Ensure `.gitignore` contains:
```
# Environment variables
.env
.env.local
.env.development
.env.production
server/.env
server/.env.local
server/.env.development
server/.env.production
```

### Step 4: Update Environment Variable Templates

Update `env.example` and `server/.env.example` with:
```
# INSTRUCTIONS: Copy this file to .env and replace with your actual credentials
# NEVER commit .env files to version control!

# Firebase (Get from Firebase Console)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# ... etc

# Payment (Use TEST keys for development!)
PAYSTACK_SECRET_KEY=sk_test_your_test_key_here  # TEST KEY ONLY!
PAYSTACK_PUBLIC_KEY=pk_test_your_test_key_here  # TEST KEY ONLY!

# For production, use:
# PAYSTACK_SECRET_KEY=sk_live_...  # LIVE KEY - only in production
```

---

## 🛡️ Prevention for Future

### 1. Use Environment Variable Management Services
- **Vercel**: Built-in environment variables (secure)
- **Netlify**: Environment variables in dashboard
- **Railway**: Encrypted environment variables
- **AWS Secrets Manager**: For AWS deployments
- **Doppler**: Dedicated secrets management

### 2. Pre-commit Hooks
Install git-secrets to prevent committing secrets:
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run check-secrets"
```

Add to `package.json`:
```json
"scripts": {
  "check-secrets": "git diff --cached --name-only | xargs grep -l 'sk_live\\|AIza' && exit 1 || exit 0"
}
```

### 3. Use .env.example as Template
Always commit `.env.example` with placeholder values:
```
API_KEY=your_api_key_here
SECRET=your_secret_here
```

Never commit actual `.env` files.

### 4. Regular Secret Rotation
- Rotate all credentials every 90 days
- Immediately rotate if:
  - An employee leaves
  - You suspect a breach
  - Credentials are accidentally exposed

---

## 📝 Checklist

Complete this checklist to ensure you've addressed all issues:

- [ ] Rotated Firebase API keys
- [ ] Revoked and regenerated Amadeus API credentials
- [ ] **REVOKED PAYSTACK LIVE KEYS** (most critical!)
- [ ] Generated new Paystack TEST keys for development
- [ ] Created new JWT secret
- [ ] Generated new VAPID keys
- [ ] Updated all `.env` files with new credentials
- [ ] Removed `.env` files from git history OR created new repo
- [ ] Verified `.gitignore` is blocking .env files
- [ ] Updated `.env.example` templates
- [ ] Set up environment variables in deployment platform
- [ ] Tested application with new credentials
- [ ] Documented credential rotation in team wiki
- [ ] Set calendar reminder for next rotation (90 days)

---

## 🔍 How to Verify Security

### 1. Check Git History
```bash
git log --all --full-history -- .env
git log --all --full-history -- server/.env
```
If these show commits, history needs to be cleaned.

### 2. Check Current Repo
```bash
git ls-files | grep -E '\.env$'
```
Should return nothing.

### 3. Test API Keys
Try using old Paystack key - it should be rejected.

### 4. Monitor for Unauthorized Usage
- Check Paystack dashboard for unexpected transactions
- Monitor Firebase usage quotas
- Review Amadeus API call logs

---

## 🚨 If Unauthorized Usage Detected

### Paystack Fraudulent Transactions
1. Immediately contact Paystack support: support@paystack.com
2. File a dispute for any unauthorized charges
3. Request transaction reversal if applicable
4. Document all fraudulent activity
5. Consider legal action if significant

### Firebase Quota Abuse
1. Set up budget alerts in Google Cloud Console
2. Review all Firebase project access
3. Enable Firebase App Check
4. Report abuse to Firebase support

### Amadeus API Abuse
1. Contact Amadeus support immediately
2. Request quota reset
3. Review API call logs for suspicious activity
4. File a report if significant overage charges

---

## 📞 Emergency Contacts

- **Paystack Support**: support@paystack.com | +234 (1) 888-3333
- **Firebase Support**: https://firebase.google.com/support/contact
- **Amadeus Support**: https://developers.amadeus.com/support

---

## 📚 Additional Resources

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub: Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Paystack Security Best Practices](https://paystack.com/docs/security/)
- [Firebase Security Checklist](https://firebase.google.com/support/guides/security-checklist)

---

## ⚖️ Legal Implications

Exposed credentials can lead to:
- **PCI-DSS violations** (if handling payments)
- **GDPR violations** (if user data is compromised)
- **Financial liability** for fraudulent transactions
- **Breach notification requirements** (depending on jurisdiction)
- **Loss of customer trust** and reputational damage

---

## ✅ After Securing

Once all credentials are rotated and secured:

1. Delete this SECURITY_ALERT.md file
2. Update your team on the incident
3. Review and improve your security practices
4. Consider a security audit
5. Implement automated secret scanning (GitHub Advanced Security, GitGuardian, etc.)

---

**Status:** 🔴 CRITICAL - Immediate action required
**Priority:** P0 - Drop everything and fix
**Deadline:** Within 24 hours
**Responsible:** Development Team Lead / DevOps

---

*This alert was generated on December 23, 2025 following a comprehensive security audit of the codebase.*
