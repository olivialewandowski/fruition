# Top Choices Feature Documentation

## Overview

The Top Choices feature allows students to mark a subset of their project applications as "top choices" to indicate their highest interest to faculty members. Faculty will prioritize these applications during the review process.

The feature includes two main components:
1. **Top Choices Manager**: Displays and manages the student's current top choice projects
2. **Active Projects Dropdown**: Allows students to add new projects to their top choices from their active applications

## Implementation Details

### Components

#### ActiveProjectsDropdown

The `ActiveProjectsDropdown` component displays a list of the student's active project applications that haven't been marked as top choices yet. It allows students to easily add these projects to their top choices.

**Features:**
- Filters applications to show only active ones (pending, reviewing, interviewing, accepted)
- Initially displays a configurable number of projects (default: 3)
- Includes a "Show More/Show Less" toggle for longer lists
- Shows project details including title, department, mentor, and a snippet of the description
- Displays appropriate status badges for each application
- Provides "Add as Top" buttons for each project
- Shows loading state during actions
- Automatically hides when there are no eligible projects

**Props:**
```typescript
interface ActiveProjectsDropdownProps {
  applications: (Application & { project: Project })[];
  topProjects: string[];
  maxTopProjects: number;
  onTopProjectToggled: (projectId: string, isCurrentlyTop: boolean) => Promise<void>;
  initialVisibleCount?: number;
}
```

#### TopChoicesManager

The `TopChoicesManager` component displays the student's current top choice projects and allows them to remove projects from their top choices.

**Features:**
- Shows the count of used/available top choice slots
- Displays each top choice project with details
- Provides a "Remove" button for each project
- Shows appropriate empty state when no top choices are selected
- Shows loading state during data fetching

**Props:**
```typescript
interface TopChoicesManagerProps {
  topProjects: string[];
  maxTopProjects: number;
  applications: (Application & { project: Project })[];
  onToggleTopProject: (projectId: string, isCurrentlyTop: boolean) => Promise<void>;
  isLoading: boolean;
}
```

### Usage

The components are integrated into the `StudentAppliedProjectsTab` component, which handles:
- Fetching student applications
- Retrieving and updating top project preferences
- Managing the maximum allowed top projects (calculated as 5% of total applications)
- Providing feedback to the user through toast notifications

## Testing

Both components include comprehensive test suites that verify:
- Correct rendering of UI elements
- Proper filtering of applications
- Show More/Show Less functionality
- Correct handling of button clicks
- Loading states
- Empty states
- Edge cases like maximum slots reached

## Business Logic

The Top Choices feature enforces the following business rules:
1. Students can mark up to 5% of their total applications as top choices (minimum 1)
2. Top choice selections are stored in the student's user document
3. The isTopChoice flag is updated in the application documents
4. Faculty members can see which applications are marked as top choices

## Future Enhancements

Possible future enhancements include:
- Analytics on how top choice selections affect application outcomes
- Additional sorting/filtering options in the dropdown
- Ability to rank top choices in order of preference 