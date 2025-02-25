// src/config/firebase.ts
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

export const auth = admin.auth();
export const db = admin.firestore();
