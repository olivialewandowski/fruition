// Import jest-dom matchers
import '@testing-library/jest-dom';

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Extend expect with jest-dom matchers
expect.extend({
  toBeInTheDocument: (received) => {
    const pass = received !== null;
    return {
      pass,
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be in the document`,
    };
  },
});

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    pathname: '/',
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    },
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock for useAuth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' },
    userData: { role: 'student' },
    loading: false,
    isAuthenticated: true,
    refreshUserData: jest.fn().mockResolvedValue(undefined),
  }),
  isAuthenticated: () => true,
}));

// Mock for toast notifications
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => null,
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock Firebase
jest.mock('firebase/app', () => {
  return {
    initializeApp: jest.fn().mockReturnValue({}),
    getApps: jest.fn().mockReturnValue([]),
  };
});

jest.mock('firebase/auth', () => {
  return {
    getAuth: jest.fn().mockReturnValue({}),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
  };
});

jest.mock('firebase/firestore', () => {
  return {
    getFirestore: jest.fn().mockReturnValue({}),
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    serverTimestamp: jest.fn(),
    Timestamp: {
      now: jest.fn(),
      fromDate: jest.fn(),
      fromMillis: jest.fn(),
    },
  };
});

// Mock fetch API
global.fetch = jest.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
  })
); 