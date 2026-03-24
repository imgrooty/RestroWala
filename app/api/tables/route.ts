import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/types/prisma';
import { v4 as uuidv4 } from 'uuid';
import { tableSchema } from '@/lib/validations';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const allowedRoles: string[] = [UserRole.MANAGER, UserRole.ADMIN, UserRole.WAITER, UserRole.CASHIER, UserRole.CLEANER, UserRole.SUPER_ADMIN];

    if (!session || !allowedRoles.includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // const { searchParams } = new URL(request.url);
    const restaurantId = session.user.restaurantId;

    if (!restaurantId) {
      return NextResponse.json({ error: 'No restaurant associated' }, { status: 400 });
    }

    const tables = await prisma.table.findMany({
      where: {
        restaurantId: restaurantId
      },
      include: {
        restaurant: {
          select: { slug: true, name: true }
        }
      },
      orderBy: { number: 'asc' }
    });

    return NextResponse.json({ data: tables });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== UserRole.MANAGER && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const restaurantId = session.user.restaurantId;

    if (!restaurantId) {
      return NextResponse.json({ error: 'No restaurant associated' }, { status: 400 });
    }

    // Parse and validate numeric inputs
    const parsedNumber = parseInt(body.number, 10);
    const parsedCapacity = parseInt(body.capacity, 10);

    if (Number.isNaN(parsedNumber) || Number.isNaN(parsedCapacity)) {
      return NextResponse.json(
        { error: 'Invalid table number or capacity' },
        { status: 400 }
      );
    }

    // Validate input using schema
    const validation = tableSchema.safeParse({
      number: parsedNumber,
      capacity: parsedCapacity,
      floor: body.floor,
      location: body.location,
      status: body.status,
      waiterId: body.waiterId,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if table number exists
    const existing = await prisma.table.findFirst({
      where: {
        restaurantId,
        number: data.number
      }
    });

    if (existing) {
      return NextResponse.json({ error: `Table ${data.number} already exists` }, { status: 400 });
    }

    const table = await prisma.table.create({
      data: {
        number: data.number,
        capacity: data.capacity,
        floor: data.floor,
        location: data.location,
        restaurantId,
        qrCode: uuidv4(), // Unique code for the QR
        status: data.status || 'AVAILABLE',
        waiterId: data.waiterId || null,
      }
    });

    return NextResponse.json({ message: 'Table created', data: table }, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}
