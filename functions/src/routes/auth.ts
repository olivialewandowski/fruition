// src/routes/auth.ts
import { Router as router } from "express";
import { auth, db } from "../config/firebase";
import { UserRecord } from "firebase-admin/lib/auth/user-record";

export const authRouter = router();

authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, institution, role } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !institution || !role) {
      return res.status(400).json({
        error: "All fields are required",
        received: { firstName, lastName, email, institution, role },
      });
    }

    // Create user in Firebase Auth
    const userCredential = await auth.createUser({
      email,
      password,
    });

    // Create user profile in Firestore
    await db.collection("users").doc(userCredential.uid).set({
      firstName,
      lastName,
      email,
      institution,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return res.status(201).json({
      message: "User created successfully",
      userId: userCredential.uid,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to create user",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    try {
      const userRecord: UserRecord = await auth.getUserByEmail(email);

      const userProfile = await db.collection("users").doc(userRecord.uid).get();

      if (!userProfile.exists) {
        return res.status(404).json({ error: "User profile not found" });
      }

      const userData = userProfile.data();
      const customToken = await auth.createCustomToken(userRecord.uid);

      return res.status(200).json({
        message: "Login successful",
        token: customToken,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          ...userData,
        },
      });
    } catch {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }
  } catch {
    return res.status(500).json({
      error: "Failed to log in",
      details: "An unexpected error occurred",
    });
  }
});
