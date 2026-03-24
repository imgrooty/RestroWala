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

    // Ensure `number` is a strict positive integer string (no extra characters, spaces, or signs)
    if (!/^\d+$/.test(number)) {
      return NextResponse.json({ error: 'Invalid table number' }, { status: 400 });
    }

    const parsedNumber = Number(number);
    if (parsedNumber <= 0) {
      return NextResponse.json({ error: 'Invalid table number' }, { status: 400 });
    }

    // Single query: filter by table number and restaurant slug via relation
    const table = await prisma.table.findFirst({
      where: {
        number: parsedNumber,
        restaurant: { slug },
      },
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
