/**
 * GET /api/menu/[id] - Get single menu item
 * PUT /api/menu/[id] - Update menu item (MANAGER only)
 * PATCH /api/menu/[id] - Partial update (e.g. toggle availability) - MANAGER or KITCHEN_STAFF
 * DELETE /api/menu/[id] - Delete menu item (MANAGER only)
 *
 * Single menu item operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { menuItemSchema } from '@/lib/validations';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch {
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

    if (!session || !['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify item belongs to user's restaurant
    const existing = await prisma.menuItem.findFirst({
      where: {
        id: params.id,
        ...(session.user.restaurantId ? { restaurantId: session.user.restaurantId } : {}),
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    const body = await request.json();

    const priceValue = parseFloat(body.price);
    if (isNaN(priceValue)) {
      return NextResponse.json({ error: 'Invalid price value' }, { status: 400 });
    }

    const validation = menuItemSchema.safeParse({ ...body, price: priceValue });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const updated = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice,
        image: data.image,
        model3dUrl: data.model3dUrl,
        model3dFormat: data.model3dFormat,
        isVegetarian: data.isVegetarian,
        isVegan: data.isVegan,
        isGlutenFree: data.isGlutenFree,
        spiceLevel: data.spiceLevel,
        calories: data.calories,
        preparationTime: data.preparationTime,
        tags: data.tags,
        categoryId: data.categoryId,
      },
    });

    return NextResponse.json({ message: 'Menu item updated', data: updated });
  } catch {
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

    if (
      !session ||
      !['MANAGER', 'ADMIN', 'SUPER_ADMIN', 'KITCHEN_STAFF'].includes(
        session.user.role
      )
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify item belongs to user's restaurant
    const existing = await prisma.menuItem.findFirst({
      where: {
        id: params.id,
        ...(session.user.restaurantId ? { restaurantId: session.user.restaurantId } : {}),
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    const body = await request.json();

    // Build partial update – only allowed fields
    const updateData: Record<string, unknown> = {};

    if (typeof body.isAvailable === 'boolean') {
      updateData.isAvailable = body.isAvailable;
    }

    // Managers can also update other fields via PATCH
    if (['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      if (typeof body.isFeatured === 'boolean') updateData.isFeatured = body.isFeatured;
      if (typeof body.displayOrder === 'number') updateData.displayOrder = body.displayOrder;
      if (body.name) updateData.name = body.name;
      if (typeof body.price === 'number') updateData.price = body.price;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updated = await prisma.menuItem.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ message: 'Menu item updated', data: updated });
  } catch {
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

    if (!session || !['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.menuItem.findFirst({
      where: {
        id: params.id,
        ...(session.user.restaurantId ? { restaurantId: session.user.restaurantId } : {}),
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    await prisma.menuItem.delete({ where: { id: params.id } });

    return NextResponse.json({ message: 'Menu item deleted' });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}

