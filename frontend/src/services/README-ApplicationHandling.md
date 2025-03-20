# Application Rejection Handling

This document explains the comprehensive rejection handling system implemented for student applications in the Fruition platform.

## Overview

When a student's application is rejected, several data consistency issues needed to be addressed:

1. The application status needs to be updated to 'rejected'
2. If the project was in the student's top choices, it should be removed
3. The project should be added to the student's rejected projects list
4. Any subcollection applications under the project/positions structure should be updated
5. All operations should be atomic to prevent data inconsistency

The `handleApplicationRejection` function in `studentService.ts` addresses these requirements by implementing a comprehensive solution that follows industry standards.

## Implementation Details

The implementation uses Firestore batch writes to ensure atomic operations (all succeed or all fail). Key features include:

### Data Consistency
- Uses batched writes to ensure atomic transactions across multiple documents
- Updates all relevant collections and user preferences in a single operation
- Handles errors gracefully, with specific error logging for each step

### Comprehensive Updates
- Updates the main application document status
- Manages user preferences (top choices and rejected projects)
- Updates any relevant subcollection applications
- Uses serverTimestamp for consistent timestamps

### Error Handling
- Graceful error handling that doesn't fail the entire operation if subcollection updates fail
- Authentication checks to prevent unauthorized operations
- Comprehensive logging for debugging and traceability

## Usage

The function should be used whenever a student's application is rejected instead of the simpler `updateApplicationStatus` function:

```typescript
// Use this for rejection scenarios
await handleApplicationRejection(applicationId, projectId);

// Use this for other status updates (pending, accepted, hired)
await updateApplicationStatus(applicationId, newStatus);
```

This has been integrated into the `ApplicationsManager` component's `handleStatusChange` function to automatically use the comprehensive handler for rejections.

## Testing

The function is fully tested in `studentService.test.ts` with the following test cases:

1. Authentication validation
2. Application status updates
3. Top choices management
4. Rejected projects tracking
5. Subcollection application updates
6. Error handling during subcollection operations

## Future Enhancements

Potential improvements for this system:

1. Extend comprehensive handling to other status changes (acceptances, hiring)
2. Add notification batching to the same atomic operation
3. Implement queue-based processing for very large operations
4. Add analytics tracking for rejection rates

## Business Logic

Key business rules enforced by this implementation:

1. Rejected applications are immediately removed from top choices
2. Rejected projects are tracked in user preferences for potential reporting
3. Applications maintain a history of status changes via timestamps
4. Database consistency is maintained even during partial system failures

## Troubleshooting

If you encounter issues with application rejection:

1. Check the console logs for specific error messages
2. Verify that the application and project IDs are valid
3. Ensure the user has proper authentication and permissions
4. Check the Firestore security rules to verify they allow these operations

## Security Considerations

This implementation respects Firestore security rules by:

1. Checking authentication before performing operations
2. Only updating documents the user has access to
3. Only allowing valid status values
4. Using serverTimestamp() for consistent, tamper-proof timestamps 