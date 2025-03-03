import { DocumentData } from "firebase-admin/firestore";

/**
 * Validate a user document
 * @param userData - The user data to validate
 * @returns An object with validation result and errors
 */
export function validateUser(userData: DocumentData): {
  isValid: boolean;
  errors: string[]
} {
  const errors: string[] = [];

  // Required fields
  const requiredFields = ["email", "displayName", "role"];
  for (const field of requiredFields) {
    if (!userData[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Role validation
  if (userData.role && !["admin", "faculty", "student"].includes(userData.role)) {
    errors.push(`Invalid role: ${userData.role}. Must be one of: admin, faculty, student`);
  }

  // Email validation
  if (userData.email && !isValidEmail(userData.email)) {
    errors.push(`Invalid email format: ${userData.email}`);
  }

  // Student-specific validation
  if (userData.role === "student") {
    if (!userData.major) {
      errors.push("Student must have a major");
    }

    if (!userData.year) {
      errors.push("Student must have a year");
    }
  }

  // Faculty-specific validation
  if (userData.role === "faculty") {
    if (!userData.department) {
      errors.push("Faculty must have a department");
    }

    if (!userData.title) {
      errors.push("Faculty must have a title");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Add this interface before the validateProject function
interface ProjectPosition {
  title: string;
  description: string;
  isOpen: boolean;
}

/**
 * Validate a project document
 * @param projectData - The project data to validate
 * @returns An object with validation result and errors
 */
export function validateProject(projectData: DocumentData): {
  isValid: boolean;
  errors: string[]
} {
  const errors: string[] = [];

  // Required fields
  const requiredFields = ["title", "description", "facultyId", "departmentId", "universityId"];
  for (const field of requiredFields) {
    if (!projectData[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Title length
  if (projectData.title && (projectData.title.length < 5 || projectData.title.length > 100)) {
    errors.push("Title must be between 5 and 100 characters");
  }

  // Description length
  if (projectData.description && (projectData.description.length < 50 || projectData.description.length > 5000)) {
    errors.push("Description must be between 50 and 5000 characters");
  }

  // Keywords validation
  if (projectData.keywords && !Array.isArray(projectData.keywords)) {
    errors.push("Keywords must be an array");
  } else if (projectData.keywords && projectData.keywords.length > 10) {
    errors.push("Maximum of 10 keywords allowed");
  }

  // Positions validation
  if (projectData.positions) {
    if (!Array.isArray(projectData.positions)) {
      errors.push("Positions must be an array");
    } else {
      projectData.positions.forEach((position: ProjectPosition, index: number) => {
        if (!position.title) {
          errors.push(`Position ${index + 1} is missing a title`);
        }
        if (!position.description) {
          errors.push(`Position ${index + 1} is missing a description`);
        }
        if (position.isOpen === undefined) {
          errors.push(`Position ${index + 1} is missing isOpen status`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate an application document
 * @param applicationData - The application data to validate
 * @returns An object with validation result and errors
 */
export function validateApplication(applicationData: DocumentData): {
  isValid: boolean;
  errors: string[]
} {
  const errors: string[] = [];

  // Required fields
  const requiredFields = ["studentId", "projectId", "positionId", "interestStatement"];
  for (const field of requiredFields) {
    if (!applicationData[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Interest statement length
  if (applicationData.interestStatement &&
      (applicationData.interestStatement.length < 50 || applicationData.interestStatement.length > 2000)) {
    errors.push("Interest statement must be between 50 and 2000 characters");
  }

  // Status validation
  if (applicationData.status &&
      !["pending", "reviewing", "interviewing", "accepted", "rejected"].includes(applicationData.status)) {
    errors.push(`Invalid status: ${applicationData.status}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a department document
 * @param departmentData - The department data to validate
 * @returns An object with validation result and errors
 */
export function validateDepartment(departmentData: DocumentData): {
  isValid: boolean;
  errors: string[]
} {
  const errors: string[] = [];

  // Required fields
  const requiredFields = ["name", "universityId"];
  for (const field of requiredFields) {
    if (!departmentData[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Name length
  if (departmentData.name && (departmentData.name.length < 2 || departmentData.name.length > 100)) {
    errors.push("Name must be between 2 and 100 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a university document
 * @param universityData - The university data to validate
 * @returns An object with validation result and errors
 */
export function validateUniversity(universityData: DocumentData): {
  isValid: boolean;
  errors: string[]
} {
  const errors: string[] = [];

  // Required fields
  const requiredFields = ["name", "country", "state"];
  for (const field of requiredFields) {
    if (!universityData[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Name length
  if (universityData.name && (universityData.name.length < 2 || universityData.name.length > 100)) {
    errors.push("Name must be between 2 and 100 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate an email address
 * @param email - The email to validate
 * @returns Whether the email is valid
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize user input to prevent XSS attacks
 * @param input - The input to sanitize
 * @returns The sanitized input
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Validate and sanitize a document
 * @param data - The document data
 * @param validationFn - The validation function
 * @param sanitizeFields - Fields to sanitize
 * @returns The validated and sanitized document
 */
export function validateAndSanitize(
  data: DocumentData,
  validationFn: (data: DocumentData) => { isValid: boolean; errors: string[] },
  sanitizeFields: string[] = []
): {
  isValid: boolean;
  errors: string[];
  sanitizedData: DocumentData
} {
  // Validate the data
  const { isValid, errors } = validationFn(data);

  // Create a copy of the data for sanitization
  const sanitizedData = { ...data } as DocumentData;

  // Sanitize specified fields
  for (const field of sanitizeFields) {
    if (typeof sanitizedData[field] === "string") {
      sanitizedData[field] = sanitizeInput(sanitizedData[field]);
    }
  }

  return {
    isValid,
    errors,
    sanitizedData,
  };
}
