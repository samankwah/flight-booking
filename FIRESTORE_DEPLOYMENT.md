# Deploying Firestore Security Rules

This guide explains how to deploy the Firestore security rules to protect your database.

## Prerequisites

1. **Firebase CLI installed**
   ```bash
   npm install -g firebase-tools
   ```

2. **Authenticated with Firebase**
   ```bash
   firebase login
   ```

3. **Firebase project initialized**
   ```bash
   firebase init
   # Select Firestore when prompted
   # Choose your project
   # Use firestore.rules as the rules file
   ```

## Deploying the Rules

### Option 1: Deploy Only Firestore Rules

```bash
firebase deploy --only firestore:rules
```

This command will:
- Read the `firestore.rules` file
- Validate the rules syntax
- Deploy the rules to your Firebase project
- Show you the deployment result

### Option 2: Deploy All Firebase Resources

```bash
firebase deploy
```

This deploys all Firebase resources (Firestore rules, Cloud Functions, Hosting, etc.)

## Verifying the Deployment

1. **Check Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your project
   - Navigate to Firestore Database → Rules
   - Verify the rules match your `firestore.rules` file

2. **Test the Rules**
   ```bash
   # Install the Firestore emulator for testing
   firebase init emulators
   firebase emulators:start
   ```

3. **View Active Rules**
   ```bash
   firebase firestore:rules:list
   ```

## Security Rules Overview

The deployed rules enforce:

### Bookings Collection
- ✅ Users can only read their own bookings
- ✅ Users can create bookings for themselves
- ✅ Users can update their own bookings (limited fields)
- ✅ Users can delete unconfirmed bookings only
- ❌ Users cannot access other users' bookings

### Users Collection
- ✅ Users can read/write their own profile
- ❌ Users cannot access other users' profiles

### Transactions Collection
- ✅ Users can read their own transactions
- ✅ Users can create transactions for themselves
- ❌ Transactions are immutable (no updates/deletes)

## Testing Security Rules

### Using Firebase Console
1. Go to Firestore Database → Rules
2. Click "Rules Playground" tab
3. Test different scenarios:
   - Authenticated user reading own booking
   - Authenticated user reading another user's booking
   - Unauthenticated user trying to read any booking

### Using Firestore Emulator
```bash
# Start emulator
firebase emulators:start --only firestore

# Connect your app to emulator
# In your frontend code:
const db = getFirestore();
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## Common Issues

### Issue: "Permission denied" errors in production

**Cause**: Rules are too restrictive or authentication is not working

**Solution**:
1. Check that users are authenticated: `request.auth != null`
2. Verify the `userId` field matches `request.auth.uid`
3. Check Firebase Auth is properly configured

### Issue: "Resource not found" error

**Cause**: Trying to update a document that doesn't exist

**Solution**:
- Use `allow create` for new documents
- Use `allow update` for existing documents
- Check `resource.data` exists before accessing fields

### Issue: Rules not updating in production

**Cause**: Firebase caches rules for performance

**Solution**:
1. Force redeploy: `firebase deploy --only firestore:rules --force`
2. Wait 1-2 minutes for propagation
3. Clear browser cache if testing from frontend

## Environment-Specific Rules

### Development
For development, you might want more lenient rules:

```javascript
// WARNING: Only use in development!
match /{document=**} {
  allow read, write: if true; // Open access
}
```

### Production
Always use strict rules in production (see `firestore.rules`)

## Monitoring Access

### Enable Firestore Audit Logs
1. Go to Firebase Console
2. Navigate to Project Settings
3. Enable "Cloud Firestore Usage Logs"
4. View logs in Cloud Logging

### Check for Denied Requests
```bash
# View recent denied requests in Cloud Logging
gcloud logging read "resource.type=firestore_instance AND severity>=ERROR" --limit 50
```

## Best Practices

1. **Always test rules before deploying to production**
   ```bash
   firebase emulators:start --only firestore
   ```

2. **Use the Rules Playground** to validate rule changes

3. **Never use open rules in production**
   ```javascript
   // ❌ NEVER DO THIS IN PRODUCTION
   allow read, write: if true;
   ```

4. **Keep rules in version control** (already done - `firestore.rules`)

5. **Document complex rules** with comments

6. **Monitor denied requests** to catch unauthorized access attempts

7. **Use field-level validation** to enforce data structure
   ```javascript
   allow create: if request.resource.data.keys().hasAll(['required', 'fields']);
   ```

## Rollback Rules

If you need to rollback to a previous version:

```bash
# View rule history
firebase firestore:rules:list

# Download a previous version
firebase firestore:rules:get --version VERSION_ID > rollback.rules

# Deploy the old rules
firebase deploy --only firestore:rules
```

## Next Steps

1. Deploy the rules to your Firebase project
2. Test with authenticated and unauthenticated requests
3. Monitor access logs for denied requests
4. Update rules as your application grows

## Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Reference](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Testing Rules](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
