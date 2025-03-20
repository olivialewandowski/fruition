# Application Management Features

## Overview

The Application Management feature provides students with a centralized interface for managing their project applications. The feature includes:

1. A summary of all applications in the Active tab
2. The ability to mark applications as "Top Choices" 
3. A dropdown to select from active projects that haven't been marked as top choices
4. A complete list of all applications with their statuses in the Applied tab

## Components

### 1. StudentActiveTabApplications

This component is displayed in the Active tab of the student dashboard. It shows:

- A summary card with the total number of applications
- A dropdown to select from active applications (if there are available top choice slots)
- A display of current top choice projects (if any exist)
- A link to view all applications in the Applied tab

**Props:**
- `onRefresh`: Optional callback function to refresh parent component data

**Dependencies:**
- Uses the `TopChoicesManager` component from `StudentAppliedProjectsTab`
- Uses the `ActiveProjectsDropdown` component

### 2. ActiveProjectsDropdown

Displays a dropdown menu of active projects that can be marked as top choices.

**Props:**
- `applications`: List of student applications with project details
- `topProjects`: Array of project IDs already marked as top choices
- `maxTopProjects`: Maximum number of allowed top choices
- `onTopProjectToggled`: Callback when a project is marked/unmarked as top choice
- `initialVisibleCount`: Number of projects to show initially (default: 3)

### 3. TopChoicesManager

Displays the current top choice projects and allows students to remove them from their top choices.

**Props:**
- `topProjects`: Array of project IDs marked as top choices
- `maxTopProjects`: Maximum number of allowed top choices
- `applications`: List of student applications with project details
- `onToggleTopProject`: Callback when a project is marked/unmarked as top choice
- `isLoading`: Boolean indicating if data is loading

## Implementation Details

### Data Flow

1. Student application data is fetched using `getStudentApplications()` from `studentService`
2. Top projects are fetched using `getStudentTopProjects()`
3. The maximum number of allowed top projects is calculated as 5% of total applications (minimum 1) using `getMaxTopProjects()`
4. The `toggleTopProject` function handles both adding and removing projects from top choices

### Conditional Rendering

- The applications summary is only shown if the student has at least one application
- The `ActiveProjectsDropdown` is only shown if the student hasn't filled all their top choice slots
- The `TopChoicesManager` is only shown if the student has at least one top choice project

### Integration

The feature is integrated in two places:

1. **Active Tab** - Via the `StudentActiveTabApplications` component, which provides a summary view with essential functionality
2. **Applied Tab** - The full `StudentAppliedProjectsTab` component shows all applications with detailed status information

## Testing

The implementation includes comprehensive tests for all components:

- `StudentActiveTabApplications.test.tsx`: Tests for the component that appears in the Active tab
- `TopChoicesManager.test.tsx`: Tests for the top choices display and management functionality
- `ActiveProjectsDropdown.test.tsx`: Tests for the dropdown functionality

## Business Logic

1. Students can mark up to 5% of their total applications as top choices (minimum 1)
2. Top choice projects are given higher priority by faculty during the selection process
3. Students can add or remove projects from their top choices at any time
4. The application status is displayed in both the Active and Applied tabs

## Future Enhancements

1. Analytics on which top choices were successful
2. Notification system for application status changes
3. Faculty view to see which students have marked their projects as top choices
4. Sorting and filtering options for the applications list
5. Ability to track application status history over time 