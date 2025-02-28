// src/permissions/connect/index.ts
import { swipeProjects } from './swipeProjects';
import { saveProjects } from './saveProjects';
import { applyToProjects } from './applyToProjects';

// export connect permissions
export const connectPermissions = {
  SWIPE_PROJECTS: swipeProjects.id,
  SAVE_PROJECTS: saveProjects.id,
  APPLY_TO_PROJECTS: applyToProjects.id
};

// export permission objects
export const connectPermissionDefinitions = [
  swipeProjects,
  saveProjects,
  applyToProjects
];