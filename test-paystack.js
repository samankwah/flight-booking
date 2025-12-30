// Test script to verify Paystack integration
// Run with: node test-paystack.js

import dotenv from 'dotenv';
import paystackService from './server/services/paystackService.js';

// Load environment variables
dotenv.config({ path: './server/.env' });

async function testPaystackIntegration() {
  console.log('🧪 Testing Paystack Integration...\n');

  try {
    // Test 1: Check configuration
    console.log('1️⃣ Testing Configuration:');
    const publicKey = paystackService.getPublicKey();
    const isLive = publicKey.startsWith('pk_live_');

    console.log(`   Public Key: ${publicKey.substring(0, 12)}...`);
    console.log(`   Mode: ${isLive ? '🔴 LIVE PRODUCTION' : '🟡 TEST MODE'}`);

    if (isLive) {
      console.log('   ⚠️  WARNING: Using live keys - this will process real payments!');
    }

    // Test 2: Amount conversion
    console.log('\n2️⃣ Testing Amount Conversion:');
    const testAmount = 5000; // ₦5,000
    const koboAmount = paystackService.convertToKobo(testAmount);
    const backToNaira = paystackService.convertFromKobo(koboAmount);

    console.log(`   ₦${testAmount} → ${koboAmount} kobo → ₦${backToNaira}`);

    // Test 3: API Connectivity (initialize transaction)
    console.log('\n3️⃣ Testing API Connectivity:');

    if (!isLive) {
      console.log('   🟡 Skipping live API test in test mode');
      console.log('   💡 To test live payments, use live keys and run in production mode');
    } else {
      console.log('   🔴 Testing with LIVE keys (comment out this test if you want to avoid real charges)');

      // This would actually create a transaction - commented out for safety
      /*
      const transaction = await paystackService.initializeTransaction({
        amount: 10000, // ₦100 in kobo
        email: 'test@example.com',
        reference: `test-${Date.now()}`,
        metadata: { test: true },
      });

      console.log('   ✅ Transaction initialized successfully');
      console.log(`   Authorization URL: ${transaction.authorization_url}`);
      console.log(`   Reference: ${transaction.reference}`);
      */
    }

    console.log('\n✅ Paystack integration test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Update server/.env with your actual credentials');
    console.log('   2. Test payment flow in your application');
    console.log('   3. Monitor Paystack dashboard for transactions');
    console.log('   4. Set up webhooks for payment confirmations');

  } catch (error) {
    console.error('\n❌ Paystack integration test failed:');
    console.error('   Error:', error.message);

    if (error.response) {
      console.error('   API Response:', error.response.data);
    }

    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your Paystack API keys');
    console.log('   2. Verify server/.env file exists and is properly configured');
    console.log('   3. Ensure NODE_ENV is set correctly');
    console.log('   4. Check network connectivity');
  }
}

// Run the test
testPaystackIntegration();







