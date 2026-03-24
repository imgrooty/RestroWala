/**
 * NextAuth Configuration
 * 
 * Complete authentication setup with:
 * - Email/Password login
 * - OAuth providers (Google, GitHub)
 * - JWT strategy
 * - Role-based authentication
 * - Prisma adapter
 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@/types/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    // Email/Password Authentication
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate input
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.toLowerCase()
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            image: true,
            isActive: true,
            emailVerified: true,
            restaurantId: true
          }
        });

        // Check if user exists
        if (!user || !user.password) {
          throw new Error("No account found with this email");
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error("Your account has been deactivated. Please contact support");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Incorrect password");
        }

        // Return user data (password excluded)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          emailVerified: user.emailVerified,
          restaurantId: user.restaurantId
        };
      }
    }),
  ],

  // Use JWT strategy for sessions
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Callbacks
  callbacks: {
    // JWT callback - runs whenever a JWT is created or updated
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.restaurantId = (user as any).restaurantId;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name;
        token.picture = session.image;
      }

      // Check if user still exists and is active
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isActive: true, role: true, restaurantId: true }
        });

        if (!dbUser || !dbUser.isActive) {
          // User doesn't exist or is inactive, invalidate token
          return {} as any;
        }

        // Update role if changed in database
        token.role = dbUser.role;
      }

      return token;
    },

    // Session callback - runs whenever session is checked
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.restaurantId = token.restaurantId as string;
      }
      return session;
    },

    // Sign in callback - control who can sign in
    async signIn({ account }: any) {
      // Only allow credentials-based login for staff
      if (account?.provider !== "credentials") {
        return false;
      }

      return true;
    },

    // Redirect callback
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },

  // Custom pages
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login", // Error code passed in query string as ?error=
    verifyRequest: "/verify-email", // Used for check email message
    newUser: "/customer/menu" // Redirect new users here
  },

  // Events
  events: {
    async signIn({ user, isNewUser }) {
      console.log(`User signed in: ${user.email}`);

      // You can add custom logic here, e.g.:
      // - Send welcome email for new users
      // - Log sign-in activity
      // - Update last login timestamp

      if (isNewUser) {
        console.log(`New user registered: ${user.email}`);
      }
    },
    async signOut({ token }) {
      console.log(`User signed out: ${token.email}`);
    }
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === "development",

  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Helper function to check if user has required role
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Role hierarchy for authorization
 */
export const roleHierarchy: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 6,
  [UserRole.ADMIN]: 5,
  [UserRole.MANAGER]: 4,
  [UserRole.CASHIER]: 3,
  [UserRole.KITCHEN_STAFF]: 2,
  [UserRole.WAITER]: 1,
  [UserRole.CLEANER]: 1,
  [UserRole.CUSTOMER]: 0
};

/**
 * Check if user role has sufficient permissions
 */
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = roleHierarchy[userRole];
  const requiredLevel = roleHierarchy[requiredRole];
  if (userLevel === undefined || requiredLevel === undefined) return false;
  return userLevel >= requiredLevel;
}
