/**
 * Protected Route Component
 * 
 * Client-side route protection
 * - Check authentication
 * - Check user role
 * - Redirect if unauthorized
 * - Show loading state
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@prisma/client';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requireAuth = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Check if authentication is required
    if (requireAuth && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check role-based access
    if (allowedRoles && user && !hasRole(allowedRoles)) {
      // Redirect to appropriate dashboard based on user's role
      const redirectMap: Record<string, string> = {
        [UserRole.ADMIN]: '/manager/dashboard',
        [UserRole.SUPER_ADMIN]: '/admin/dashboard',
        [UserRole.MANAGER]: '/manager/dashboard',
        [UserRole.KITCHEN_STAFF]: '/kitchen/orders',
        [UserRole.WAITER]: '/waiter/dashboard',
        [UserRole.CASHIER]: '/cashier/dashboard',
        [UserRole.CUSTOMER]: '/customer/menu',
        [UserRole.CLEANER]: '/cleaner/dashboard',
      };

      router.push(redirectMap[user.role] || '/');
    }
  }, [isLoading, isAuthenticated, user, requireAuth, allowedRoles, hasRole, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show nothing while redirecting
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Show nothing if role check fails
  if (allowedRoles && user && !hasRole(allowedRoles)) {
    return null;
  }

  // Render children if authorized
  return <>{children}</>;
}
