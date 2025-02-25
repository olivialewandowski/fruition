'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: 'student' | 'faculty' | 'admin';
}

export function AuthGuard({ children, requireRole }: AuthGuardProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    router.push('/development/login');
    return null;
  }

  if (requireRole && userData?.role !== requireRole) {
    router.push('/development/unauthorized');
    return null;
  }

  return <>{children}</>;
} 