// functions/src/routes/index.ts
import { Router } from "express";
import { authRouter } from "./auth";
import { waitlistRouter } from "./waitlist";
import { projectsRouter } from "./projects";
import { connectRouter } from "./connect";
import { waitlistProjectsRouter } from "./waitlistProjects";

const router = Router();

router.use("/auth", authRouter);
router.use("/waitlist", waitlistRouter);
router.use("/projects", projectsRouter);
router.use("/connect", connectRouter);

// Add the waitlistProjects router
router.use("/waitlist/projects", waitlistProjectsRouter);

export default router;
