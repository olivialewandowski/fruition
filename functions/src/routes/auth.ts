import { Router } from "express";
import { authenticateUser } from "../services/authService";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    try {
      const authResult = await authenticateUser(email, password);

      return res.status(200).json({
        message: "Login successful",
        token: authResult.token,
        user: authResult.user,
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
