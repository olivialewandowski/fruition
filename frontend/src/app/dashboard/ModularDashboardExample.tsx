'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UnifiedDashboardLayout, DashboardSection } from '@/components/dashboard/layout/UnifiedDashboardLayout';
import ModularDashboardLayout from '@/components/dashboard/layout/ModularDashboardLayout';
import MetricsWidget from '@/components/dashboard/widgets/metrics/MetricsWidget';
import RecommendedProjectWidget from '@/components/dashboard/widgets/recommendations/RecommendedProjectWidget';
import TopChoicesWidget from '@/components/dashboard/widgets/top-choices/TopChoicesWidget';
import ApplicationsWidget from '@/components/dashboard/widgets/applications/ApplicationsWidget';

/**
 * Example implementation of a dashboard page using the UnifiedDashboardLayout
 * This shows both the modular dashboard layout and custom layout sections
 */
const ModularDashboardExample: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.uid || '';

  return (
    <UnifiedDashboardLayout 
      userRole="student"
      initialLayoutId="studentCompact"
      className="p-5"
    >
      {/* Render the modular dashboard layout first */}
      <ModularDashboardLayout className="mb-8" />
      
      {/* Then some custom sections */}
      <DashboardSection
        title="Your Dashboard Metrics"
        description="Key performance indicators for your projects"
        columns={4}
      >
        <MetricsWidget userId={userId} />
      </DashboardSection>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardSection
          title="Recommended for You"
          description="Projects that match your skills"
        >
          <RecommendedProjectWidget withDashboardCard={false} />
        </DashboardSection>
        
        <DashboardSection
          title="Applications Timeline"
          description="Track your application progress"
          className="lg:col-span-2"
        >
          <ApplicationsWidget userId={userId} />
        </DashboardSection>
      </div>
      
      <DashboardSection
        title="Your Top Project Choices"
        action={
          <button className="px-3 py-1 text-sm bg-violet-100 text-violet-800 rounded-md hover:bg-violet-200">
            Manage Choices
          </button>
        }
      >
        <TopChoicesWidget />
      </DashboardSection>
    </UnifiedDashboardLayout>
  );
};

export default ModularDashboardExample; 