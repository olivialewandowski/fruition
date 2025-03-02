'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import TopNavigation from '@/components/dashboard/TopNavigation';
import ProjectSection from '@/components/dashboard/ProjectSection';
import { auth } from '@/config/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useSidebarState } from '@/hooks/useSidebarState';

// Sample project data
import { yourProjects, facultyProjects, peerProjects } from '@/data/sampleProjects';

interface UserData {
  role: string;
  firstName: string;
  lastName: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const { isCollapsed } = useSidebarState();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
              await fetchUserData(user.uid);
            } else {
              router.push('/development/login');
            }
            unsubscribe();
          });
          return;
        }
        
        await fetchUserData(currentUser.uid);
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/development/login');
      }
    };
    
    const fetchUserData = async (uid: string) => {
      try {
        const db = getFirestore();
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserData(userSnap.data() as UserData);
        } else {
          console.error('No user data found');
          router.push('/development/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/development/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Layout */}
      <div className="flex h-screen pt-3">
        {/* Sidebar - added left padding */}
        <div className="h-screen pl-3">
          <Sidebar />
        </div>
        
        {/* Main Content Area */}
        <div className={`
          flex-1 transition-all duration-300 overflow-y-auto pl-6
        `}>
          {/* Content wrapper with padding for spacing from sidebar */}
          <div className="pr-4">
            <TopNavigation />
            
            <div className="pr-4 pb-8">
              {/* Page Header */}
              <div className="flex flex-wrap gap-3 md:gap-5 justify-between mb-4 md:mb-5">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">Your Projects</div>
                <div className="flex gap-2 md:gap-4">
                  <button 
                    onClick={() => router.push('/development/connect')}
                    className="px-3 md:px-6 py-2 text-sm md:text-lg text-violet-800 border-2 border-violet-800 rounded-full hover:bg-violet-100 transition-colors"
                  >
                    Connect
                  </button>
                  <button className="px-3 md:px-6 py-2 text-sm md:text-lg text-white bg-violet-800 rounded-full hover:bg-violet-700 transition-colors">
                    New Project +
                  </button>
                </div>
              </div>
              
              {/* Project Sections */}
              {userData?.role === 'student' ? (
                <>
                  <ProjectSection title="" projects={yourProjects} hideTitle={true} />
                  <ProjectSection title="Faculty Projects" projects={facultyProjects} />
                  <ProjectSection title="Peer Projects" projects={peerProjects} />
                </>
              ) : (
                <>
                  <ProjectSection title="" projects={facultyProjects} hideTitle={true} />
                  <ProjectSection title="Student Projects" projects={yourProjects} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}