/**
 * GET /api/tables - Get all tables
 * POST /api/tables - Create new table (MANAGER only)
 * 
 * Table management with QR code generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

// Validation schema
const tableSchema = z.object({
  number: z.number().min(1),
  capacity: z.number().min(1),
  floor: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'MAINTENANCE']),
  waiterId: z.string().optional(),
});

/**
 * GET /api/tables
 * Get all restaurant tables
 */
export async function GET(request: NextRequest) {
  try {
    await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const tableNum = searchParams.get('number');
    const status = searchParams.get('status');
    const floor = searchParams.get('floor');

    // Build where clause
    const where: any = {};

    if (slug) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug } as any,
        select: { id: true }
      });
      if (restaurant) {
        where.restaurantId = restaurant.id;
      } else {
        return NextResponse.json({ tables: [] }); // No restaurant, no tables
      }
    }

    if (tableNum) where.number = parseInt(tableNum);
    if (status) where.status = status;
    if (floor) where.floor = floor;

    // Fetch tables with relations
    const tables = await prisma.table.findMany({
      where,
      include: {
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        number: 'asc',
      },
    });

    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Failed to fetch tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tables
 * Create new table (MANAGER only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication and authorization
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only managers can create tables' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = tableSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get restaurant ID
    const { getRestaurantId } = await import('@/lib/restaurant-utils');
    const restaurantId = await getRestaurantId(session.user.id);

    // Check if table number already exists
    const existingTable = await prisma.table.findFirst({
      where: {
        number: data.number,
        restaurantId,
      },
    });

    if (existingTable) {
      return NextResponse.json(
        { error: 'A table with this number already exists' },
        { status: 409 }
      );
    }

    // Generate unique QR code
    const qrCode = crypto.randomBytes(16).toString('hex');

    // Create table
    const table = await prisma.table.create({
      data: {
        number: data.number,
        capacity: data.capacity,
        floor: data.floor || null,
        location: data.location || null,
        status: data.status,
        qrCode,
        restaurantId,
        waiterId: data.waiterId || null,
      },
      include: {
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Table created successfully', table },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create table:', error);
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  }
}
