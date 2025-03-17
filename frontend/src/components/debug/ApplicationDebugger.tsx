// Create this as /components/debug/ApplicationDebugger.tsx

import React, { useState, useEffect } from 'react';
import { db, auth } from '@/config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Project } from '@/types/project';
import { getAppliedProjects } from '@/services/projectsService';
import { convertConnectProjectsToProjects } from '@/utils/connect-helper';

export const ApplicationDebugger = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [userDoc, setUserDoc] = useState<any>(null);
  const [appliedProjects, setAppliedProjects] = useState<any[]>([]);
  const [serviceProjects, setServiceProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setError("No authenticated user");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 1. Get applications from Firestore
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('studentId', '==', user.uid)
        );
        
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applicationsData = applicationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApplications(applicationsData);

        // 2. Get user document
        if (user.uid) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnapshot = await getDoc(userDocRef);
          
          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            setUserDoc(userData);
            
            // 3. Get projects from user.appliedProjects
            const appliedProjectIds = userData.appliedProjects || [];
            
            const projectsData = await Promise.all(
              appliedProjectIds.map(async (projectId: string) => {
                const projectRef = doc(db, 'projects', projectId);
                const projectSnapshot = await getDoc(projectRef);
                
                if (projectSnapshot.exists()) {
                  return {
                    id: projectSnapshot.id,
                    ...projectSnapshot.data()
                  };
                }
                return null;
              })
            );
            
            setAppliedProjects(projectsData.filter(Boolean));
          }
        }

        // 4. Get applied projects from the service
        const serviceData = await getAppliedProjects();
        const convertedProjects = convertConnectProjectsToProjects(serviceData);
        setServiceProjects(convertedProjects);
        
      } catch (err) {
        console.error("Error fetching debug data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded-lg">Loading debug data...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 rounded-lg text-red-700">{error}</div>;
  }

  return (
    <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Application Debugger</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">User Info</h3>
          <div className="mb-2">
            <span className="font-medium">UID:</span> {user?.uid}
          </div>
          <div className="mb-2">
            <span className="font-medium">Email:</span> {user?.email}
          </div>
          {userDoc && (
            <div>
              <h4 className="font-medium mt-3">User Document Fields:</h4>
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(userDoc, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        {/* Applications */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Applications Collection</h3>
          <div className="mb-2">
            <span className="font-medium">Total Applications:</span> {applications.length}
          </div>
          {applications.length > 0 ? (
            <div>
              <h4 className="font-medium mt-3">Application Data:</h4>
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(applications, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-yellow-600">No applications found</div>
          )}
        </div>
        
        {/* User Applied Projects */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">{"User's"} Applied Projects</h3>
          <div className="mb-2">
            <span className="font-medium">Applied Projects in User Doc:</span> {userDoc?.appliedProjects?.length || 0}
          </div>
          {userDoc?.appliedProjects?.length > 0 ? (
            <div>
              <h4 className="font-medium mt-3">Applied Project IDs:</h4>
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(userDoc.appliedProjects, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-yellow-600">No applied projects in user document</div>
          )}
          
          <div className="mt-4">
            <span className="font-medium">Found Applied Projects:</span> {appliedProjects.length}
          </div>
          {appliedProjects.length > 0 ? (
            <div>
              <h4 className="font-medium mt-3">Project Details:</h4>
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(appliedProjects.map(p => ({ id: p.id, title: p.title })), null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-yellow-600">No applied project details found</div>
          )}
        </div>
        
        {/* Service Projects */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Service Applied Projects</h3>
          <div className="mb-2">
            <span className="font-medium">Projects from Service:</span> {serviceProjects.length}
          </div>
          {serviceProjects.length > 0 ? (
            <div>
              <h4 className="font-medium mt-3">Project Details:</h4>
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(serviceProjects.map(p => ({ id: p.id, title: p.title })), null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-yellow-600">No projects returned from service</div>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex justify-center">
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default ApplicationDebugger;