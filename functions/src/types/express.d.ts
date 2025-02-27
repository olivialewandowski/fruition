// src/types/express.d.ts
import { UserRecord } from "firebase-admin/auth";

declare global {
  namespace Express {
    interface Request {
      user?: UserRecord;
    }
  }
}
