/**
 * GET /api/tables/by-number
 *
 * Public endpoint to look up a table by number and restaurant slug.
 * Used by the cart page when a customer manually enters their table number.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const number = searchParams.get('number');
    const slug = searchParams.get('slug');

    if (!number || !slug) {
      return NextResponse.json(
        { error: 'Both number and slug query parameters are required' },
        { status: 400 }
      );
    }

    const parsedNumber = parseInt(number, 10);
    if (Number.isNaN(parsedNumber)) {
      return NextResponse.json({ error: 'Invalid table number' }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const table = await prisma.table.findFirst({
      where: { number: parsedNumber, restaurantId: restaurant.id },
      select: { id: true, number: true, floor: true, location: true, capacity: true },
    });

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    return NextResponse.json({ table });
  } catch (error) {
    console.error('Error looking up table by number:', error);
    return NextResponse.json({ error: 'Failed to look up table' }, { status: 500 });
  }
}
