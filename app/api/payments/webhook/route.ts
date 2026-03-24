/**
 * POST /api/payments/webhook
 * 
 * Payment gateway webhook
 * - Handle payment confirmations
 * - Update payment status
 * - Stripe, Razorpay, etc.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  // Webhook signature verification is not yet implemented.
  // Fail closed to prevent spoofed events from being accepted.
  return NextResponse.json(
    { error: 'Webhook signature verification not implemented' },
    { status: 501 }
  );
}
