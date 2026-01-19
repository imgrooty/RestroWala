/**
 * GET /api/tables/[id] - Get single table
 * PUT /api/tables/[id] - Update table (MANAGER only)
 * DELETE /api/tables/[id] - Delete table (MANAGER only)
 * 
 * Single table operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
const updateTableSchema = z.object({
  number: z.number().min(1).optional(),
  capacity: z.number().min(1).optional(),
  floor: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'MAINTENANCE']).optional(),
  waiterId: z.string().optional(),
});

/**
 * GET /api/tables/[id]
 * Get single table details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const table = await prisma.table.findUnique({
      where: { id: params.id },
      include: {
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orders: {
          where: {
            status: {
              notIn: ['COMPLETED', 'CANCELLED'],
            },
          },
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            orders: true,
            reservations: true,
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Authorization: Verify table belongs to user's restaurant
    if (session.user.restaurantId && table.restaurantId !== session.user.restaurantId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this table' },
        { status: 403 }
      );
    }

    return NextResponse.json({ table });
  } catch (error) {
    console.error('Failed to fetch table:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tables/[id]
 * Update table (MANAGER only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Forbidden: Only managers can update tables' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateTableSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if table exists
    const existingTable = await prisma.table.findUnique({
      where: { id: params.id },
    });

    if (!existingTable) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Authorization: Verify table belongs to user's restaurant
    if (session.user.restaurantId && existingTable.restaurantId !== session.user.restaurantId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this table' },
        { status: 403 }
      );
    }

    // If updating table number, check for conflicts
    if (data.number && data.number !== existingTable.number) {
      const conflictingTable = await prisma.table.findFirst({
        where: {
          number: data.number,
          restaurantId: existingTable.restaurantId,
          id: { not: params.id },
        },
      });

      if (conflictingTable) {
        return NextResponse.json(
          { error: 'A table with this number already exists' },
          { status: 409 }
        );
      }
    }

    // Update table
    const table = await prisma.table.update({
      where: { id: params.id },
      data: {
        number: data.number,
        capacity: data.capacity,
        floor: data.floor,
        location: data.location,
        status: data.status,
        waiterId: data.waiterId === '' ? null : data.waiterId,
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

    // Emit real-time event if status changed
    if (data.status && data.status !== existingTable.status) {
      import('@/lib/socket').then(({ emitTableStatusChanged }) => {
        emitTableStatusChanged({
          tableId: table.id,
          tableNumber: table.number,
          status: table.status as any,
          previousStatus: existingTable.status as any,
          waiterId: table.waiterId,
        });
      }).catch(err => console.error('Failed to emit table:status-changed:', err));
    }

    return NextResponse.json({
      message: 'Table updated successfully',
      table,
    });
  } catch (error) {
    console.error('Failed to update table:', error);
    return NextResponse.json(
      { error: 'Failed to update table' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tables/[id]
 * Delete table (MANAGER only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Forbidden: Only managers can delete tables' },
        { status: 403 }
      );
    }

    // Check if table exists
    const table = await prisma.table.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Authorization: Verify table belongs to user's restaurant
    if (session.user.restaurantId && table.restaurantId !== session.user.restaurantId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this table' },
        { status: 403 }
      );
    }

    // Check if table has active orders
    const activeOrders = await prisma.order.count({
      where: {
        tableId: params.id,
        status: {
          notIn: ['COMPLETED', 'CANCELLED'],
        },
      },
    });

    if (activeOrders > 0) {
      return NextResponse.json(
        { error: 'Cannot delete table with active orders' },
        { status: 400 }
      );
    }

    // Delete table
    await prisma.table.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Table deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete table:', error);
    return NextResponse.json(
      { error: 'Failed to delete table' },
      { status: 500 }
    );
  }
}
