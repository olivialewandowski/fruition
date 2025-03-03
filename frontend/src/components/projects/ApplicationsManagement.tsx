import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PermissionGuard from '@/components/guards/PermissionGuard';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult, 
  DroppableProvided, 
  DraggableProvided 
} from 'react-beautiful-dnd';
import axios from 'axios';
import { PROJECT_PERMISSIONS } from '@/permissions';

interface Application {
  id: string;
  studentId: string;
  studentName: string;
  status: 'incoming' | 'pending' | 'interviewing' | 'accepted' | 'rejected';
  submittedAt: string;
  updatedAt: string;
  interestStatement: string;
  resumeFile?: {
    storagePath: string;
    fileName: string;
    fileType: string;
    uploadedAt: string;
  };
  studentInfo: {
    year: string;
    major: string;
    minor?: string;
    skills: string[];
    interests: string[];
  };
  notes?: string;
  interviewDate?: string;
}

// Define type for the applications state
type ApplicationsByStatus = {
  incoming: Application[];
  pending: Application[];
  interviewing: Application[];
  accepted: Application[];
  rejected: Application[];
};

// Define valid status types
type ApplicationStatus = 'incoming' | 'pending' | 'interviewing' | 'accepted' | 'rejected';

interface ApplicationsManagementProps {
  projectId: string;
}

const ApplicationsManagement: React.FC<ApplicationsManagementProps> = ({ projectId }) => {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const [applications, setApplications] = useState<ApplicationsByStatus>({
    incoming: [],
    pending: [],
    interviewing: [],
    accepted: [],
    rejected: []
  });
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterMajor, setFilterMajor] = useState<string>('');
  const [filterSkill, setFilterSkill] = useState<string>('');

  // fetch applications on component mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/projects/${projectId}/applications`);
        const fetchedApplications = response.data.data;
        
        // organize applications by status
        const sorted: ApplicationsByStatus = {
          incoming: [],
          pending: [],
          interviewing: [],
          accepted: [],
          rejected: []
        };
        
        fetchedApplications.forEach((app: Application) => {
          if (app.status in sorted) {
            sorted[app.status].push(app);
          }
        });
        
        setApplications(sorted);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [projectId]);

  // handle drag and drop
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // if dropped outside a droppable area
    if (!destination) return;
    
    // if dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // ensure valid source and destination IDs
    if (
      !['incoming', 'pending', 'interviewing', 'accepted', 'rejected'].includes(source.droppableId) ||
      !['incoming', 'pending', 'interviewing', 'accepted', 'rejected'].includes(destination.droppableId)
    ) {
      return;
    }
    
    const sourceStatus = source.droppableId as ApplicationStatus;
    const destinationStatus = destination.droppableId as ApplicationStatus;
    
    // find the application
    const application = applications[sourceStatus].find(
      app => app.id === draggableId
    );
    
    if (!application) return;
    
    // create updated application lists
    const newApplications = { ...applications };
    
    // remove from source list
    newApplications[sourceStatus] = newApplications[sourceStatus].filter(
      app => app.id !== draggableId
    );
    
    // add to destination list
    const updatedApplication = { 
      ...application, 
      status: destinationStatus
    };
    
    newApplications[destinationStatus] = [
      ...newApplications[destinationStatus].slice(0, destination.index),
      updatedApplication,
      ...newApplications[destinationStatus].slice(destination.index)
    ];
    
    // update state optimistically
    setApplications(newApplications);
    
    // update in the backend
    try {
      await axios.put(`/api/projects/${projectId}/applications/${application.id}`, {
        status: destinationStatus,
        notes: application.notes
      });
    } catch (err) {
      console.error('Error updating application status:', err);
      // revert the state if the update fails
      setApplications(applications);
      setError('Failed to update application status. Please try again.');
    }
  };

  // handle application selection
  const handleSelectApplication = (application: Application) => {
    setSelectedApplication(application);
    setNotes(application.notes || '');
  };

  // handle notes update
  const handleUpdateNotes = async () => {
    if (!selectedApplication) return;
    
    try {
      await axios.put(`/api/projects/${projectId}/applications/${selectedApplication.id}`, {
        status: selectedApplication.status,
        notes
      });
      
      // update application in state
      const newApplications = { ...applications };
      const index = newApplications[selectedApplication.status].findIndex(
        app => app.id === selectedApplication.id
      );
      
      if (index !== -1) {
        newApplications[selectedApplication.status][index] = {
          ...newApplications[selectedApplication.status][index],
          notes
        };
      }
      
      setApplications(newApplications);
      setSelectedApplication({
        ...selectedApplication,
        notes
      });
      
    } catch (err) {
      console.error('Error updating notes:', err);
      setError('Failed to update notes. Please try again.');
    }
  };

  // filter applications based on selected filters
  const getFilteredApplications = (status: ApplicationStatus) => {
    return applications[status].filter(app => {
      // year filter
      if (filterYear && app.studentInfo.year !== filterYear) {
        return false;
      }
      
      // major filter
      if (filterMajor && app.studentInfo.major.toLowerCase() !== filterMajor.toLowerCase()) {
        return false;
      }
      
      // skills filter
      if (filterSkill && !app.studentInfo.skills.some(
        skill => skill.toLowerCase().includes(filterSkill.toLowerCase())
      )) {
        return false;
      }
      
      return true;
    });
  };

  // export applications to CSV
  const exportToCSV = () => {
    // flatten all applications
    const allApplications = [
      ...applications.incoming,
      ...applications.pending,
      ...applications.interviewing,
      ...applications.accepted,
      ...applications.rejected
    ];
    
    // create CSV headers
    const headers = [
      'Student Name',
      'Status',
      'Year',
      'Major',
      'Skills',
      'Interests',
      'Submitted At',
      'Notes'
    ].join(',');
    
    // create CSV rows
    const rows = allApplications.map(app => {
      return [
        `"${app.studentName}"`,
        app.status,
        app.studentInfo.year,
        `"${app.studentInfo.major}"`,
        `"${app.studentInfo.skills.join('; ')}"`,
        `"${app.studentInfo.interests.join('; ')}"`,
        new Date(app.submittedAt).toLocaleDateString(),
        `"${app.notes || ''}"`
      ].join(',');
    });
    
    // combine headers and rows
    const csv = [headers, ...rows].join('\n');
    
    // create and download the CSV file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `project-${projectId}-applications.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // get available years and majors for filtering
  const getFilterOptions = () => {
    const allApplications = [
      ...applications.incoming,
      ...applications.pending,
      ...applications.interviewing,
      ...applications.accepted,
      ...applications.rejected
    ];
    
    const years = [...new Set(allApplications.map(app => app.studentInfo.year))];
    const majors = [...new Set(allApplications.map(app => app.studentInfo.major))];
    const skills = [...new Set(allApplications.flatMap(app => app.studentInfo.skills))];
    
    return { years, majors, skills };
  };
  
  const { years, majors, skills } = getFilterOptions();

  // check if user has permission to manage applications
  if (!hasPermission(PROJECT_PERMISSIONS.MANAGE_APPLICATIONS)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-700 mb-6">
          You don&apos;t have permission to manage applications.
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // show loading state
  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-lg text-gray-600">Loading applications...</p>
      </div>
    );
  }

  // show error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 mr-4"
        >
          Go Back
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statusColumns: ApplicationStatus[] = ['incoming', 'pending', 'interviewing', 'accepted', 'rejected'];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Application Management</h1>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
        >
          Export to CSV
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-gray-100 p-4 rounded-md mb-6">
        <h2 className="text-lg font-semibold mb-3">Filters</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Major
            </label>
            <select
              value={filterMajor}
              onChange={(e) => setFilterMajor(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">All Majors</option>
              {majors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill
            </label>
            <select
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">All Skills</option>
              {skills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterYear('');
                setFilterMajor('');
                setFilterSkill('');
              }}
              className="p-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-6">
        {/* Drag and drop application columns */}
        <div className="flex-1 min-w-0">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-5 gap-4">
              {statusColumns.map((status) => (
                <div key={status} className="bg-gray-100 rounded p-4">
                  <h2 className="text-lg font-semibold capitalize mb-3">
                    {status} ({getFilteredApplications(status).length})
                  </h2>
                  <Droppable droppableId={status}>
                    {(provided: DroppableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="min-h-[400px]"
                      >
                        {getFilteredApplications(status).map((application, index) => (
                          <Draggable
                            key={application.id}
                            draggableId={application.id}
                            index={index}
                          >
                            {(provided: DraggableProvided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white p-3 rounded shadow mb-3 cursor-pointer ${
                                  selectedApplication?.id === application.id ? 'border-2 border-violet-600' : ''
                                }`}
                                onClick={() => handleSelectApplication(application)}
                              >
                                <div className="font-medium">{application.studentName}</div>
                                <div className="text-sm text-gray-600">
                                  {application.studentInfo.year} • {application.studentInfo.major}
                                </div>
                                <div className="mt-2 text-sm">
                                  {application.interestStatement.length > 100
                                    ? `${application.interestStatement.slice(0, 100)}...`
                                    : application.interestStatement}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
        
        {/* Application details panel */}
        <div className="w-1/3 min-w-[300px]">
          {selectedApplication ? (
            <div className="bg-white rounded shadow p-4">
              <h2 className="text-xl font-bold mb-2">{selectedApplication.studentName}</h2>
              <div className="text-sm text-gray-600 mb-4">
                {selectedApplication.studentInfo.year} • {selectedApplication.studentInfo.major}
                {selectedApplication.studentInfo.minor && ` • Minor: ${selectedApplication.studentInfo.minor}`}
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-1">Interest Statement</h3>
                <p className="text-sm">{selectedApplication.interestStatement}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-1">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.studentInfo.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-gray-200 px-2 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-1">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.studentInfo.interests.map((interest) => (
                    <span
                      key={interest}
                      className="text-xs bg-gray-200 px-2 py-1 rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              
              {selectedApplication.resumeFile && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-1">Resume</h3>
                  <a
                    href={`/api/files/${selectedApplication.resumeFile.storagePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-violet-600 hover:underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {selectedApplication.resumeFile.fileName}
                  </a>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="font-semibold mb-1">Notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={4}
                />
                <button
                  onClick={handleUpdateNotes}
                  className="mt-2 px-3 py-1 bg-violet-600 text-white rounded hover:bg-violet-700"
                >
                  Save Notes
                </button>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                Submitted: {new Date(selectedApplication.submittedAt).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded p-4 text-center">
              <p className="text-gray-600">Select an application to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsManagement;