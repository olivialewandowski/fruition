'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionId, PERMISSIONS } from '@/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  permission: PermissionId;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Component that conditionally renders content based on user permissions
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  permission, 
  fallback,
  redirectTo
}) => {
  const { hasPermission, loading } = useAuth();
  const router = useRouter();
  
  // While loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If user has permission, render children
  if (hasPermission(permission)) {
    return <>{children}</>;
  }
  
  // If redirectTo is provided, redirect to that path
  if (redirectTo) {
    router.push(redirectTo);
    return null;
  }
  
  // If fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Default unauthorized message
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
      <p className="text-gray-700 mb-6">
        You don&apos;t have permission to access this feature.
      </p>
      <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Go Back
      </button>
    </div>
  );
};

export default PermissionGuard;

/**
 * Component that conditionally renders content based on feature access
 */
interface FeatureGuardProps {
  children: ReactNode;
  featureId: string;
  fallback?: ReactNode;
  redirectTo?: string;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  children,
  featureId,
  fallback,
  redirectTo
}) => {
  const { hasFeature, loading } = useAuth();
  const router = useRouter();
  
  // While loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If user has access to the feature, render children
  if (hasFeature(featureId)) {
    return <>{children}</>;
  }
  
  // If redirectTo is provided, redirect to that path
  if (redirectTo) {
    router.push(redirectTo);
    return null;
  }
  
  // If fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Default unauthorized message
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Feature Not Available</h2>
      <p className="text-gray-700 mb-6">
        You don&apos;t have access to this feature.
      </p>
      <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Go Back
      </button>
    </div>
  );
};

/**
 * Component that conditionally renders content based on user role
 */
interface RoleGuardProps {
  children: ReactNode;
  roles: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  fallback,
  redirectTo
}) => {
  const { userData, loading } = useAuth();
  const router = useRouter();
  
  // While loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If user has required role, render children
  if (userData?.role && roles.includes(userData.role)) {
    return <>{children}</>;
  }
  
  // If redirectTo is provided, redirect to that path
  if (redirectTo) {
    router.push(redirectTo);
    return null;
  }
  
  // If fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Default unauthorized message
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
      <p className="text-gray-700 mb-6">
        This content is only available to {roles.join(" or ")} users.
      </p>
      <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Go Back
      </button>
    </div>
  );
};