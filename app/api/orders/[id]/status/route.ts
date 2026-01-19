/**
 * PATCH /api/orders/[id]/status - Update order status
 * 
 * Update order status with state machine validation
 * - Validates state transitions
 * - Role-based permissions
 * - Emits Socket.io events
 * - Updates timestamps
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OrderStatus, UserRole } from '@/types/prisma';
import { validateTransition } from '@/lib/orderStateMachine';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional(),
});

/**
 * PATCH /api/orders/[id]/status
 * Update order status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { status: newStatus, notes } = validation.data;
    const userRole = session.user.role as UserRole;

    // Get current order
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        table: {
          select: {
            id: true,
            number: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Validate transition
    const validationResult = validateTransition(
      order.status,
      newStatus,
      userRole
    );

    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    // Prepare update data with timestamps
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date(),
    };

    // Update timestamps based on status
    if (newStatus === OrderStatus.PREPARING && !order.preparationStartedAt) {
      updateData.preparationStartedAt = new Date();
    }
    if (newStatus === OrderStatus.READY && !order.readyAt) {
      updateData.readyAt = new Date();
    }
    if (newStatus === OrderStatus.SERVED && !order.servedAt) {
      updateData.servedAt = new Date();
    }
    if (newStatus === OrderStatus.COMPLETED && !order.completedAt) {
      updateData.completedAt = new Date();
    }

    // Add notes if provided
    if (notes) {
      updateData.notes = order.notes
        ? `${order.notes}\n[${new Date().toISOString()}] ${notes}`
        : `[${new Date().toISOString()}] ${notes}`;
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
              },
            },
          },
        },
        table: {
          select: {
            id: true,
            number: true,
            capacity: true,
            floor: true,
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update table status if order is completed
    if (newStatus === OrderStatus.COMPLETED) {
      // Check if there are other active orders for this table
      const activeOrders = await prisma.order.count({
        where: {
          tableId: order.tableId,
          status: {
            notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
          },
        },
      });

      // If no active orders, set table to available
      if (activeOrders === 0) {
        await prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    // Emit Socket.io event
    import('@/lib/socket').then(({ emitOrderStatusChanged }) => {
      emitOrderStatusChanged({
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: newStatus,
        previousStatus: order.status,
        tableId: order.tableId,
        tableNumber: order.table.number,
        timestamp: new Date(),
        updatedBy: {
          id: session.user.id,
          name: session.user.name || 'Unknown',
          role: userRole,
        },
      });
    }).catch(err => console.error('Failed to emit order:status-changed:', err));

    return NextResponse.json({
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
