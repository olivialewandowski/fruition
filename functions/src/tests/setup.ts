// / <reference types="jest" />

// This file is run before each test file

// Add an empty export to make this file a module
export {};

// Declare Jest globals to fix TypeScript errors
declare global {
  // Use interface augmentation instead of namespace
  interface Global {
    console: {
      log: typeof console.log;
      error: typeof console.error;
      warn: typeof console.warn;
      info: typeof console.info;
      debug: typeof console.debug;
    }
  }
}

// Silence Firebase logs during tests
process.env.FIREBASE_LOG_LEVEL = "error";

// Set environment variables for testing
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
process.env.FIREBASE_STORAGE_EMULATOR_HOST = "localhost:9199";

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
