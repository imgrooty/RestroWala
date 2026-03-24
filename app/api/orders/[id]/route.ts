/**
 * GET /api/orders/[id] - Get single order
 * PATCH /api/orders/[id] - Update order
 * DELETE /api/orders/[id] - Cancel order
 * 
 * Single order operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OrderStatus, UserRole } from '@/types/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        table: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Authorization check
    if (session.user.role !== UserRole.SUPER_ADMIN && order.restaurantId !== session.user.restaurantId) {
      // If customer, they can only see their own orders
      if (session.user.role === UserRole.CUSTOMER && order.userId !== session.user.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      // If staff, they must belong to the same restaurant
      if (order.restaurantId !== session.user.restaurantId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const order = await prisma.order.findUnique({
      where: { id: params.id }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Authorization check
    if (session.user.role !== UserRole.SUPER_ADMIN && order.restaurantId !== session.user.restaurantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        notes: body.notes,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        status: body.status,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      }
    });

    return NextResponse.json({ data: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only allow cancellation if pending and authorized
    if (order.status !== OrderStatus.PENDING && session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.MANAGER) {
        return NextResponse.json({ error: 'Cannot cancel order in current status' }, { status: 400 });
    }

    await prisma.order.update({
      where: { id: params.id },
      data: { status: OrderStatus.CANCELLED }
    });

    return NextResponse.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
