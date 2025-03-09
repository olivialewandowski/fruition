import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectCardProps {
  title: string;
  description: string;
  id?: string;
  status?: string;
  mentorId?: string;
  keywords?: string[];
  createdAt?: any; // Using any to accommodate different timestamp types
  department?: string;
  faculty?: string;
}

const DashboardProjectCard: React.FC<ProjectCardProps> = ({ 
  title, 
  description, 
  id, 
  status, 
  mentorId,
  keywords,
  createdAt,
  department,
  faculty
}) => {
  const router = useRouter();
  const { userData } = useAuth();
  const isOwner = userData?.uid === mentorId;
  const formattedDate = createdAt ? new Date(createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date';
  
  const handleClick = () => {
    if (id) {
      router.push(`/development/projects/${id}`);
    }
  };

  // Get a shortened version of the description for display
  const shortenedDescription = description.length > 250 
    ? `${description.substring(0, 250)}...` 
    : description;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-semibold text-gray-900 line-clamp-2 flex-1">{title}</h3>
          {status && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              status === 'active' ? 'bg-green-100 text-green-800' : 
              status === 'archived' ? 'bg-gray-100 text-gray-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )}
        </div>
        
        {(faculty || department) && (
          <div className="text-sm text-violet-600 font-medium mb-3">
            {faculty && department 
              ? `${faculty} • ${department}` 
              : faculty || department}
          </div>
        )}
        
        <div className="w-full h-px bg-gray-200 mb-4"></div>
        <p className="text-base text-gray-600 line-clamp-5 mb-4">{shortenedDescription}</p>
        
        {keywords && keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {keywords.slice(0, 5).map((keyword, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
              >
                {keyword}
              </span>
            ))}
            {keywords.length > 5 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                +{keywords.length - 5} more
              </span>
            )}
          </div>
        )}
        
        {createdAt && (
          <div className="text-xs text-gray-500">
            Created: {formattedDate}
          </div>
        )}
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
        <button 
          onClick={handleClick}
          className="text-base text-violet-700 font-medium hover:text-violet-900 transition-colors"
        >
          View Details →
        </button>
      </div>
    </div>
  );
};

export default DashboardProjectCard;