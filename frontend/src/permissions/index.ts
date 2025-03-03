// src/permissions/index.ts

// define the base permission type
export interface Permission {
    id: string;
    name: string;
    description: string;
  }
  
  // project permissions
  export const PROJECT_PERMISSIONS = {
    CREATE_PROJECT: 'create_project',
    EDIT_PROJECT: 'edit_project',
    DELETE_PROJECT: 'delete_project',
    VIEW_APPLICATIONS: 'view_applications',
    MANAGE_APPLICATIONS: 'manage_applications'
  };
  
  // connect permissions
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
  
  // define permission ID type
  export type PermissionId = typeof PERMISSIONS[keyof typeof PERMISSIONS];
  
  // default role-to-permissions mapping
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
      id: 'dashboard',
      name: 'dashboard',
      displayName: 'Dashboard',
      description: 'View and manage research projects',
      icon: 'dashboard-icon',
      path: '/development/dashboard',
      requiredPermissions: [
        PERMISSIONS.CREATE_PROJECT, 
        PERMISSIONS.VIEW_APPLICATIONS,
        PERMISSIONS.SWIPE_PROJECTS
      ],  // All roles need at least one of these
      isActive: true
    },
    {
      id: 'connect',
      name: 'connect',
      displayName: 'Connect',
      description: 'Connect with researchers and mentors',
      icon: 'connect-icon',
      path: '/development/connect',
      requiredPermissions: [PERMISSIONS.SWIPE_PROJECTS],  // Student-only feature
      isActive: true
    }
  ];
  
  // utility to check if a user has a specific permission
  export const hasPermission = (userPermissions: string[], permission: string): boolean => {
    return userPermissions.includes(permission);
  };