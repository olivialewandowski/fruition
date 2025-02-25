import { Project } from '@/types/project';

// Sample projects data - in the future, this would come from an API with recommendation algorithm
export const getProjects = (): Project[] => {
  return [
    {
      id: '1',
      title: 'Predicting Housing Prices Using Advanced Machine Learning Models',
      description: 'This project explores the application of machine learning techniques to predict housing prices based on features such as location, square footage, and neighborhood amenities.',
      faculty: 'Dr. Jane Smith',
      department: 'Computer Science',
      skills: ['Python', 'Machine Learning', 'Data Analysis'],
      duration: '3 months',
      commitment: '10 hours/week'
    },
    {
      id: '2',
      title: 'Modeling Climate Change Impact on Regional Crop Yields',
      description: 'This project examines how climate change variables—temperature, precipitation, and CO₂ levels—affect crop yields using time-series analysis and geospatial modeling.',
      faculty: 'Dr. Michael Kim',
      department: 'Environmental Science',
      skills: ['Python', 'TensorFlow', 'Geospatial Analysis'],
      duration: '6 months',
      commitment: '15 hours/week'
    },
    {
      id: '3',
      title: 'Optimizing Traffic Flow with Reinforcement Learning Algorithms',
      description: 'This advanced research project investigates the use of reinforcement learning to optimize traffic light timings in urban areas.',
      faculty: 'Dr. Sarah Johnson',
      department: 'Civil Engineering',
      skills: ['Reinforcement Learning', 'Python', 'Simulation'],
      duration: '4 months',
      commitment: '12 hours/week'
    },
    {
      id: '4',
      title: 'Natural Language Processing for Medical Records Analysis',
      description: 'Develop NLP techniques to extract and analyze information from medical records to improve patient outcomes and healthcare efficiency.',
      faculty: 'Dr. Robert Chen',
      department: 'Health Informatics',
      skills: ['NLP', 'Python', 'Healthcare'],
      duration: '5 months',
      commitment: '8 hours/week'
    },
    {
      id: '5',
      title: 'Quantum Computing Algorithms for Optimization Problems',
      description: 'Research and implement quantum algorithms to solve complex optimization problems that are intractable for classical computers.',
      faculty: 'Dr. Lisa Patel',
      department: 'Physics',
      skills: ['Quantum Computing', 'Algorithm Design', 'Linear Algebra'],
      duration: '6 months',
      commitment: '20 hours/week'
    }
  ];
};

// In a real application, these functions would make API calls
export const applyToProject = async (projectId: string): Promise<boolean> => {
  console.log(`Applied to project with ID: ${projectId}`);
  // Simulate API call
  return new Promise(resolve => setTimeout(() => resolve(true), 500));
};

export const saveProject = async (project: Project): Promise<boolean> => {
  console.log(`Saved project: ${project.title}`);
  // Simulate API call
  return new Promise(resolve => setTimeout(() => resolve(true), 500));
};

export const removeProject = async (projectId: string): Promise<boolean> => {
  console.log(`Removed project with ID: ${projectId}`);
  // Simulate API call
  return new Promise(resolve => setTimeout(() => resolve(true), 500));
}; 