// src/components/projects/MaterialsManager.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  getProjectMaterials, 
  uploadProjectMaterial, 
  deleteProjectMaterial 
} from '@/services/clientProjectService';

interface Material {
  id: string;
  name: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date | string | number;
}

interface MaterialsManagerProps {
  projectId: string;
}

const MaterialsManager: React.FC<MaterialsManagerProps> = ({ projectId }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [materialName, setMaterialName] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch materials
  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const materialsData = await getProjectMaterials(projectId);
        setMaterials(materialsData || []);
      } catch (err) {
        console.error('Error fetching materials:', err);
        setError('Failed to load project materials');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, [projectId]);

  // Handle material upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileInputRef.current?.files?.length) {
      setError('Please select a file to upload');
      return;
    }
    
    const file = fileInputRef.current.files[0];
    
    if (!materialName.trim()) {
      setError('Please enter a name for the material');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const newMaterial = await uploadProjectMaterial(
        projectId, 
        file, 
        materialName.trim(), 
        materialDescription.trim()
      );
      
      // Update materials list
      setMaterials([...materials, newMaterial]);
      
      // Reset form
      setMaterialName('');
      setMaterialDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setSuccessMessage('Material uploaded successfully');
      
    } catch (err) {
      console.error('Error uploading material:', err);
      setError('Failed to upload material');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle material deletion
  const handleDelete = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await deleteProjectMaterial(projectId, materialId);
      
      // Update materials list
      setMaterials(materials.filter(material => material.id !== materialId));
      
      setSuccessMessage('Material deleted successfully');
      
    } catch (err) {
      console.error('Error deleting material:', err);
      setError('Failed to delete material');
    } finally {
      setIsLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Format file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return (
        <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return (
        <svg className="w-10 h-10 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('xlsx')) {
      return (
        <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint') || fileType.includes('ppt')) {
      return (
        <svg className="w-10 h-10 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType.includes('image') || fileType.includes('jpg') || fileType.includes('png')) {
      return (
        <svg className="w-10 h-10 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Onboarding Materials</h2>
      
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200 mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {successMessage && (
        <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md border border-green-200 mb-4">
          <strong>Success:</strong> {successMessage}
        </div>
      )}
      
      {/* Upload form */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload New Material</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label htmlFor="materialName" className="block text-sm font-medium text-gray-700">
              Material Name
            </label>
            <input
              type="text"
              id="materialName"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              placeholder="e.g., Project Overview, Onboarding Checklist"
              required
            />
          </div>
          
          <div>
            <label htmlFor="materialDescription" className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              id="materialDescription"
              value={materialDescription}
              onChange={(e) => setMaterialDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              rows={3}
              placeholder="Brief description of this material and how team members should use it"
            />
          </div>
          
          <div>
            <label htmlFor="materialFile" className="block text-sm font-medium text-gray-700">
              File
            </label>
            <input
              type="file"
              id="materialFile"
              ref={fileInputRef}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100
              "
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Supported file types: PDF, Word, Excel, PowerPoint, and images. Max file size: 10MB.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload Material'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Materials list */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Materials</h3>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading materials...</p>
          </div>
        ) : materials.length > 0 ? (
          <div className="space-y-4">
            {materials.map((material) => (
              <div 
                key={material.id} 
                className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(material.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{material.name}</h4>
                      <p className="mt-1 text-sm text-gray-500">{material.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span>
                      {formatFileSize(material.fileSize)} • 
                      Uploaded by {material.uploadedBy} • 
                      {typeof material.uploadedAt === 'object' 
                        ? material.uploadedAt.toLocaleDateString() 
                        : new Date(material.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-xl text-gray-600 mb-2">No materials uploaded yet.</p>
            <p className="text-gray-500">
              Upload onboarding documents, guides, or resources for your team members.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsManager;