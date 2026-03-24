/**
 * Login Page
 * 
 * Public route for user authentication
 * - Email/password login
 * - OAuth providers (Google, GitHub)
 * - Redirect to role-specific dashboard after login
 */

'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get callback URL from query params or default to home
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: result.error,
        });
      } else if (result?.ok) {
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });

        // Fetch session to get user role for proper redirection
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        if (session?.user?.role && callbackUrl === '/') {
          const roleRedirects: Record<string, string> = {
            'SUPER_ADMIN': '/admin/dashboard',
            'ADMIN': '/manager/dashboard',
            'MANAGER': '/manager/dashboard',
            'KITCHEN_STAFF': '/kitchen/orders',
            'CASHIER': '/cashier/dashboard',
            'WAITER': '/waiter/dashboard',
            'CLEANER': '/cleaner/dashboard',
            'CUSTOMER': '/',
          };
          router.push(roleRedirects[session.user.role] || '/');
        } else {
          router.push(callbackUrl);
        }

        router.refresh();
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="w-full max-w-md space-y-8 px-4">
      {/* Logo and Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Staff Portal</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to access your dashboard
        </p>
      </div>

      {/* Login Form */}
      <div className="bg-white shadow-lg rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
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
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
              placeholder="staff@gourmetos.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-primary hover:text-primary/90"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full font-bold"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Portal'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
