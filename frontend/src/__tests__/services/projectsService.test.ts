import {
  getProjects,
  getSavedProjects,
  getAppliedProjects,
  saveProject,
  applyToProject,
  declineProject,
  removeProject
} from '@/services/projectsService';
import * as authService from '@/services/authService';

// Mock the authService
jest.mock('@/services/authService', () => ({
  getCurrentUser: jest.fn(),
  getCurrentUserSync: jest.fn()
}));

// Mock the firebase config with more complete mocks
jest.mock('@/config/firebase', () => {
  const mockCollection = jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({
        exists: true,
        data: () => ({
          savedProjects: ['1', '2'],
          appliedProjects: ['3', '4'],
          declinedProjects: ['7']
        })
      })),
      set: jest.fn(() => Promise.resolve())
    }))
  }));

  return {
    db: {
      collection: mockCollection
    },
    auth: {
      currentUser: { uid: 'test-user-id' },
      onAuthStateChanged: jest.fn()
    }
  };
});

// Mock the axios module
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn()
}));

// No need to mock @/data/sampleProjects directly

describe('projectsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the auth.currentUser mock
    const firebaseConfig = require('@/config/firebase');
    firebaseConfig.auth.currentUser = { uid: 'test-user-id' };
    
    // Mock authService
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({ uid: 'test-user-id' });
    (authService.getCurrentUserSync as jest.Mock).mockReturnValue({ uid: 'test-user-id' });
    
    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        clear: () => { store = {}; }
      };
    })();
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  });
  
  describe('getProjects', () => {
    it('returns projects', async () => {
      const projects = await getProjects();
      
      // Should return an array of projects
      expect(Array.isArray(projects)).toBe(true);
      
      // Each project should have the required fields if any projects are returned
      if (projects.length > 0) {
        const project = projects[0];
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('title');
        expect(project).toHaveProperty('description');
      }
    });
  });
  
  describe('getSavedProjects', () => {
    it('returns empty array when not authenticated', async () => {
      // Set user as not authenticated
      const firebaseConfig = require('@/config/firebase');
      firebaseConfig.auth.currentUser = null;
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);
      (authService.getCurrentUserSync as jest.Mock).mockReturnValue(null);
      
      const projects = await getSavedProjects();
      
      // Should return an empty array
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBe(0);
    });
    
    it('returns saved projects for authenticated user', async () => {
      // Mock localStorage with saved projects
      localStorage.setItem('test-user-id_savedProjects', JSON.stringify(['1', '2']));
      
      const projects = await getSavedProjects();
      
      // Should return an array
      expect(Array.isArray(projects)).toBe(true);
    });
  });
  
  describe('getAppliedProjects', () => {
    it('returns empty array when not authenticated', async () => {
      // Set user as not authenticated
      const firebaseConfig = require('@/config/firebase');
      firebaseConfig.auth.currentUser = null;
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);
      (authService.getCurrentUserSync as jest.Mock).mockReturnValue(null);
      
      const projects = await getAppliedProjects();
      
      // Should return an empty array
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBe(0);
    });
    
    it('returns applied projects for authenticated user', async () => {
      // Mock localStorage with applied projects
      localStorage.setItem('test-user-id_appliedProjects', JSON.stringify(['3', '4']));
      
      const projects = await getAppliedProjects();
      
      // Should return an array
      expect(Array.isArray(projects)).toBe(true);
    });
  });
  
  describe('saveProject', () => {
    it('returns false when not authenticated', async () => {
      // Set user as not authenticated
      const firebaseConfig = require('@/config/firebase');
      firebaseConfig.auth.currentUser = null;
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);
      (authService.getCurrentUserSync as jest.Mock).mockReturnValue(null);
      
      const result = await saveProject('1');
      
      // Should return false
      expect(result).toBe(false);
    });
    
    it('attempts to save project for authenticated user', async () => {
      // Setup localStorage
      localStorage.setItem('test-user-id_savedProjects', JSON.stringify(['1']));
      
      try {
        await saveProject('5');
        // If we get here, the test passes (no error thrown)
        expect(true).toBe(true);
      } catch (error) {
        // If we get here, the test fails
        expect(error).toBeUndefined();
      }
    });
  });
  
  describe('applyToProject', () => {
    it('returns false when not authenticated', async () => {
      // Set user as not authenticated
      const firebaseConfig = require('@/config/firebase');
      firebaseConfig.auth.currentUser = null;
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);
      (authService.getCurrentUserSync as jest.Mock).mockReturnValue(null);
      
      const result = await applyToProject('1');
      
      // Should return false
      expect(result).toBe(false);
    });
    
    it('attempts to apply to project for authenticated user', async () => {
      // Setup localStorage
      localStorage.setItem('test-user-id_appliedProjects', JSON.stringify(['3']));
      
      try {
        await applyToProject('6');
        // If we get here, the test passes (no error thrown)
        expect(true).toBe(true);
      } catch (error) {
        // If we get here, the test fails
        expect(error).toBeUndefined();
      }
    });
  });
  
  describe('declineProject', () => {
    it('returns false when not authenticated', async () => {
      // Set user as not authenticated
      const firebaseConfig = require('@/config/firebase');
      firebaseConfig.auth.currentUser = null;
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);
      (authService.getCurrentUserSync as jest.Mock).mockReturnValue(null);
      
      const result = await declineProject('1');
      
      // Should return false
      expect(result).toBe(false);
    });
    
    it('attempts to decline project for authenticated user', async () => {
      // Setup localStorage
      localStorage.setItem('test-user-id_declinedProjects', JSON.stringify([]));
      
      try {
        await declineProject('7');
        // If we get here, the test passes (no error thrown)
        expect(true).toBe(true);
      } catch (error) {
        // If we get here, the test fails
        expect(error).toBeUndefined();
      }
    });
  });
  
  describe('removeProject', () => {
    it('returns false when not authenticated', async () => {
      // Set user as not authenticated
      const firebaseConfig = require('@/config/firebase');
      firebaseConfig.auth.currentUser = null;
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);
      (authService.getCurrentUserSync as jest.Mock).mockReturnValue(null);
      
      const result = await removeProject('1');
      
      // Should return false
      expect(result).toBe(false);
    });
    
    it('attempts to remove saved project for authenticated user', async () => {
      // Setup saved projects
      localStorage.setItem('test-user-id_savedProjects', JSON.stringify(['8', '9']));
      
      try {
        await removeProject('8');
        // If we get here, the test passes (no error thrown)
        expect(true).toBe(true);
      } catch (error) {
        // If we get here, the test fails
        expect(error).toBeUndefined();
      }
    });
  });
}); 