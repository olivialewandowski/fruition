// src/config/firebase.ts
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export Firestore database instance
export const db = admin.firestore();

// Configure Firestore settings
db.settings({ ignoreUndefinedProperties: true });

// Export other Firebase services as needed
export const auth = admin.auth();
export const storage = admin.storage();
