import { Project } from '@/types/project';

interface AppliedTabProps {
  appliedProjects: Project[];
}

const AppliedTab = ({ appliedProjects }: AppliedTabProps) => {
  return (
    <div className="w-full mt-6">
      {appliedProjects.length > 0 ? (
        <div className="space-y-4">
          {appliedProjects.map((project) => (
            <div 
              key={project.id} 
              className="bg-white rounded-xl shadow-md p-4 border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-800">{project.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {project.faculty} • {project.department}
              </p>
              <div className="mt-3">
                <p className="text-sm text-gray-700 line-clamp-2">{project.description}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.skills.slice(0, 3).map((skill: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {project.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                    +{project.skills.length - 3} more
                  </span>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-violet-600">Applied</span>
                </div>
                <button className="text-sm text-violet-600 hover:text-violet-800">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No applications yet.</p>
          <p className="text-gray-500 mt-2">
            Swipe right on projects in the Discover tab to apply!
          </p>
        </div>
      )}
    </div>
  );
};

export default AppliedTab; 