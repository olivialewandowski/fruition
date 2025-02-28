// functions/src/types/permission.ts
import { Timestamp } from "firebase-admin/firestore";

// basic permission interface
export interface Permission {
  id: string;
  name: string;
  description: string;
  area: 'projects' | 'connect';
  createdAt: Timestamp;
}

export interface PermissionWithId extends Permission {
  id: string;
}

// project-related permissions
export const PROJECT_PERMISSIONS = {
  CREATE_PROJECT: 'create_project',
  EDIT_PROJECT: 'edit_project',
  DELETE_PROJECT: 'delete_project',
  VIEW_APPLICATIONS: 'view_applications',
  MANAGE_APPLICATIONS: 'manage_applications'
};

// connect-related permissions
export const CONNECT_PERMISSIONS = {
  SWIPE_PROJECTS: 'swipe_projects',
  SAVE_PROJECTS: 'save_projects',
  APPLY_TO_PROJECTS: 'apply_to_projects'
};

// combine all permissions for easy access
export const PERMISSIONS = {
  ...PROJECT_PERMISSIONS,
  ...CONNECT_PERMISSIONS
};

export type PermissionId = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// role definitions
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: PermissionId[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RoleWithId extends Role {
  id: string;
}

// default role permissions mapping
export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionId[]> = {
  student: [
    PERMISSIONS.SWIPE_PROJECTS,
    PERMISSIONS.SAVE_PROJECTS,
    PERMISSIONS.APPLY_TO_PROJECTS
  ],
  faculty: [
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_PROJECT,
    PERMISSIONS.DELETE_PROJECT,
    PERMISSIONS.VIEW_APPLICATIONS,
    PERMISSIONS.MANAGE_APPLICATIONS
  ],
  admin: [
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_PROJECT, 
    PERMISSIONS.DELETE_PROJECT,
    PERMISSIONS.VIEW_APPLICATIONS,
    PERMISSIONS.MANAGE_APPLICATIONS,
    PERMISSIONS.SWIPE_PROJECTS,
    PERMISSIONS.SAVE_PROJECTS,
    PERMISSIONS.APPLY_TO_PROJECTS
  ]
};

// feature definitions
export interface Feature {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  path: string;
  requiredPermissions: PermissionId[];
  isActive: boolean;
}

// available features with their required permissions
export const FEATURES: Feature[] = [
  {
    id: 'projects',
    name: 'projects',
    displayName: 'Projects',
    description: 'View and manage research projects',
    icon: 'projects-icon',
    path: '/projects',
    requiredPermissions: [PERMISSIONS.CREATE_PROJECT],
    isActive: true
  },
  {
    id: 'connect',
    name: 'connect',
    displayName: 'Connect',
    description: 'Connect with researchers and mentors',
    icon: 'connect-icon',
    path: '/connect',
    requiredPermissions: [PERMISSIONS.SWIPE_PROJECTS],
    isActive: true
  }
];