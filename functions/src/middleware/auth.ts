import { Request, Response, NextFunction } from "express";
import { auth } from "../config/firebase";
import { hasPermission } from "../models/permissions";
// import "../types/express.d.ts";

/**
 * Express middleware to validate Firebase auth tokens
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export async function validateAuthToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or invalid token format" });
    return;
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({
      error: "Unauthorized: Invalid token",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Express middleware to check if a user has a specific permission
 * @param permission - the permission to check
 */
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: "Authentication required",
        });
        return;
      }

      const hasAccess = await hasPermission(req.user.uid, permission);

      if (!hasAccess) {
        res.status(403).json({
          error: "Forbidden",
          details: "You don't have permission to perform this action",
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: "Permission check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}

/**
 * Express middleware for request logging
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log("Request headers:", req.headers);
  console.log("Request body:", req.body);
  next();
}
