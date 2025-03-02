// Export all types from their respective files
export * from './user';
export * from './project';
export * from './position';
// Avoid conflicts with position.ts which also has Application types
export { 
  Application as ProjectApplication,
  ApplicationWithId as ProjectApplicationWithId
} from './application';
export * from './university';
export * from './userAction';
// Avoid conflicts with position.ts which also has MaterialFile type
export {
  MaterialFile as OnboardingMaterialFile,
  MaterialFileWithId as OnboardingMaterialFileWithId
} from './onboardingMaterial';
// Avoid conflicts with permissions.ts which has overlapping types
export { 
  Feature as FeatureDefinition,
  Permission as PermissionDefinition,
  PermissionWithId as PermissionWithIdDefinition
} from './feature';
export * from './permissions';
export * from './waitlist';
