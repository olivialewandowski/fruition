import { Router } from "express";
import { authRouter } from "./auth";
import { waitlistRouter } from "./waitlist";

const router = Router();

router.use("/auth", authRouter);
router.use("/waitlist", waitlistRouter);

export default router;
