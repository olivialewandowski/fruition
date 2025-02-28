import { Router } from "express";
import { authRouter } from "./auth";
import { waitlistRouter } from "./waitlist";
import { projectsRouter } from "./projects";
import { connectRouter } from "./connect";

const router = Router();

router.use("/auth", authRouter);
router.use("/waitlist", waitlistRouter);
router.use("/projects", projectsRouter);
router.use("/connect", connectRouter);

export default router;
