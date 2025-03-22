# Data Hooks in Fruition Dashboard

This document explains the React Query-based data hooks used in the Fruition dashboard architecture. Our hooks approach centralizes data fetching logic and provides a consistent pattern for managing loading states, error handling, and data caching.

## Core Principles

Our data hooks system is built on these core principles:

1. **Centralized Data Management**: All data fetching logic is centralized in hook functions
2. **Consistent Error Handling**: Every hook follows the same pattern for error handling
3. **Optimized Performance**: React Query's caching reduces network requests
4. **Type Safety**: TypeScript ensures data structures are consistent
5. **Separation of Concerns**: UI components are decoupled from data fetching

## Main Data Hooks

### Applications and Projects

- `useStudentApplications()`: Fetches a student's applications with caching
- `useUserProjects(tabType)`: Fetches user projects filtered by active/archived status
- `useRecommendedProjects(userId)`: Fetches projects recommended based on user skills
- `useApplicationsData(params)`: Fetches detailed application statistics with time range filtering

### Top Projects Management

- `useStudentTopProjects()`: Fetches a student's top project choices
- `useMaxTopProjects()`: Fetches the maximum number of allowed top projects
- `useToggleTopProject()`: Mutation hook to toggle a project's top status
- `useRemoveTopProject()`: Mutation hook to remove a project from top choices
- `useTopChoicesWidget()`: Comprehensive hook that combines all top project related data and mutations

### Metrics and Statistics

- `useMetricsData(userId)`: Fetches dashboard metrics (applications, statuses, etc.)
- `useActivityFeedData(userId, maxItems)`: Fetches activity feed items for the dashboard

## Query Keys

We use consistent query keys to ensure proper cache invalidation:

```typescript
export const QueryKeys = {
  applications: 'applications',
  topProjects: 'topProjects',
  maxTopProjects: 'maxTopProjects',
  userProjects: (tabType: string) => ['userProjects', tabType],
  userSkills: 'userSkills',
  recommendedProjects: 'recommendedProjects',
  applicationsData: (userId: string, timeRange: string) => ['applicationsData', userId, timeRange],
  metricsData: (userId: string) => ['metricsData', userId],
  activityFeed: 'activityFeed',
};
```

## Example Usage

### Basic Query Hook

```typescript
function Component() {
  const { data, isLoading, error } = useStudentApplications();
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return <ApplicationsList applications={data} />;
}
```

### Mutation Hook

```typescript
function Component() {
  const { mutate, isPending } = useToggleTopProject();
  
  const handleToggleTopProject = (projectId: string) => {
    mutate(projectId, {
      onSuccess: () => {
        toast.success('Project updated successfully');
      },
      onError: (error) => {
        toast.error('Failed to update project');
      }
    });
  };
  
  return (
    <button 
      onClick={() => handleToggleTopProject('project-123')}
      disabled={isPending}
    >
      Toggle Top Project
    </button>
  );
}
```

### Comprehensive Widget Hook

```typescript
function TopChoicesWidget() {
  const {
    topProjects,
    eligibleApplications,
    maxTopProjects,
    isLoading,
    isRemoving,
    error,
    removeTopProject,
    toggleTopProject
  } = useTopChoicesWidget();
  
  // Component implementation using all the data and functions...
}
```

## Best Practices

1. **Use Suspense When Possible**: React 18's Suspense works well with React Query
2. **Specify Appropriate Cache Times**: Set staleTime and gcTime based on how often data changes
3. **Use Query Keys Consistently**: Follow the established pattern for query keys
4. **Implement Optimistic Updates**: For better user experience, update the UI optimistically
5. **Include Error Handling**: Always handle errors gracefully

## Cache Invalidation

When implementing mutations that modify data, ensure you invalidate the relevant queries:

```typescript
const queryClient = useQueryClient();

// After a successful mutation
queryClient.invalidateQueries({ queryKey: [QueryKeys.applications] });
```

## Advanced Features

### Dependent Queries

Some hooks depend on the results of other queries:

```typescript
// This query only runs when userSkillsQuery has completed
const recommendedProjectsQuery = useQuery({
  queryKey: [QueryKeys.recommendedProjects, userId, userSkillsQuery.data],
  queryFn: async () => {
    // Logic to get recommended projects based on skills
  },
  enabled: !userSkillsQuery.isLoading,
});
```

### Optimistic Updates

For responsive UIs, we implement optimistic updates:

```typescript
const mutation = useMutation({
  mutationFn: (projectId: string) => toggleTopProject(projectId),
  onMutate: async (projectId) => {
    await queryClient.cancelQueries({ queryKey: [QueryKeys.topProjects] });
    const previousData = queryClient.getQueryData([QueryKeys.topProjects]);
    
    // Optimistically update the cache
    queryClient.setQueryData([QueryKeys.topProjects], (old: string[]) => {
      if (old.includes(projectId)) {
        return old.filter(id => id !== projectId);
      } else {
        return [...old, projectId];
      }
    });
    
    return { previousData };
  },
  onError: (err, projectId, context) => {
    // Roll back on error
    queryClient.setQueryData(
      [QueryKeys.topProjects], 
      context?.previousData
    );
  },
});
```

## Extending the System

When adding new data requirements to the dashboard:

1. Add appropriate query keys to the QueryKeys object
2. Create a new hook function in useDashboardData.ts
3. Use consistent patterns for loading, error handling, and caching
4. Update widget components to use the new hook
5. Document the new hook in this README 