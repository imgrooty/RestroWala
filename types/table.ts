/**
 * Table Related Types
 * 
 * Types for restaurant tables and related data
 */

import { Table as PrismaTable, TableStatus } from '@prisma/client';

// Extended Table with relations
export interface TableWithRelations extends PrismaTable {
  waiter?: any;
  orders?: any[];
  reservations?: any[];
}

// Create/Update table data
export interface TableFormData {
  number: number;
  capacity: number;
  floor?: string;
  location?: string;
  status: TableStatus;
  waiterId?: string;
}

// Table with current order info
export interface TableWithCurrentOrder extends PrismaTable {
  currentOrder?: any;
  waiter?: any;
}

// Table status update
export interface UpdateTableStatusData {
  status: TableStatus;
  waiterId?: string;
}
