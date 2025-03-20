# Unit Testing Guidelines

This document outlines testing strategies and practices for the Fruition project.

## Test Setup

Our testing stack includes:

- **Jest**: The main testing framework
- **React Testing Library**: For testing React components
- **jest-fetch-mock**: For mocking fetch API calls

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode with coverage
npm run test:ci

# Run specific tests by pattern
npm test -- --testPathPattern="ComponentName.test.tsx"
```

## Writing Tests

### Component Tests

1. **Setup**: Import the component and necessary mock functions
2. **Render**: Use `render` from React Testing Library
3. **Assertions**: Test component behavior using appropriate assertions

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import YourComponent from '@/components/YourComponent';

describe('YourComponent', () => {
  it('renders correctly', async () => {
    await act(async () => {
      render(<YourComponent />);
    });
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Testing Async Components

When testing components with async operations:

1. **Use `act`**: Wrap render and state changes in `act` to ensure React updates are processed
2. **Use `waitFor`**: Wait for async operations to complete
3. **Test loading states**: Verify loading states are correctly shown and hidden

```typescript
it('shows loading state then content', async () => {
  // Render with act
  await act(async () => {
    render(<AsyncComponent />);
  });
  
  // Verify loading state
  expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  
  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
  });
  
  // Verify content is shown
  expect(screen.getByText('Content')).toBeInTheDocument();
});
```

### Mocking

#### Service Mocks

Create mocks for service functions to avoid actual API calls:

```typescript
jest.mock('@/services/yourService', () => ({
  getData: jest.fn().mockResolvedValue({ data: 'mocked data' }),
  updateData: jest.fn().mockResolvedValue(true),
}));
```

#### Context Mocks

Mock context providers to supply test values:

```typescript
jest.mock('@/contexts/YourContext', () => ({
  useYourContext: jest.fn().mockReturnValue({
    data: 'test data',
    loading: false,
    error: null,
  }),
}));
```

## Common Issues and Solutions

### Handling React State Updates

When testing components that update state, wrap changes in `act`:

```typescript
await act(async () => {
  fireEvent.click(button);
});
```

### Testing Loading States

Use delayed promises to test loading states:

```typescript
const createDelayedPromise = <T,>(data: T, ms = 100): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), ms);
  });
};

// In beforeEach
(mockService.getData).mockImplementation(() => 
  createDelayedPromise(mockData, 200)
);
```

### Finding Elements

- Use `getBy*` methods when elements should exist
- Use `queryBy*` methods when elements might not exist
- Use `findBy*` methods for elements that will appear asynchronously

```typescript
// Element must exist
const button = screen.getByRole('button', { name: 'Submit' });

// Element might not exist
const errorMessage = screen.queryByText('Error occurred');

// Element will appear after async operation
const successMessage = await screen.findByText('Success!');
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what the component does, not how it does it
2. **Use accessible queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Mock minimally**: Only mock what's necessary
4. **Isolate tests**: Each test should be independent and not rely on other tests
5. **Test edge cases**: Include tests for loading states, error states, and empty states
6. **Keep tests readable**: Use descriptive test names and clear assertions

## Contribution Guidelines

1. Add tests for new components and features
2. Update tests when modifying existing components
3. Ensure all tests pass before submitting a PR
4. Aim for high test coverage, especially for critical paths 