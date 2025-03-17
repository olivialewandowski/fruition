/**
 * Test utility to verify Firebase configuration for password reset
 * 
 * Run with: node testAuthConfig.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 Testing Firebase Authentication Configuration\n');

// Check if Firebase config is available
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease check your .env.local file and ensure all Firebase config variables are set.');
  process.exit(1);
}

console.log('✅ Firebase environment variables are present');

// Display Firebase configuration (without displaying sensitive values)
console.log('\nFirebase Configuration:');
console.log(`  API Key: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 3)}...${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(process.env.NEXT_PUBLIC_FIREBASE_API_KEY.length - 3)}`);
console.log(`  Auth Domain: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`);
console.log(`  Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);

// Check emulator configuration
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  console.log('\n⚠️ Firebase Emulators are enabled. Password reset emails will NOT be sent.');
  console.log('   Instead, reset links will be logged to the Firebase Auth Emulator console.');
  console.log('   To test with real emails, set NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false');
} else {
  console.log('\n✅ Firebase Emulators are not enabled. Password reset emails will be sent to real email addresses.');
}

console.log('\n📋 Testing Instructions:');
console.log('1. Make sure the user exists in Firebase Authentication');
console.log('2. Use the "Forgot Password" link in the application');
console.log('3. Check for errors in browser console');
console.log('4. If using emulators, check the emulator logs for the reset link');
console.log('5. If not using emulators, check your email inbox (including spam folder)');

console.log('\n✨ Test complete\n'); 