/**
 * POST /api/auth/reset-password
 * 
 * Reset user password with valid token
 * - Verify token
 * - Update password
 * - Delete used token
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const identifier = getClientIdentifier(request);
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.RESET_PASSWORD);
    
    if (rateLimit.limited) {
      return NextResponse.json(
        { 
          error: 'Too many password reset attempts. Please try again later.',
          retryAfter: rateLimit.resetIn 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimit.resetIn.toString(),
            'X-RateLimit-Limit': RATE_LIMITS.RESET_PASSWORD.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetIn.toString(),
          }
        }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = resetPasswordSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { token, password } = validationResult.data;

    // Find and verify token
    const resetToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    // Check if token expired first to prevent timing attacks
    if (!resetToken || new Date() > resetToken.expires) {
      // Delete expired token if it exists
      if (resetToken) {
        await prisma.verificationToken.delete({
          where: { token }
        }).catch(() => {}); // Ignore errors
      }

      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Find user by email (identifier)
    const user = await prisma.user.findUnique({
      where: { email: resetToken.identifier }
    });

    if (!user) {
      // Delete token if user doesn't exist
      await prisma.verificationToken.delete({
        where: { token }
      }).catch(() => {});
      
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and delete token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      }),
      prisma.verificationToken.delete({
        where: { token }
      })
    ]);

    // TODO: Send confirmation email
    console.log('Password reset successful for:', user.email);

    return NextResponse.json({
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
