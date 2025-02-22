// src/routes/waitlist.ts
import { Router as router } from "express";
import { db } from "../config/firebase";

export const waitlistRouter = router();

interface WaitlistEntry {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  institution: string;
  source?: string;
  createdAt: string;
}

async function addToWaitlist(entry: WaitlistEntry) {
  const docRef = await db.collection("waitlist").add(entry);
  return docRef.id;
}

async function checkExistingEmail(email: string): Promise<boolean> {
  const existingEntries = await db.collection("waitlist")
    .where("email", "==", email)
    .get();
  return !existingEntries.empty;
}

waitlistRouter.post("/join", async (req, res) => {
  try {
    const { email, firstName, lastName, role, institution, source } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if email already exists in waitlist
    const emailExists = await checkExistingEmail(email);
    if (emailExists) {
      return res.status(400).json({ error: "Email already on waitlist" });
    }

    // Create waitlist entry
    const waitlistEntry: WaitlistEntry = {
      email,
      firstName,
      lastName,
      role,
      institution,
      source,
      createdAt: new Date().toISOString(),
    };

    const docId = await addToWaitlist(waitlistEntry);

    return res.status(201).json({
      message: "Successfully joined waitlist",
      data: {
        id: docId,
        ...waitlistEntry,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to join waitlist",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
