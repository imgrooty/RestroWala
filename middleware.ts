/**
 * NextAuth Middleware
 * 
 * Protects routes based on authentication and user roles
 * - Public routes: accessible to everyone
 * - Protected routes: require authentication
 * - Role-based routes: require specific roles
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define UserRole enum locally for middleware (Edge runtime doesn't support Prisma client)
enum UserRole {
  CUSTOMER = "CUSTOMER",
  WAITER = "WAITER",
  KITCHEN_STAFF = "KITCHEN_STAFF",
  CASHIER = "CASHIER",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  CLEANER = "CLEANER",
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Redirect authenticated users away from auth pages
    if ((pathname.startsWith("/login") || pathname.startsWith("/register")) && token) {
      return NextResponse.redirect(new URL(getRoleBasedRedirect(token.role as UserRole), req.url));
    }

    // Role-based route protection
    const roleRoutes: Record<string, UserRole[]> = {
      "/manager": [UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      "/waiter": [UserRole.WAITER, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      "/kitchen": [UserRole.KITCHEN_STAFF, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      "/cashier": [UserRole.CASHIER, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      "/admin": [UserRole.SUPER_ADMIN],
      "/cleaner": [UserRole.CLEANER, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    };

    // Check if current path requires specific role
    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(route)) {
        const userRole = token?.role as UserRole;

        if (!allowedRoles.includes(userRole)) {
          // Redirect to appropriate dashboard based on user's role
          return NextResponse.redirect(
            new URL(getRoleBasedRedirect(userRole), req.url)
          );
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes that don't require authentication
        // Public routes that don't require authentication
        const publicRoutes = [
          "/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/api/auth",
          "/customer", // Enable Guest Ordering (Menu, Cart, etc.)
          "/menu",     // Direct menu access
          "/cart",     // Direct cart access
          "/api/tables", // Table lookup for guests
          "/api/orders", // Order placement for guests
          "/api/menu",   // Menu items
          "/api/categories", // Categories
          "/api/upload", // Image upload (if needed)
          "/dine-in"
        ];

        // Check if route is public
        const isPublicRoute = publicRoutes.some(route =>
          pathname === route || pathname.startsWith(route)
        );

        // Allow public routes
        if (isPublicRoute) {
          return true;
        }

        // All other routes require authentication and a valid role
        return !!token && !!token.role;
      },
    },
  }
);

/**
 * Get redirect URL based on user role
 */
function getRoleBasedRedirect(role: UserRole): string {
  const redirects: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: "/admin/dashboard",
    [UserRole.ADMIN]: "/manager/dashboard",
    [UserRole.MANAGER]: "/manager/dashboard",
    [UserRole.KITCHEN_STAFF]: "/kitchen/orders",
    [UserRole.CASHIER]: "/cashier/dashboard",
    [UserRole.WAITER]: "/waiter/dashboard",
    [UserRole.CLEANER]: "/cleaner/dashboard",
    [UserRole.CUSTOMER]: "/",
  };

  return redirects[role] || "/";
}

// Matcher configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|models|images|qr-codes|.*\\.(?:svg|png|jpg|jpeg|gif|webp|glb|gltf)$).*)",
  ],
};

