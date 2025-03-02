module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      isolatedModules: true,  // Add this to ignore TypeScript errors
      diagnostics: false      // Disable TypeScript diagnostics
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  globalTeardown: '<rootDir>/src/tests/teardown.ts',
  testTimeout: 10000, // Increase timeout for Firestore operations
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/tests/**/*.ts',
    '!src/**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  verbose: true
}; 