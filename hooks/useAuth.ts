/**
 * useAuth Hook
 * 
 * Hook for authentication
 * - Get current user session
 * - Check user role
 * - Authorization helpers
 */

'use client';

import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';

export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const user = session?.user;

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user?.role) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role as UserRole);
  };

  const isManager = hasRole([UserRole.MANAGER, UserRole.ADMIN]);
  const isWaiter = hasRole(UserRole.WAITER);
  const isKitchen = hasRole(UserRole.KITCHEN_STAFF);
  const isCustomer = hasRole(UserRole.CUSTOMER);
  const isAdmin = hasRole(UserRole.ADMIN);

  return {
    user,
    isAuthenticated,
    isLoading,
    hasRole,
    isManager,
    isWaiter,
    isKitchen,
    isCustomer,
    isAdmin,
  };
}
