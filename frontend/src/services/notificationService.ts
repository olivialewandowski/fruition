import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  updateDoc,
  doc,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../config/firebase";
import { getAuth } from "firebase/auth";

/**
 * Interface for notification data
 */
export interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  projectId: string;
  applicationId?: string;
  isRead: boolean;
  tabContext: string;
  createdAt: any;
  [key: string]: any; // For dynamic property access
}

/**
 * Creates a notification for a user
 * 
 * @param userId - The user ID who will receive the notification
 * @param type - The notification type (e.g., 'application_rejected')
 * @param title - The notification title
 * @param message - The notification message
 * @param projectId - The related project ID
 * @param options - Additional options like applicationId, tabContext
 * @returns Promise<string> - The created notification ID
 */
export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  projectId: string,
  options: {
    applicationId?: string;
    tabContext?: string;
  } = {}
): Promise<string | null> => {
  try {
    if (!userId) {
      console.error("Cannot create notification: Missing userId");
      return null;
    }

    // Check if a similar notification already exists to avoid duplicates
    let existingQuery;
    
    if (options.applicationId) {
      existingQuery = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("type", "==", type),
        where("projectId", "==", projectId),
        where("applicationId", "==", options.applicationId)
      );
    } else {
      existingQuery = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("type", "==", type),
        where("projectId", "==", projectId)
      );
    }

    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      console.log(`Similar notification already exists for ${type}, not creating a duplicate`);
      return existingSnapshot.docs[0].id;
    }

    // Create notification object with proper validation
    const notificationData: NotificationData = {
      userId,
      type,
      title,
      message,
      projectId,
      isRead: false,
      tabContext: options.tabContext || 'general',
      createdAt: serverTimestamp()
    };

    // Add optional fields if they exist
    if (options.applicationId) {
      notificationData.applicationId = options.applicationId;
    }

    // Validate notification data to prevent Firebase errors
    const validatedData = validateNotificationData(notificationData);
    
    // Add the notification document
    const notificationRef = collection(db, "notifications");
    const docRef = await addDoc(notificationRef, validatedData);
    
    console.log(`Created ${type} notification (${docRef.id}) for user ${userId}`);
    return docRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error(`Notification error details: ${error.message}`);
      console.error(`Stack trace: ${error.stack}`);
    }
    return null;
  }
};

/**
 * Creates an application status change notification
 * 
 * @param studentId - The student ID 
 * @param type - Notification type
 * @param title - Notification title
 * @param message - Notification message
 * @param projectId - The project ID
 * @param applicationId - The application ID
 * @returns Promise<string|null> - The created notification ID or null
 */
export const createStatusChangeNotification = async (
  studentId: string,
  type: string,
  title: string,
  message: string,
  projectId: string,
  applicationId: string
): Promise<string | null> => {
  return createNotification(
    studentId,
    type,
    title,
    message,
    projectId,
    {
      applicationId,
      tabContext: 'applied'
    }
  );
};

/**
 * Mark notifications as read for a user and context
 * 
 * @param userId - The user ID
 * @param options - Options for filtering notifications
 * @returns Promise<number> - Number of notifications marked as read
 */
export const markNotificationsAsRead = async (
  userId: string,
  options: {
    projectId?: string;
    tabContext?: string;
    type?: string;
  } = {}
): Promise<number> => {
  try {
    if (!userId) {
      console.error("Cannot mark notifications as read: Missing userId");
      return 0;
    }

    // Build the query based on provided options
    let whereConditions: any[] = [
      where("userId", "==", userId),
      where("isRead", "==", false)
    ];

    if (options.projectId) {
      whereConditions.push(where("projectId", "==", options.projectId));
    }

    if (options.tabContext) {
      whereConditions.push(where("tabContext", "==", options.tabContext));
    }

    if (options.type) {
      whereConditions.push(where("type", "==", options.type));
    }

    const notificationsQuery = query(
      collection(db, "notifications"),
      ...whereConditions
    );

    const snapshot = await getDocs(notificationsQuery);

    if (snapshot.empty) {
      return 0;
    }

    // Use a batch to update all notifications at once
    const batch = writeBatch(db);

    snapshot.docs.forEach(document => {
      const notificationRef = doc(db, "notifications", document.id);
      batch.update(notificationRef, { isRead: true });
    });

    await batch.commit();
    console.log(`Marked ${snapshot.size} notifications as read`);

    return snapshot.size;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return 0;
  }
};

/**
 * Validate notification data to prevent Firebase errors
 * 
 * @param data - The notification data to validate
 * @returns NotificationData - The validated notification data
 */
export function validateNotificationData(data: NotificationData): NotificationData {
  const validatedData = { ...data };
  
  try {
    // Handle each field carefully
    Object.keys(validatedData).forEach(key => {
      const value = validatedData[key];
      
      // Replace undefined values with null for Firestore
      if (value === undefined) {
        validatedData[key] = null;
        return;
      }
      
      // Functions can't be stored in Firestore
      if (typeof value === 'function') {
        console.warn(`Invalid notification data type for ${key}: function`);
        validatedData[key] = null;
        return;
      }
      
      // Handle arrays specially - this addresses the "false for 'list'" error
      if (Array.isArray(value)) {
        try {
          // Filter out any invalid array elements (undefined, functions)
          validatedData[key] = value.filter(item => {
            // Skip undefined or function values
            if (item === undefined || typeof item === 'function') {
              return false;
            }
            
            // Deep check objects in arrays
            if (typeof item === 'object' && item !== null) {
              // Simple circular reference check (not perfect but helpful)
              try {
                JSON.stringify(item);
              } catch (circularErr) {
                console.warn(`Detected possible circular reference in array item for ${key}`);
                return false;
              }
            }
            
            return true;
          });
        } catch (arrayErr) {
          console.warn(`Error processing array for ${key}, using empty array instead`, arrayErr);
          validatedData[key] = [];
        }
        return;
      }
      
      // Handle objects (but not null)
      if (typeof value === 'object' && value !== null) {
        try {
          // Simple check for circular references
          try {
            JSON.stringify(value);
          } catch (circularErr) {
            console.warn(`Detected possible circular reference in ${key}, replacing with empty object`);
            validatedData[key] = {};
            return;
          }
          
          // If it's a date/timestamp, leave it alone
          if (value instanceof Date || 
              (value.toDate && typeof value.toDate === 'function')) {
            return;
          }
          
          // For other objects, recurse to validate nested fields
          validatedData[key] = validateNestedObject(value);
        } catch (objErr) {
          console.warn(`Error processing object for ${key}, using empty object instead`, objErr);
          validatedData[key] = {};
        }
      }
    });
    
    return validatedData;
  } catch (error) {
    console.error("Error validating notification data:", error);
    // Return a safe version of the original data
    return {
      userId: data.userId,
      type: data.type || 'unknown',
      title: data.title || 'Notification',
      message: data.message || '',
      projectId: data.projectId,
      isRead: !!data.isRead,
      tabContext: data.tabContext || 'general',
      createdAt: data.createdAt || null
    };
  }
}

/**
 * Helper function to validate nested objects
 */
function validateNestedObject(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const validatedObj = { ...obj };
  
  Object.keys(validatedObj).forEach(key => {
    const value = validatedObj[key];
    
    // Handle null, undefined
    if (value === undefined) {
      validatedObj[key] = null;
      return;
    }
    
    // Handle functions
    if (typeof value === 'function') {
      validatedObj[key] = null;
      return;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      validatedObj[key] = value.filter(item => 
        item !== undefined && typeof item !== 'function'
      );
      return;
    }
    
    // Handle nested objects
    if (typeof value === 'object' && value !== null) {
      // Prevent infinite recursion
      if (value === obj) {
        validatedObj[key] = {};
      } else {
        try {
          // Try to stringify to detect circular refs
          JSON.stringify(value);
          validatedObj[key] = validateNestedObject(value);
        } catch (e) {
          validatedObj[key] = {};
        }
      }
    }
  });
  
  return validatedObj;
}

export default {
  createNotification,
  createStatusChangeNotification,
  markNotificationsAsRead
}; 