/**
 * User Related Types
 * 
 * Types for users, roles, and authentication
 */

import { User as PrismaUser, UserRole } from '@prisma/client';

// Extended User with relations
export interface UserWithRelations extends PrismaUser {
  roleDetails?: any;
  orders?: any[];
  assignedTables?: any[];
}

// User registration data
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

// User profile update data
export interface UpdateProfileData {
  name?: string;
  phone?: string;
  image?: string;
}

// Staff member data
export interface StaffMemberData {
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  roleId?: string;
  password?: string;
}

// User session data
export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  image?: string;
}
