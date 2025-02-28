import { Timestamp } from "firebase-admin/firestore";

export interface Feature {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  path: string;
  accessRoles: string[];
  isActive: boolean;
}

export interface FeatureWithId extends Feature {
  id: string;
}

export interface Permission {
  name: string;
  description: string;
  featureId: string;
  allowedRoles: string[];
  createdAt: Timestamp;
}

export interface PermissionWithId extends Permission {
  id: string;
}
