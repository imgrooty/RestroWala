import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/types/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== UserRole.MANAGER && session.user.role !== UserRole.ADMIN)) {
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
    const { number, capacity, floor, location } = body;
    const restaurantId = session.user.restaurantId;

    if (!restaurantId) {
      return NextResponse.json({ error: 'No restaurant associated' }, { status: 400 });
    }

    // Check if table number exists
    const existing = await prisma.table.findFirst({
      where: {
        restaurantId,
        number: parseInt(number)
      }
    });

    if (existing) {
      return NextResponse.json({ error: `Table ${number} already exists` }, { status: 400 });
    }

    const table = await prisma.table.create({
      data: {
        number: parseInt(number),
        capacity: parseInt(capacity),
        floor,
        location,
        restaurantId,
        qrCode: uuidv4(), // Unique code for the QR
        status: 'AVAILABLE'
      }
    });

    return NextResponse.json({ message: 'Table created', data: table }, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}
