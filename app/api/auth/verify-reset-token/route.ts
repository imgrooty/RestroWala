/**
 * POST /api/auth/verify-reset-token
 * 
 * Verify password reset token validity
 * - Check if token exists
 * - Check if token is expired
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find token in database
    const resetToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    // Check if token exists and is not expired
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      );
    }

    if (new Date() > resetToken.expires) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token }
      });

      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({ valid: true });

  } catch (error) {
    console.error('Token verification error:', error);
    
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}
