/**
 * POST /api/auth/forgot-password
 * 
 * Generate password reset token and send email
 * - Validate email
 * - Create reset token
 * - Store token in database
 * - Send reset email
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Always return success to prevent email enumeration
    // (Don't reveal if email exists or not)
    if (!user) {
      return NextResponse.json({
        message: 'If an account with that email exists, we have sent password reset instructions'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in database
    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token: resetToken,
        expires: resetTokenExpiry,
      }
    });

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // TODO: Send email with reset link
    // For now, we'll just log it (in production, use SendGrid, Resend, etc.)
    console.log('Password reset link:', resetUrl);
    console.log('Send this link to:', email);

    // Example email content:
    // Subject: Reset your password
    // Body:
    // Hi ${user.name},
    // 
    // You requested to reset your password. Click the link below to set a new password:
    // ${resetUrl}
    // 
    // This link will expire in 1 hour.
    // 
    // If you didn't request this, please ignore this email.

    // await sendEmail({
    //   to: email,
    //   subject: 'Reset your password',
    //   html: `
    //     <h1>Reset Your Password</h1>
    //     <p>Hi ${user.name},</p>
    //     <p>You requested to reset your password. Click the link below to set a new password:</p>
    //     <a href="${resetUrl}">${resetUrl}</a>
    //     <p>This link will expire in 1 hour.</p>
    //     <p>If you didn't request this, please ignore this email.</p>
    //   `
    // });

    return NextResponse.json({
      message: 'If an account with that email exists, we have sent password reset instructions'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
