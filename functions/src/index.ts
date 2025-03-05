import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import router from "./routes";
import { requestLogger } from "./middleware/auth";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export Firestore triggers directly with named exports
// This ensures they are properly registered as individual functions
import { onUserCreate, onProjectCreate, onApplicationUpdate } from "./triggers/firestoreTriggers";
export { onUserCreate, onProjectCreate, onApplicationUpdate };

// Example HTTP function with Gen 2 configuration
export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.json({ message: "Hello from Fruition Research Matching Platform!" });
});

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(requestLogger);
app.use(router);

app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

export const api = onRequest(app);
