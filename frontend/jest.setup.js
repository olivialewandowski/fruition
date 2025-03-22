// Import jest-dom matchers
import '@testing-library/jest-dom';

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Set environment variables for Firebase
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-auth-domain.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-storage-bucket.appspot.com';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test-messaging-sender-id';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id';
process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = 'test-measurement-id';

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

// Define Firebase mock functions directly
const firebaseMock = {
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  },
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({
          exists: true,
          data: jest.fn(() => ({})),
          id: 'test-doc-id',
        })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({
            docs: [],
            forEach: jest.fn(),
          })),
        })),
        get: jest.fn(() => Promise.resolve({
          docs: [],
          forEach: jest.fn(),
        })),
      })),
      orderBy: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({
          docs: [],
          forEach: jest.fn(),
        })),
      })),
    })),
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({
        exists: true,
        data: jest.fn(() => ({})),
        id: 'test-doc-id',
      })),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve()),
    })),
  },
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({
    exists: jest.fn(() => true),
    data: jest.fn(() => ({})),
    id: 'test-doc-id',
  })),
  getDocs: jest.fn(() => Promise.resolve({
    docs: [],
    forEach: jest.fn(),
  })),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ 
      toDate: jest.fn(() => new Date()),
      seconds: 1234567890,
      nanoseconds: 123456789 
    })),
    fromDate: jest.fn(() => ({ 
      toDate: jest.fn(() => new Date()),
      seconds: 1234567890,
      nanoseconds: 123456789 
    })),
  },
  getFirestore: jest.fn(),
  getAuth: jest.fn(),
  initializeApp: jest.fn(),
  firebaseConfig: {
    apiKey: "test-api-key",
    authDomain: "test-auth-domain",
    projectId: "test-project-id",
    storageBucket: "test-storage-bucket",
    messagingSenderId: "test-messaging-sender-id",
    appId: "test-app-id",
    measurementId: "test-measurement-id"
  }
};

// Mock Firebase - using our dedicated mocks
jest.mock('firebase/app', () => {
  return {
    initializeApp: firebaseMock.initializeApp,
    getApps: jest.fn().mockReturnValue([]),
  };
});

jest.mock('firebase/auth', () => {
  return {
    getAuth: firebaseMock.getAuth,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
  };
});

jest.mock('firebase/firestore', () => {
  return {
    getFirestore: firebaseMock.getFirestore,
    collection: firebaseMock.collection,
    doc: firebaseMock.doc,
    getDoc: firebaseMock.getDoc,
    getDocs: firebaseMock.getDocs,
    setDoc: firebaseMock.setDoc,
    updateDoc: firebaseMock.updateDoc,
    addDoc: jest.fn(),
    deleteDoc: firebaseMock.deleteDoc,
    query: firebaseMock.query,
    where: firebaseMock.where,
    orderBy: firebaseMock.orderBy,
    limit: firebaseMock.limit,
    serverTimestamp: jest.fn(),
    Timestamp: firebaseMock.Timestamp,
  };
});

// Mock for firebase/config
jest.mock('@/config/firebase', () => {
  return {
    db: firebaseMock.db,
    auth: firebaseMock.auth,
    firebaseConfig: firebaseMock.firebaseConfig,
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