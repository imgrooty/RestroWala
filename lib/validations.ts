/**
 * Validation Schemas
 * 
 * Zod schemas for form validation
 * - Reusable validation schemas
 * - Type-safe validation
 */

import { z } from 'zod';
import { OrderStatus, PaymentMethod, UserRole, TableStatus, ReservationStatus, InventoryUnit } from '@prisma/client';

// Menu Item validation
export const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  discountPrice: z.number().min(0).optional(),
  image: z.string().url().optional(),
  model3dUrl: z.string().url().optional(),
  model3dFormat: z.string().optional(),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  spiceLevel: z.number().min(0).max(5).optional(),
  calories: z.number().min(0).optional(),
  preparationTime: z.number().min(0).optional(),
  categoryId: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
});

// Order validation
export const createOrderSchema = z.object({
  tableId: z.string().min(1, 'Table is required'),
  items: z.array(
    z.object({
      menuItemId: z.string().min(1),
      quantity: z.number().min(1),
      specialInstructions: z.string().optional(),
    })
  ).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

// Table validation
export const tableSchema = z.object({
  number: z.number().min(1, 'Table number is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  floor: z.string().optional(),
  location: z.string().optional(),
  status: z.nativeEnum(TableStatus).default('AVAILABLE'),
  waiterId: z.string().optional(),
});

// Reservation validation
export const reservationSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Invalid email').optional(),
  customerPhone: z.string().min(10, 'Valid phone number is required'),
  numberOfGuests: z.number().min(1, 'At least 1 guest required'),
  reservationDate: z.date(),
  reservationTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  duration: z.number().min(30).default(120),
  specialRequests: z.string().optional(),
  tableId: z.string().optional(),
});

// User registration validation
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Inventory validation
export const inventorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sku: z.string().optional(),
  quantity: z.number().min(0),
  unit: z.nativeEnum(InventoryUnit),
  minQuantity: z.number().min(0),
  maxQuantity: z.number().min(0).optional(),
  costPerUnit: z.number().min(0),
  supplier: z.string().optional(),
  supplierContact: z.string().optional(),
  expiryDate: z.date().optional(),
  location: z.string().optional(),
});

// Payment validation
export const createPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  method: z.nativeEnum(PaymentMethod),
  tip: z.number().min(0).default(0),
});
