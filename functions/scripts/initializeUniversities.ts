/**
 * Script to initialize university documents in Firestore
 * 
 * This script creates documents in the universities collection
 * for all the predefined universities in our UNIVERSITY_MAP.
 * 
 * Run with: npx ts-node scripts/initializeUniversities.ts
 */
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";

import * as admin from "firebase-admin";
import { initializeUniversities } from "../src/utils/universityUtils";

// Initialize Firebase Admin SDK with your service account
// If running in Cloud Functions environment or with ADC, this is not needed
try {
  admin.initializeApp({
    // If using the emulator, uncomment these lines
    // projectId: "fruition-dev",
    // credential: admin.credential.applicationDefault()
  });
} catch (error) {
  console.log("Firebase Admin SDK already initialized");
}

async function run() {
  try {
    console.log("Initializing university documents in Firestore...");
    await initializeUniversities();
    console.log("Universities successfully initialized!");
  } catch (error) {
    console.error("Error initializing universities:", error);
  } finally {
    // Optional: exit after script completes
    process.exit(0);
  }
}

// Run the script
run();