import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { waitlistRouter } from "./routes/waitlist";

const app = express();

// Configure CORS with specific origins
const allowedOrigins = [
  "https://fruitionresearch.com",
  "https://www.fruitionresearch.com",
  "http://localhost:3000", // for local development
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
  credentials: true,
}));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log("Request headers:", req.headers);
  console.log("Request body:", req.body);
  next();
});

// Mount routers
app.use("/auth", authRouter);
app.use("/waitlist", waitlistRouter);

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

export const api = functions.https.onRequest(app);
