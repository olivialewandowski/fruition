# Testing Forgot Password Functionality in Development

This guide provides multiple ways to verify that the forgot password functionality works correctly in development mode without needing to send actual emails.

## Method 1: Check Firebase Emulator Logs

If you're using Firebase emulators:

1. Look for the password reset link in your terminal where the Firebase emulator is running
2. The emulator logs will display something like:
   ```
   Firebase Auth Emulator: Password reset email sent for user [email]: <link>
   ```
3. You can copy and paste this link to test the password reset flow

## Method 2: Test via Firebase Console

You can use the Firebase Console to verify the functionality works:

1. Open [Firebase Console](https://console.firebase.google.com/) and navigate to your project
2. Go to Authentication → Users
3. Find the user you want to test with
4. Click the three dots menu (...) next to the user
5. Select "Send password reset email"
6. This confirms Firebase is properly set up for password resets

## Method 3: Create a Test Account and Check Email

For a full end-to-end test:

1. Create a test account with a real email you can access
2. Ensure you're using production Firebase (not emulators)
3. Request a password reset for this account
4. Check your email, including spam/junk folders
5. Follow the reset link to verify it works

## Method 4: Use Debug Mode in Code

Our current implementation includes development-specific information:

1. Try resetting a password through the UI
2. The modal will show additional developer information
3. Check browser console logs for detailed information

## Troubleshooting

If you're having issues:

- Verify the Firebase project has Email/Password authentication enabled
- Ensure the user exists in Firebase Authentication
- Check for any error messages in browser console or server logs
- Confirm your Firebase configuration is correct
- If using emulators, make sure they're running properly 