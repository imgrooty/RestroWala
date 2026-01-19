/**
 * PATCH /api/tables/[id]/status
 * 
 * Update table status
 * - Available, Occupied, Reserved, Cleaning
 */

import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Implementation pending
    return NextResponse.json({ message: 'Update table status' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update table status' },
      { status: 500 }
    );
  }
}
