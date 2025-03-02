// This file is run before each test file

// Add an empty export to make this file a module
export {};

// Declare Jest globals to fix TypeScript errors
declare global {
  namespace NodeJS {
    interface Global {
      console: Console;
    }
  }
}

// Silence Firebase logs during tests
process.env.FIREBASE_LOG_LEVEL = 'error';

// Set environment variables for testing
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';

// Increase Jest timeout for Firestore operations
jest.setTimeout(10000);

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  // Uncomment to silence specific console methods during tests
  // log: jest.fn(),
  // info: jest.fn(),
  // debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 