// components/forstudents/ScrollingProjects.tsx
import React, { useRef } from 'react';
import ProjectCard from './ProjectCard';

interface Project {
  title: string;
  description: string;
  faculty?: string;
  department?: string;
  keywords?: string[];
  featured?: boolean;
}

// Project data with a mix of faculty research and student startups
const projectsData: Project[] = [
  {
    title: "AI-Driven Tumor Detection in Breast Cancer",
    description: "Develop convolutional neural networks to identify malignant patterns in mammogram images with 98%+ accuracy. We're competing with leading medical AI labs to improve early detection rates.",
    faculty: "Dr. Sarah Chen",
    department: "Biomedical Engineering",
    keywords: ["Deep Learning", "Oncology", "Medical Imaging"]
  },
  {
    title: "EcoTrack - Carbon Footprint NFT Marketplace",
    description: "Our startup is building a blockchain-based platform allowing students to trade carbon credits, with each credit verified by IoT sensors we've deployed across campus buildings.",
    faculty: "Alex Rivera",
    department: "Student Startup",
    keywords: ["Blockchain", "Climate Tech", "IoT"]
  },
  {
    title: "Noise-Resilient Quantum Error Correction",
    description: "Join our NSF-funded research developing topological quantum codes that can maintain coherence 10x longer than current methods. Prerequisites: graduate-level quantum mechanics.",
    faculty: "Dr. James Wilson",
    department: "Quantum Information Science",
    keywords: ["Quantum Computing", "Error Correction", "Topological Codes"]
  },
  {
    title: "NutriPal - Microbiome-Based Diet Recommendations",
    description: "We've developed an ML algorithm analyzing gut microbiome data to provide personalized nutrition plans. Looking for bioinformatics experts to help with our clinical trial starting next month.",
    faculty: "Maya Johnson",
    department: "Student Startup",
    keywords: ["Microbiome", "Personalized Medicine", "Clinical Trials"]
  },
  {
    title: "StudyBuddy - Neural Learning Style Matching",
    description: "Our platform uses EEG data from study sessions to analyze cognitive patterns and match compatible study partners. We've secured $1.2M in seed funding and need frontend developers.",
    faculty: "Jason Wong",
    department: "Student Startup",
    keywords: ["Neurotechnology", "EdTech", "UX Design"]
  },
  {
    title: "Perovskite-Silicon Tandem Solar Cell Optimization",
    description: "Research on novel two-terminal tandem solar cells with 29.8% efficiency, exceeding the single-junction theoretical limit. Seeking materials science students for fabrication work.",
    faculty: "Dr. Elena Martinez",
    department: "Materials Science & Engineering",
    keywords: ["Photovoltaics", "Nanotechnology", "Clean Energy"]
  },
  {
    title: "CampusRide - Autonomous Electric Shuttle Network",
    description: "Deploying a fleet of self-driving electric shuttles using our proprietary vision-based navigation system. Raised $3.5M Series A funding. Seeking robotics and computer vision engineers.",
    faculty: "Daniel Park",
    department: "Student Startup",
    keywords: ["Autonomous Vehicles", "Computer Vision", "Electric Mobility"]
  },
  {
    title: "Quantum Machine Learning for Option Pricing",
    description: "Our lab is implementing quantum neural networks that outperform classical Monte Carlo methods for derivatives pricing by 200x. Prerequisites: experience with PyQiskit and financial mathematics.",
    faculty: "Dr. Jennifer Khan",
    department: "Computational Finance",
    keywords: ["Quantum ML", "Financial Derivatives", "High-Performance Computing"]
  },
  {
    title: "MindfulU - Real-time Cognitive Behavioral Therapy",
    description: "Building the first FDA-approved digital therapeutic for anxiety that adapts interventions based on real-time biometric data. Partnered with three university counseling centers for validation.",
    faculty: "Sophia Chen",
    department: "Student Startup",
    keywords: ["Digital Therapeutics", "Clinical Psychology", "Regulatory Affairs"]
  },
  {
    title: "Haptic Teleoperation for Microrobotic Surgery",
    description: "Developing sub-millimeter surgical robots with force-feedback control systems capable of microsurgical procedures in the retina and brain. Seeking students with mechatronics background.",
    faculty: "Dr. Marcus Johnson",
    department: "Surgical Robotics Lab",
    keywords: ["Medical Robotics", "Haptics", "Microsurgery"]
  }
];

const ScrollingProjects: React.FC = () => {
  const ref = useRef(null);

  return (
    <section ref={ref} className="py-16 w-full overflow-hidden">
      <div className="container mx-auto px-4 mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center font-montserrat mb-12">
          Explore Research and Startup Projects at Your University
        </h2>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Auto-scrolling container with fixed width to prevent items from leaving */}
        <div className="relative w-full overflow-hidden py-4">
          <div 
            className="flex gap-6 animate-scroll"
            style={{
              width: "max-content"
            }}
          >
            {/* First set of projects */}
            {projectsData.map((project, index) => (
              <div key={`project-${index}`} className="w-80 flex-shrink-0">
                <ProjectCard
                  title={project.title}
                  description={project.description}
                  faculty={project.faculty}
                  department={project.department}
                  keywords={project.keywords}
                />
              </div>
            ))}
            
            {/* Duplicate set for seamless loop */}
            {projectsData.map((project, index) => (
              <div key={`project-dup-${index}`} className="w-80 flex-shrink-0">
                <ProjectCard
                  title={project.title}
                  description={project.description}
                  faculty={project.faculty}
                  department={project.department}
                  keywords={project.keywords}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            /* Move exactly one full set of items (10 projects × 320px width with 24px gap) */
            transform: translateX(calc(-344px * ${projectsData.length}));
          }
        }
        
        .animate-scroll {
          animation: scroll 120s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default ScrollingProjects;