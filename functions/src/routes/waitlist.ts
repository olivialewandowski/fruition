import { Router } from "express";
import { WaitlistEntry } from "../types";
import { addToWaitlist, checkExistingEmail } from "../models/waitlist";

export const waitlistRouter = Router();

waitlistRouter.post("/join", async (req, res) => {
  try {
    const { email, firstName, lastName, role, institution, source } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const emailExists = await checkExistingEmail(email);
    if (emailExists) {
      return res.status(400).json({ error: "Email already on waitlist" });
    }

    const waitlistEntry: Omit<WaitlistEntry, "createdAt"> = {
      email,
      firstName,
      lastName,
      role,
      institution,
      source,
    };

    const docId = await addToWaitlist(waitlistEntry);

    const responseData: WaitlistEntry & { id: string } = {
      id: docId,
      ...waitlistEntry,
      createdAt: new Date().toISOString(),
    };

    return res.status(201).json({
      message: "Successfully joined waitlist",
      data: responseData,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to join waitlist",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
