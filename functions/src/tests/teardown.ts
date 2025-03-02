// This file is run after all tests have completed

/**
 * Global teardown function that runs after all tests
 */
export default async function globalTeardown(): Promise<void> {
  console.log('Running global teardown');
  
  // Add a small delay to ensure all operations are complete
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Force close any remaining connections
  console.log('Forcing exit to close any remaining connections');
  
  // Return a promise that resolves after a delay
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Global teardown complete');
      resolve();
    }, 500);
  });
} 