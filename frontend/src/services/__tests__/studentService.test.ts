import { handleApplicationRejection } from '../studentService';
import { getAuth } from 'firebase/auth';
import {
  getDoc,
  getDocs,
  writeBatch,
  query,
  arrayUnion,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';

// Mock Firebase config
jest.mock('@/config/firebase', () => ({
  db: {},
  storage: {},
  auth: {
    currentUser: { uid: 'test-user-id' }
  }
}));

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => {
  const mockBatch = {
    update: jest.fn(),
    commit: jest.fn().mockResolvedValue(true),
  };
  
  return {
    doc: jest.fn((_, collection, id) => ({ id, collection })),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    collection: jest.fn((_, path) => path),
    writeBatch: jest.fn(() => mockBatch),
    arrayUnion: jest.fn(value => ({ __type: 'arrayUnion', value })),
    serverTimestamp: jest.fn(() => ({ __type: 'serverTimestamp' })),
  };
});

describe('studentService', () => {
  let mockBatch: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get reference to the mock batch
    mockBatch = writeBatch({} as Firestore);
    
    // Mock auth.currentUser
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: {
        uid: 'test-user-id',
      },
    });
  });

  describe('handleApplicationRejection', () => {
    const mockApplicationId = 'test-application-id';
    const mockProjectId = 'test-project-id';

    it('throws an error if user is not authenticated', async () => {
      // Mock unauthenticated user
      (getAuth as jest.Mock).mockReturnValue({
        currentUser: null,
      });

      await expect(handleApplicationRejection(mockApplicationId, mockProjectId))
        .rejects.toThrow('User not authenticated');
    });

    it('updates application status to rejected', async () => {
      // Mock getDoc for user document - no top projects
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          projectPreferences: {
            topProjects: [],
            rejectedProjects: [],
          },
        }),
      });

      // Mock empty project positions
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true, 
        data: () => ({ /* project data */ })
      });
      (getDocs as jest.Mock).mockResolvedValueOnce({
        docs: [],
        empty: true,
      });

      await handleApplicationRejection(mockApplicationId, mockProjectId);

      // Check that batch.update was called with rejection status
      expect(mockBatch.update).toHaveBeenCalledWith(
        expect.anything(),
        {
          status: 'rejected',
          updatedAt: expect.anything(),
        }
      );

      // Check that batch.commit was called
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('removes project from top choices if it was a top choice', async () => {
      // Mock getDoc for user document - with this project as top project
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          projectPreferences: {
            topProjects: [mockProjectId, 'other-project-id'],
            rejectedProjects: [],
          },
        }),
      });

      // Mock empty project positions
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true, 
        data: () => ({ /* project data */ })
      });
      (getDocs as jest.Mock).mockResolvedValueOnce({
        docs: [],
        empty: true,
      });

      await handleApplicationRejection(mockApplicationId, mockProjectId);

      // Verify topProjects was updated without the rejected project
      expect(mockBatch.update).toHaveBeenCalledWith(
        expect.anything(),
        {
          "projectPreferences.topProjects": ['other-project-id'],
          updatedAt: expect.anything(),
        }
      );

      // Check that batch.commit was called
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('adds project to rejectedProjects if not already there', async () => {
      // Mock getDoc for user document - no rejected projects
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          projectPreferences: {
            topProjects: [],
            rejectedProjects: [],
          },
        }),
      });

      // Mock empty project positions
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true, 
        data: () => ({ /* project data */ })
      });
      (getDocs as jest.Mock).mockResolvedValueOnce({
        docs: [],
        empty: true,
      });

      await handleApplicationRejection(mockApplicationId, mockProjectId);

      // Verify rejectedProjects was updated with the rejected project
      expect(mockBatch.update).toHaveBeenCalledWith(
        expect.anything(),
        {
          "projectPreferences.rejectedProjects": arrayUnion(mockProjectId),
          updatedAt: expect.anything(),
        }
      );

      // Check that batch.commit was called
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('updates subcollection applications if they exist', async () => {
      // Mock getDoc for user document
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          projectPreferences: {
            topProjects: [],
            rejectedProjects: [],
          },
        }),
      });

      // Mock project with positions
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ /* project data */ }),
      });

      // Mock positions
      (getDocs as jest.Mock).mockResolvedValueOnce({
        docs: [
          { id: 'position-1', data: () => ({ /* position data */ }) },
        ],
        empty: false,
      });

      // Mock subcollection applications query
      (getDocs as jest.Mock).mockResolvedValueOnce({
        docs: [
          { id: 'subapp-1', data: () => ({ studentId: 'test-user-id' }) },
        ],
        empty: false,
      });

      await handleApplicationRejection(mockApplicationId, mockProjectId);

      // Verify the subcollection application was updated
      expect(mockBatch.update).toHaveBeenCalledWith(
        expect.anything(),
        {
          status: 'rejected',
          updatedAt: expect.anything(),
        }
      );

      // Check that batch.commit was called
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('handles errors gracefully during subcollection updates', async () => {
      // Mock getDoc for user document
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          projectPreferences: {
            topProjects: [],
            rejectedProjects: [],
          },
        }),
      });

      // Mock error when getting project
      (getDoc as jest.Mock).mockRejectedValueOnce(new Error('Subcollection error'));

      // Mock console.warn
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await handleApplicationRejection(mockApplicationId, mockProjectId);

      // Verify we caught the error
      expect(consoleSpy).toHaveBeenCalledWith(
        "Could not update subcollection application:",
        expect.any(Error)
      );

      // Check that batch.commit was still called
      expect(mockBatch.commit).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
}); 