/**
 * User Menu Component
 * 
 * User dropdown menu with profile and sign out
 * - Display user info
 * - Role badge
 * - Profile link
 * - Sign out button
 */

'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRole } from '@prisma/client';

const roleLabels: Record<string, string> = {
  [UserRole.ADMIN]: 'Admin',
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.MANAGER]: 'Manager',
  [UserRole.KITCHEN_STAFF]: 'Kitchen Staff',
  [UserRole.WAITER]: 'Waiter',
  [UserRole.CASHIER]: 'Cashier',
  [UserRole.CUSTOMER]: 'Customer',
  [UserRole.CLEANER]: 'Cleaner',
};

const roleColors: Record<string, string> = {
  [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
  [UserRole.SUPER_ADMIN]: 'bg-indigo-100 text-indigo-800',
  [UserRole.MANAGER]: 'bg-blue-100 text-blue-800',
  [UserRole.KITCHEN_STAFF]: 'bg-orange-100 text-orange-800',
  [UserRole.WAITER]: 'bg-green-100 text-green-800',
  [UserRole.CASHIER]: 'bg-teal-100 text-teal-800',
  [UserRole.CUSTOMER]: 'bg-gray-100 text-gray-800',
  [UserRole.CLEANER]: 'bg-yellow-100 text-yellow-800',
};

export default function UserMenu() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Get user initials for avatar
  const initials = user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user.email?.charAt(0).toUpperCase() || '?';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full"
        >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white font-semibold">
              {initials}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <span
              className={`mt-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${roleColors[user.role]
                }`}
            >
              {roleLabels[user.role]}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/customer/profile">Profile Settings</Link>
        </DropdownMenuItem>
        {(user.role === UserRole.MANAGER || user.role === UserRole.ADMIN) && (
          <DropdownMenuItem asChild>
            <Link href="/manager/dashboard">Manager Dashboard</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
