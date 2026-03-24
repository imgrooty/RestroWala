/**
 * GET /api/staff - Get all staff members
 * POST /api/staff - Create new staff member (MANAGER only)
 * 
 * Staff management
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/types/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== UserRole.MANAGER && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const staff = await prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.WAITER, UserRole.KITCHEN_STAFF, UserRole.CASHIER, UserRole.MANAGER]
        },
        restaurantId: session.user.restaurantId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data: staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

/**
 * Create a new staff member for the authenticated user's restaurant.
 *
 * Only users with the `MANAGER` or `ADMIN` role may create staff. Expects a JSON
 * request body containing the new user's details; `name`, `email`, `password`,
 * and `role` are required, `phone` is optional.
 *
 * @param request - NextRequest whose JSON body must include:
 *   - `name`: display name for the staff member
 *   - `email`: unique email address for the staff member
 *   - `password`: plaintext password to be hashed before storage
 *   - `role`: staff role (e.g., waiter, kitchen staff, cashier, manager)
 *   - `phone` (optional): contact phone number
 * @returns On success, an object with `message: 'Staff member created'` and
 *   `data` containing the created user's public fields:
 *   `{ id, name, email, role, phone, isActive, restaurantId, createdAt, updatedAt }`.
 *   Possible error responses:
 *   - 400: missing required fields or email already exists
 *   - 401: unauthorized when caller is not a manager/admin or not authenticated
 *   - 500: server error when creation fails
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.MANAGER && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, role, phone } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        isActive: true,
        restaurantId: session.user.restaurantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        restaurantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ message: 'Staff member created', data: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    );
  }
}
