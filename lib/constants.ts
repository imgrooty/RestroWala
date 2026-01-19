/**
 * Application Constants
 * 
 * Centralized constants used throughout the application
 */

import { OrderStatus, TableStatus, PaymentStatus, ReservationStatus } from '@prisma/client';

// Order status labels and colors
export const ORDER_STATUS_CONFIG = {
  [OrderStatus.PENDING]: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏳',
  },
  [OrderStatus.CONFIRMED]: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800',
    icon: '✓',
  },
  [OrderStatus.PREPARING]: {
    label: 'Preparing',
    color: 'bg-purple-100 text-purple-800',
    icon: '👨‍🍳',
  },
  [OrderStatus.READY]: {
    label: 'Ready',
    color: 'bg-green-100 text-green-800',
    icon: '🔔',
  },
  [OrderStatus.SERVED]: {
    label: 'Served',
    color: 'bg-teal-100 text-teal-800',
    icon: '🍽️',
  },
  [OrderStatus.COMPLETED]: {
    label: 'Completed',
    color: 'bg-gray-100 text-gray-800',
    icon: '✓',
  },
  [OrderStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: '✕',
  },
};

// Table status labels and colors
export const TABLE_STATUS_CONFIG = {
  [TableStatus.AVAILABLE]: {
    label: 'Available',
    color: 'bg-green-100 text-green-800',
  },
  [TableStatus.OCCUPIED]: {
    label: 'Occupied',
    color: 'bg-red-100 text-red-800',
  },
  [TableStatus.RESERVED]: {
    label: 'Reserved',
    color: 'bg-blue-100 text-blue-800',
  },
  [TableStatus.CLEANING]: {
    label: 'Cleaning',
    color: 'bg-yellow-100 text-yellow-800',
  },
  [TableStatus.MAINTENANCE]: {
    label: 'Maintenance',
    color: 'bg-gray-100 text-gray-800',
  },
};

// Payment status labels and colors
export const PAYMENT_STATUS_CONFIG = {
  [PaymentStatus.PENDING]: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
  },
  [PaymentStatus.PROCESSING]: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800',
  },
  [PaymentStatus.COMPLETED]: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
  },
  [PaymentStatus.FAILED]: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800',
  },
  [PaymentStatus.REFUNDED]: {
    label: 'Refunded',
    color: 'bg-gray-100 text-gray-800',
  },
};

// Reservation status labels and colors
export const RESERVATION_STATUS_CONFIG = {
  [ReservationStatus.PENDING]: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
  },
  [ReservationStatus.CONFIRMED]: {
    label: 'Confirmed',
    color: 'bg-green-100 text-green-800',
  },
  [ReservationStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
  },
  [ReservationStatus.COMPLETED]: {
    label: 'Completed',
    color: 'bg-gray-100 text-gray-800',
  },
  [ReservationStatus.NO_SHOW]: {
    label: 'No Show',
    color: 'bg-orange-100 text-orange-800',
  },
};

// Dietary icons
export const DIETARY_ICONS = {
  vegetarian: '🌱',
  vegan: '🥬',
  glutenFree: '🌾',
};

// Default pagination
export const DEFAULT_PAGE_SIZE = 20;

// File upload limits
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_MODEL_SIZE = 50 * 1024 * 1024; // 50MB

// Supported file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_MODEL_TYPES = ['model/gltf-binary', 'model/gltf+json'];
