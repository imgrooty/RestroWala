/**
 * Payment Related Types
 * 
 * Types for payments and transactions
 */

import { Payment as PrismaPayment, PaymentStatus, PaymentMethod } from '@prisma/client';

// Extended Payment with relations
export interface PaymentWithRelations extends PrismaPayment {
  order: any;
}

// Create payment data
export interface CreatePaymentData {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  tip?: number;
}

// Payment intent (for Stripe, Razorpay, etc.)
export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

// Payment webhook data
export interface PaymentWebhookData {
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  metadata?: Record<string, any>;
}

// Refund data
export interface RefundData {
  paymentId: string;
  amount?: number; // Partial or full refund
  reason: string;
}
