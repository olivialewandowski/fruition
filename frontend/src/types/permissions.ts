// src/types/permissions.ts
export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

// define all available permissions
export const PERMISSIONS = {
  VIEW_PROJECTS: 'view_projects',
  CREATE_PROJECT: 'create_project',
  EDIT_PROJECT: 'edit_project',
  DELETE_PROJECT: 'delete_project',
  APPLY_TO_PROJECT: 'apply_to_project',
  MANAGE_APPLICATIONS: 'manage_applications',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  VIEW_GRANTS: 'view_grants',
  MANAGE_GRANTS: 'manage_grants',
  VIEW_PUBLICATIONS: 'view_publications',
  MANAGE_PUBLICATIONS: 'manage_publications',
  ACCESS_FORUMS: 'access_forums',
  MODERATE_FORUMS: 'moderate_forums',
  CONNECT_FEATURE: 'connect_feature'
} as const;

export type PermissionId = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// mapping user roles to their default permissions - UPDATED to allow students to create projects
export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionId[]> = {
  student: [
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.CREATE_PROJECT, // Added permission for students to create projects
    PERMISSIONS.EDIT_PROJECT,   // Allow students to edit their own projects
    PERMISSIONS.APPLY_TO_PROJECT,
    PERMISSIONS.VIEW_GRANTS,
    PERMISSIONS.VIEW_PUBLICATIONS,
    PERMISSIONS.ACCESS_FORUMS,
    PERMISSIONS.CONNECT_FEATURE
  ],
  faculty: [
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_PROJECT,
    PERMISSIONS.DELETE_PROJECT,
    PERMISSIONS.MANAGE_APPLICATIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_GRANTS,
    PERMISSIONS.VIEW_PUBLICATIONS,
    PERMISSIONS.ACCESS_FORUMS,
    PERMISSIONS.CONNECT_FEATURE
  ],
  admin: [
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_PROJECT, 
    PERMISSIONS.DELETE_PROJECT,
    PERMISSIONS.MANAGE_APPLICATIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.VIEW_GRANTS,
    PERMISSIONS.MANAGE_GRANTS,
    PERMISSIONS.VIEW_PUBLICATIONS,
    PERMISSIONS.MANAGE_PUBLICATIONS,
    PERMISSIONS.ACCESS_FORUMS,
    PERMISSIONS.MODERATE_FORUMS,
    PERMISSIONS.CONNECT_FEATURE
  ]
};

// feature configuration to map features to required permissions
export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  requiredPermission: PermissionId;
}

export const FEATURES: Feature[] = [
  {
    id: 'inbox',
    name: 'Inbox',
    description: 'Manage your messages and notifications',
    icon: 'inbox-icon',
    path: '/inbox',
    requiredPermission: PERMISSIONS.VIEW_PROJECTS
  },
  {
    id: 'projects',
    name: 'Projects',
    description: 'View and manage research projects',
    icon: 'projects-icon',
    path: '/projects',
    requiredPermission: PERMISSIONS.VIEW_PROJECTS
  },
  {
    id: 'forums',
    name: 'Forums',
    description: 'Participate in research discussions',
    icon: 'forums-icon',
    path: '/forums',
    requiredPermission: PERMISSIONS.ACCESS_FORUMS
  },
  {
    id: 'grants',
    name: 'Grants',
    description: 'Browse and apply for research grants',
    icon: 'grants-icon',
    path: '/grants',
    requiredPermission: PERMISSIONS.VIEW_GRANTS
  },
  {
    id: 'publications',
    name: 'Publications',
    description: 'Access research publications',
    icon: 'publications-icon',
    path: '/publications',
    requiredPermission: PERMISSIONS.VIEW_PUBLICATIONS
  },
  {
    id: 'connect',
    name: 'Connect',
    description: 'Connect with researchers and mentors',
    icon: 'connect-icon',
    path: '/connect',
    requiredPermission: PERMISSIONS.CONNECT_FEATURE
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'View research engagement analytics',
    icon: 'analytics-icon',
    path: '/analytics',
    requiredPermission: PERMISSIONS.VIEW_ANALYTICS
  },
  {
    id: 'users',
    name: 'User Management',
    description: 'Manage platform users',
    icon: 'users-icon',
    path: '/users',
    requiredPermission: PERMISSIONS.MANAGE_USERS
  }
];