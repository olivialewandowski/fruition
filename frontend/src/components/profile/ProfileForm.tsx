'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '@/config/firebase';

interface ProfileFormProps {
  onProfileUpdated?: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onProfileUpdated }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    university: '',
    role: '',
    // Role-specific fields
    department: '',
    researchInterests: '',
    title: '',
    major: '',
    graduationYear: '',
    bio: '',
    skills: [] as string[],
    interests: [] as string[],
    resumeURL: '',
    resumeName: ''
  });

  // For skills and interests
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) {
        router.push('/development/login');
        return;
      }

      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData(prevData => ({
            ...prevData,
            ...data,
            // Ensure arrays are initialized
            skills: data.skills || [],
            interests: data.interests || []
          }));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    // Check if user is authenticated
    if (!auth.currentUser) {
      setError('You must be logged in to upload a resume. Please log in and try again.');
      return;
    }

    const file = e.target.files[0];
    setUploadingResume(true);
    setError('');

    try {
      // Delete previous resume if exists
      if (formData.resumeURL) {
        try {
          const oldResumeRef = ref(storage, `resumes/${auth.currentUser.uid}/${formData.resumeName}`);
          await deleteObject(oldResumeRef);
        } catch (err) {
          console.error('Error deleting old resume:', err);
          // Continue with upload even if delete fails
        }
      }

      // Upload new resume
      const resumeRef = ref(storage, `resumes/${auth.currentUser.uid}/${file.name}`);
      await uploadBytes(resumeRef, file);
      const downloadURL = await getDownloadURL(resumeRef);

      // Update form data
      const updatedFormData = {
        ...formData,
        resumeURL: downloadURL,
        resumeName: file.name
      };
      setFormData(updatedFormData);

      // Update Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        resumeURL: downloadURL,
        resumeName: file.name,
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Error uploading resume:', err);
      // Provide more specific error messages based on the error type
      if (err.code === 'storage/unauthorized') {
        setError('Permission denied: You do not have permission to upload files.');
      } else if (err.code === 'storage/canceled') {
        setError('Upload cancelled: The resume upload was cancelled.');
      } else if (err.code === 'storage/unknown') {
        setError('Unknown error: An unknown error occurred during upload.');
      } else if (err.code?.includes('auth/')) {
        setError('Authentication error: Please log out and log back in to try again.');
      } else {
        setError(`Failed to upload resume: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!auth.currentUser) {
      setError('You must be logged in to delete a resume. Please log in and try again.');
      return;
    }
    
    if (!formData.resumeURL) {
      setError('No resume found to delete.');
      return;
    }

    setUploadingResume(true);
    setError('');

    try {
      // Delete from storage
      const resumeRef = ref(storage, `resumes/${auth.currentUser.uid}/${formData.resumeName}`);
      await deleteObject(resumeRef);

      // Update form data
      const updatedFormData = {
        ...formData,
        resumeURL: '',
        resumeName: ''
      };
      setFormData(updatedFormData);

      // Update Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        resumeURL: '',
        resumeName: '',
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Error deleting resume:', err);
      // Provide more specific error messages based on the error type
      if (err.code === 'storage/object-not-found') {
        // If file not found, still update the database to remove the reference
        try {
          const updatedFormData = {
            ...formData,
            resumeURL: '',
            resumeName: ''
          };
          setFormData(updatedFormData);
          
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            resumeURL: '',
            resumeName: '',
            updatedAt: new Date().toISOString()
          });
          // Don't set error since we've cleaned up the database
        } catch (dbErr) {
          console.error('Error updating database after file not found:', dbErr);
          setError('Resume reference removed but database update failed.');
        }
      } else if (err.code === 'storage/unauthorized') {
        setError('Permission denied: You do not have permission to delete this file.');
      } else if (err.code?.includes('auth/')) {
        setError('Authentication error: Please log out and log back in to try again.');
      } else {
        setError(`Failed to delete resume: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setUploadingResume(false);
    }
  };

  // Add a skill
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    if (!formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
    }
    setNewSkill('');
  };

  // Remove a skill
  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  // Add an interest
  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    
    if (!formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()]
      });
    }
    setNewInterest('');
  };

  // Remove an interest
  const handleRemoveInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!auth.currentUser) throw new Error('No authenticated user');

      // Create an update object
      const updateObj = {
        ...formData,
        updatedAt: new Date().toISOString(),
        profileCompleted: true // Mark profile as completed
      };

      // Update user profile in Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), updateObj);
      
      // Call the callback if provided
      if (onProfileUpdated) {
        onProfileUpdated();
      } else {
        // Navigate to dashboard
        router.push('/development/dashboard');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            className="px-4 py-2.5 rounded-lg border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            className="px-4 py-2.5 rounded-lg border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">University</label>
        <input
          type="text"
          value={formData.university}
          onChange={(e) => setFormData({...formData, university: e.target.value})}
          className="px-4 py-2.5 rounded-lg border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
        />
      </div>

      {formData.role === 'faculty' && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              className="px-4 py-2.5 rounded-lg border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="px-4 py-2.5 rounded-lg border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
              placeholder="e.g., Professor, Associate Professor, Researcher"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Research Interests</label>
            <textarea
              value={formData.researchInterests}
              onChange={(e) => setFormData({...formData, researchInterests: e.target.value})}
              className="px-4 py-2.5 rounded-lg border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
              rows={3}
            />
          </div>
        </>
      )}

      {formData.role === 'student' && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Major</label>
            <input
              type="text"
              value={formData.major}
              onChange={(e) => setFormData({...formData, major: e.target.value})}
              className="px-4 py-2.5 rounded-lg border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Graduation Year</label>
            <input
              type="text"
              value={formData.graduationYear}
              onChange={(e) => setFormData({...formData, graduationYear: e.target.value})}
              className="px-4 py-2.5 rounded-lg border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
            />
          </div>
          
          {/* Skills section */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-grow px-4 py-2.5 rounded-l-lg border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
                placeholder="Add skills (e.g. Python, Data Analysis)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2.5 rounded-r-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center bg-violet-50 px-3 py-1.5 rounded-full">
                  <span className="text-violet-800">{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 text-violet-500 hover:text-violet-700 focus:outline-none"
                  >
                    &times;
                  </button>
                </div>
              ))}
              {formData.skills.length === 0 && (
                <span className="text-gray-500 text-sm italic">No skills added yet</span>
              )}
            </div>
          </div>
          
          {/* Interests section */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Interests</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="flex-grow px-4 py-2.5 rounded-l-lg border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
                placeholder="Add research interests"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-4 py-2.5 rounded-r-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.interests.map((interest, index) => (
                <div key={index} className="flex items-center bg-violet-50 px-3 py-1.5 rounded-full">
                  <span className="text-violet-800">{interest}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="ml-2 text-violet-500 hover:text-violet-700 focus:outline-none"
                  >
                    &times;
                  </button>
                </div>
              ))}
              {formData.interests.length === 0 && (
                <span className="text-gray-500 text-sm italic">No interests added yet</span>
              )}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          className="px-4 py-2.5 rounded-lg border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
          rows={4}
          placeholder="Tell us about yourself..."
        />
      </div>

      {/* Resume Upload Section */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Resume</label>
        <div className="flex flex-col gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleResumeUpload}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />
          <div className="flex items-center gap-3 flex-wrap">
            {formData.resumeURL ? (
              <>
                <a 
                  href={formData.resumeURL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {formData.resumeName}
                </a>
                <button
                  type="button"
                  onClick={handleDeleteResume}
                  disabled={uploadingResume}
                  className="px-4 py-2.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingResume}
                className="px-4 py-2.5 text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
              >
                {uploadingResume ? 'Uploading...' : 'Upload Resume'}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX</p>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm mt-2 p-3 bg-red-50 rounded-lg">{error}</div>
      )}

      <div className="flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={() => onProfileUpdated ? onProfileUpdated() : router.back()}
          className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg border border-gray-300 hover:bg-gray-200 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || uploadingResume}
          className="px-6 py-2.5 text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-all"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;