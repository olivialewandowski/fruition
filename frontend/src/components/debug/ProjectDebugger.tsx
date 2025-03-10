// Create this component in src/components/debug/ProjectDebugger.tsx

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

const ProjectDebugger: React.FC = () => {
  const { user } = useAuth();
  const [directProjects, setDirectProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDirectProjects = async () => {
      if (!user) return;
      
      try {
        // Query projects directly where user is mentorId
        const projectsQuery = query(
          collection(db, 'projects'),
          where('mentorId', '==', user.uid)
        );
        
        const snapshot = await getDocs(projectsQuery);
        const projects = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toLocaleString() || 'Unknown' 
        }));
        
        setDirectProjects(projects);
      } catch (error) {
        console.error('Error in debug fetching:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDirectProjects();
  }, [user]);

  if (!user) return null;

  return (
    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Project Debugger</h3>
      
      {loading ? (
        <p>Loading direct projects...</p>
      ) : (
        <>
          <p className="mb-2">Found {directProjects.length} projects with your mentorId</p>
          
          {directProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse table-auto text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">ID</th>
                    <th className="border p-2 text-left">Title</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-left">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {directProjects.map(project => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="border p-2">{project.id}</td>
                      <td className="border p-2">{project.title}</td>
                      <td className="border p-2">{project.status}</td>
                      <td className="border p-2">{project.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-orange-600">No direct projects found! Check your Firestore database.</p>
          )}
        </>
      )}
      
      <button 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
        onClick={() => window.location.reload()}
      >
        Force Page Reload
      </button>
    </div>
  );
};

export default ProjectDebugger;