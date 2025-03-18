// components/forstudents/FloatingProjects.tsx
import React, { useState, useRef, useEffect } from 'react';
import { WaitlistDialog } from '@/components/ui/WaitlistDialog';
import ProjectCard from './ProjectCard';

interface Project {
  title: string;
  description: string;
  faculty?: string;
  department?: string;
  keywords?: string[];
  featured?: boolean;
}

const projectsData: Project[] = [
  {
    title: "Quantum Computing Algorithm Development",
    description: "Research opportunity to work on quantum algorithms for optimization problems. Previous experience with linear algebra required.",
    faculty: "Dr. James Wilson",
    department: "Physics",
    keywords: ["Quantum Computing", "Algorithms", "Physics"],
    featured: true
  },
  {
    title: "Machine Learning for Medical Imaging Analysis",
    description: "Work with our lab to develop algorithms for analyzing MRI and CT scans using deep learning techniques.",
    faculty: "Dr. Sarah Chen",
    department: "Computer Science",
    keywords: ["Machine Learning", "Healthcare", "Image Processing"]
  },
  {
    title: "Sustainable Urban Planning Research",
    description: "Join our team studying climate-resilient urban infrastructure designs. Projects involve data collection, GIS mapping, and policy analysis.",
    faculty: "Prof. Michael Rodriguez",
    department: "Urban Planning",
    keywords: ["Sustainability", "Climate Change", "GIS"]
  },
  {
    title: "Behavioral Economics Study",
    description: "Assist in conducting experiments on decision-making under uncertainty. Students will help design experiments and analyze results.",
    faculty: "Dr. Lisa Thompson",
    department: "Economics",
    keywords: ["Behavioral Economics", "Psychology", "Data Analysis"]
  }
];

const FloatingProjects: React.FC = () => {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistSource, setWaitlistSource] = useState<'apply' | 'save'>('apply');
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  
  // Featured project
  const featuredProject = projectsData.find(p => p.featured);
  
  // Handle scroll events to trigger animations
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const scrollProgress = 1 - (rect.top / window.innerHeight);
        setScrollY(scrollProgress);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleApplyClick = () => {
    setWaitlistSource('apply');
    setShowWaitlist(true);
  };

  const handleSaveClick = () => {
    setWaitlistSource('save');
    setShowWaitlist(true);
  };

  return (
    <section ref={sectionRef} className="py-24 w-full relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden">
      <div className="container mx-auto px-4 z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center font-montserrat mb-16">
          Apply to Projects Seamlessly
        </h2>

        {/* Dynamic layout with featured project in center and floating projects */}
        <div className="relative grid grid-cols-1 gap-4 place-items-center min-h-[60vh]">
          {/* Left side floating project */}
          <div 
            className="md:block hidden absolute left-0 transform"
            style={{
              opacity: Math.max(0, 1 - scrollY * 0.8),
              transform: `translateY(${-scrollY * 50}px) translateX(${-scrollY * 100}px) scale(${Math.max(0.7, 1 - scrollY * 0.2)})`,
              transition: 'all 0.3s ease-out'
            }}
          >
            {projectsData[1] && (
              <div className="w-56">
                <ProjectCard
                  title={projectsData[1].title}
                  description={projectsData[1].description}
                  faculty={projectsData[1].faculty}
                  department={projectsData[1].department}
                  keywords={projectsData[1].keywords}
                />
              </div>
            )}
          </div>
          
          {/* Right side floating project */}
          <div 
            className="md:block hidden absolute right-0 transform"
            style={{
              opacity: Math.max(0, 1 - scrollY * 0.8),
              transform: `translateY(${-scrollY * 50}px) translateX(${scrollY * 100}px) scale(${Math.max(0.7, 1 - scrollY * 0.2)})`,
              transition: 'all 0.3s ease-out'
            }}
          >
            {projectsData[2] && (
              <div className="w-56">
                <ProjectCard
                  title={projectsData[2].title}
                  description={projectsData[2].description}
                  faculty={projectsData[2].faculty}
                  department={projectsData[2].department}
                  keywords={projectsData[2].keywords}
                />
              </div>
            )}
          </div>
          
          {/* Bottom floating project */}
          <div 
            className="md:block hidden absolute bottom-0 transform"
            style={{
              opacity: Math.max(0, 1 - scrollY * 0.8),
              transform: `translateY(${scrollY * 50}px) scale(${Math.max(0.7, 1 - scrollY * 0.2)})`,
              transition: 'all 0.3s ease-out'
            }}
          >
            {projectsData[3] && (
              <div className="w-56">
                <ProjectCard
                  title={projectsData[3].title}
                  description={projectsData[3].description}
                  faculty={projectsData[3].faculty}
                  department={projectsData[3].department}
                  keywords={projectsData[3].keywords}
                />
              </div>
            )}
          </div>
          
          {/* Featured project in the center */}
          <div
            className="relative z-20 max-w-sm w-full mx-auto"
            style={{
              filter: "drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))",
              transform: `scale(${1 + scrollY * 0.1})`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            {featuredProject && (
              <ProjectCard
                title={featuredProject.title}
                description={featuredProject.description}
                faculty={featuredProject.faculty}
                department={featuredProject.department}
                keywords={featuredProject.keywords}
                featured={true}
                onClick={() => {}}
              />
            )}
          </div>
        </div>
      </div>

      <WaitlistDialog 
        isOpen={showWaitlist}
        onClose={() => setShowWaitlist(false)}
        source={waitlistSource === 'apply' ? 'getStarted' : 'waitlist'}
        prefilledEmail=""
      />
    </section>
  );
};

export default FloatingProjects;