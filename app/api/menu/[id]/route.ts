/**
 * GET /api/menu/[id] - Get single menu item
 * PUT /api/menu/[id] - Update menu item (MANAGER only)
 * PATCH /api/menu/[id] - Update specific fields (MANAGER, WAITER)
 * DELETE /api/menu/[id] - Delete menu item (MANAGER only)
 * 
 * Single menu item operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: {
        category: true,
      },
    });

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    // Verify restaurant match
    if (session.user.role !== UserRole.SUPER_ADMIN && menuItem.restaurantId !== session.user.restaurantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ data: menuItem });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updatedItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ data: updatedItem });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item' },
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
    const allowedRoles: string[] = [UserRole.MANAGER, UserRole.ADMIN, UserRole.WAITER];
    if (!allowedRoles.includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if item exists and belongs to restaurant
    const existing = await prisma.menuItem.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    if (session.user.role !== UserRole.SUPER_ADMIN && existing.restaurantId !== session.user.restaurantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Waiters can only toggle availability
    const data: any = {};
    if (session.user.role === UserRole.WAITER) {
      if (body.isAvailable !== undefined) data.isAvailable = body.isAvailable;
    } else {
      // Managers can update everything
      Object.assign(data, body);
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: data,
    });

    return NextResponse.json({ data: updatedItem });
  } catch (error) {
    console.error('Error in PATCH menu item:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item' },
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
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.menuItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Menu item deleted' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}
