'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '@/config/firebase';

const ProfileForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    institution: '',
    role: '',
    // Role-specific fields
    department: '',
    researchInterests: '',
    major: '',
    graduationYear: '',
    bio: '',
    resumeURL: '',
    resumeName: ''
  });

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
          setFormData(prevData => ({
            ...prevData,
            ...docSnap.data()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!auth.currentUser) throw new Error('No authenticated user');

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        ...formData,
        updatedAt: new Date().toISOString()
      });

      router.push('/development/dashboard');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col px-3 py-4 mt-5 ml-3.5 max-w-full text-black rounded-3xl border border-solid bg-zinc-100 border-zinc-300 shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
        Loading...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-6 py-4 mt-5 ml-3.5 max-w-full text-black">
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            className="px-4 py-2 rounded-3xl border border-solid border-zinc-300 bg-zinc-100"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            className="px-4 py-2 rounded-3xl border border-solid border-zinc-300 bg-zinc-100"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Institution</label>
        <input
          type="text"
          value={formData.institution}
          onChange={(e) => setFormData({...formData, institution: e.target.value})}
          className="px-4 py-2 rounded-3xl border border-solid border-zinc-300 bg-zinc-100"
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
              className="px-4 py-2 rounded-3xl border border-solid border-zinc-300 bg-zinc-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Research Interests</label>
            <textarea
              value={formData.researchInterests}
              onChange={(e) => setFormData({...formData, researchInterests: e.target.value})}
              className="px-4 py-2 rounded-3xl border border-solid border-zinc-300 bg-zinc-100"
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
              className="px-4 py-2 rounded-3xl border border-solid border-zinc-300 bg-zinc-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Graduation Year</label>
            <input
              type="text"
              value={formData.graduationYear}
              onChange={(e) => setFormData({...formData, graduationYear: e.target.value})}
              className="px-4 py-2 rounded-3xl border border-solid border-zinc-300 bg-zinc-100"
            />
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          className="px-4 py-2 rounded-3xl border border-solid border-zinc-300 bg-zinc-100"
          rows={4}
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
          <div className="flex items-center gap-3">
            {formData.resumeURL ? (
              <>
                <a 
                  href={formData.resumeURL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-violet-800 bg-zinc-100 rounded-[30px] border border-solid border-zinc-300"
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
                  className="px-3 py-2 text-red-600 bg-zinc-100 rounded-[30px] border border-solid border-zinc-300"
                >
                  Delete
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingResume}
                className="px-4 py-2 text-violet-800 bg-zinc-100 rounded-[30px] border border-solid border-zinc-300"
              >
                {uploadingResume ? 'Uploading...' : 'Upload Resume'}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX</p>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm mt-2">{error}</div>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-9 py-2.5 text-black bg-zinc-100 rounded-[30px] border border-solid border-zinc-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || uploadingResume}
          className="px-9 py-2.5 text-white bg-violet-800 rounded-[30px]"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;