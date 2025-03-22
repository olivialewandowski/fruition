// Mock for Firebase
// This file should be automatically detected by Jest due to the __mocks__ directory

export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
};

export const db = {
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
        limit: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({
            docs: [],
            forEach: jest.fn(),
          })),
        })),
      })),
      limit: jest.fn(() => ({
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
      limit: jest.fn(() => ({
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
    add: jest.fn(() => Promise.resolve({ id: 'new-doc-id' })),
    get: jest.fn(() => Promise.resolve({
      docs: [],
      forEach: jest.fn(),
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
};

export const getFirestore = jest.fn(() => db);
export const getAuth = jest.fn(() => auth);

// Mock Firestore functions
export const collection = jest.fn(() => db.collection());
export const doc = jest.fn(() => db.doc());
export const getDoc = jest.fn(() => Promise.resolve({
  exists: jest.fn(() => true),
  data: jest.fn(() => ({})),
  id: 'test-doc-id',
}));
export const getDocs = jest.fn(() => Promise.resolve({
  docs: [],
  forEach: jest.fn(),
}));
export const setDoc = jest.fn(() => Promise.resolve());
export const updateDoc = jest.fn(() => Promise.resolve());
export const deleteDoc = jest.fn(() => Promise.resolve());
export const query = jest.fn(() => ({
  get: jest.fn(() => Promise.resolve({
    docs: [],
    forEach: jest.fn(),
  })),
}));
export const where = jest.fn(() => query);
export const orderBy = jest.fn(() => query);
export const limit = jest.fn(() => query);

// Mock for Firebase Timestamp
export const Timestamp = {
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
};

// Mock Firebase config
export const firebaseConfig = {
  apiKey: "test-api-key",
  authDomain: "test-auth-domain",
  projectId: "test-project-id",
  storageBucket: "test-storage-bucket",
  messagingSenderId: "test-messaging-sender-id",
  appId: "test-app-id",
  measurementId: "test-measurement-id"
};

// Mock initialization
export const initializeApp = jest.fn();

export default {
  auth,
  db,
  getFirestore,
  getAuth,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  firebaseConfig,
  initializeApp,
}; 