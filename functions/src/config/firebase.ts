// src/config/firebase.ts
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  if (process.env.FUNCTIONS_EMULATOR) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
    process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
  }
  try {
    admin.initializeApp();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("Error initializing Firebase Admin:", error);
    }
  }
}

const auth = admin.auth();
const db = admin.firestore();

export { auth, db };
