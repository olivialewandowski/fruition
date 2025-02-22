'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const ProfileForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
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
    bio: ''
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
          disabled={isLoading}
          className="px-9 py-2.5 text-white bg-violet-800 rounded-[30px]"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;