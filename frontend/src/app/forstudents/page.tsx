// app/forstudents/page.tsx
'use client';

import React from 'react';
import Header from '@/components/forstudents/Header';
import HeroSection from '@/components/forstudents/HeroSection';
import ScrollingProjects from '@/components/forstudents/ScrollingProjects';
import FloatingProjects from '@/components/forstudents/FloatingProjects';
import ProjectCreationSection from '@/components/forstudents/ProjectCreationSection';

// Simple dividers
const DiagonalDivider = () => (
  <div className="h-20 relative overflow-hidden">
    <div 
      className="absolute inset-0 bg-purple-800/20"
      style={{ clipPath: "polygon(0 0, 100% 100%, 100% 0)" }}
    ></div>
  </div>
);

const WaveDivider = () => (
  <div className="h-20 relative overflow-hidden">
    <div className="absolute inset-0 bg-purple-800/20"></div>
  </div>
);

const StudentLandingPage: React.FC = () => {
  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: 'radial-gradient(circle at center, #5D00AE 0%, #4A008B 30%, #37006B 60%, #260048 100%)',
        backgroundAttachment: 'fixed'
      }}
    >
      <Header />
      
      {/* Hero Section */}
      <section id="hero">
        <HeroSection />
      </section>
      
      {/* Divider */}
      <DiagonalDivider />
      
      {/* Scrolling Projects Section */}
      <section id="explore-projects">
        <ScrollingProjects />
      </section>
      
      {/* Divider */}
      <WaveDivider />
      
      {/* Apply to Projects Section */}
      <section id="apply-projects">
        <FloatingProjects />
      </section>
      
      {/* Divider */}
      <DiagonalDivider />
      
      {/* Project Creation Section */}
      <section id="create-projects">
        <ProjectCreationSection />
      </section>
      
      {/* Simple Footer */}
      <div className="py-12 text-center text-white border-t border-purple-800/30">
        <p className="text-sm">© {new Date().getFullYear()} Fruition Research. All rights reserved.</p>
      </div>
      
      {/* Back to top button (simplified) */}
      <a
        href="#hero"
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center z-50 hover:bg-gray-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </a>
    </div>
  );
};

export default StudentLandingPage;