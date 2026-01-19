/**
 * Reservation Related Types
 * 
 * Types for table reservations and related data
 */

import { Reservation as PrismaReservation, ReservationStatus } from '@prisma/client';

// Extended Reservation with relations
export interface ReservationWithRelations extends PrismaReservation {
  table?: any;
  user?: any;
}

// Create reservation data
export interface CreateReservationData {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  numberOfGuests: number;
  reservationDate: Date;
  reservationTime: string;
  duration?: number;
  specialRequests?: string;
  tableId?: string;
}

// Update reservation data
export interface UpdateReservationData {
  status?: ReservationStatus;
  tableId?: string;
  reservationDate?: Date;
  reservationTime?: string;
  numberOfGuests?: number;
  specialRequests?: string;
}

// Reservation filters
export interface ReservationFilters {
  status?: ReservationStatus;
  date?: Date;
  tableId?: string;
}

// Available time slots
export interface TimeSlot {
  time: string;
  available: boolean;
  availableTables: number;
}
