import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import router from "./routes";
import { requestLogger } from "./middleware/auth";

const app = express();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export Firestore triggers
export * from "./triggers/firestoreTriggers";

// Example HTTP function with Gen 2 configuration
export const helloWorld = functions
  .region("us-central1")
  .https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.json({ message: "Hello from Fruition Research Matching Platform!" });
  });

// Use a simpler CORS configuration for development
app.use(cors({ origin: true }));

app.use(express.json());

// request logging middleware
app.use(requestLogger);

// mounting all routes
app.use(router);

// error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

export const api = functions
  .region("us-central1")
  .https.onRequest(app);
