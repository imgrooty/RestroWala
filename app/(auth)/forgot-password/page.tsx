/**
 * Forgot Password Page
 * 
 * Public route for password recovery
 * - Email verification
 * - Password reset token generation
 * - Email sending
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsEmailSent(true);
        toast({
          title: 'Email Sent',
          description: 'Check your email for password reset instructions',
        });
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Check Your Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent password reset instructions to <strong>{email}</strong>
          </p>
          <p className="mt-4 text-sm text-gray-600">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={() => setIsEmailSent(false)}
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              try again
            </button>
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <Link href="/login">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Forgot Password?</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you instructions to reset your password
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className={`mt-1 ${error ? 'border-red-500' : ''}`}
              placeholder="you@example.com"
              disabled={isLoading}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Instructions'}
          </Button>
        </form>

        <div className="mt-6">
          <Link
            href="/login"
            className="flex items-center justify-center text-sm font-medium text-orange-600 hover:text-orange-500"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
