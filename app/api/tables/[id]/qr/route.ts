/**
 * POST /api/tables/[id]/qr
 * 
 * Regenerate QR code for a table
 * - Generate new unique QR code
 * - Update table record
 * - Return new QR code
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import QRCode from 'qrcode';

/**
 * POST /api/tables/[id]/qr
 * Regenerate QR code for table
 */
export async function POST(
  _request: NextRequest,
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
        { error: 'Forbidden: Only managers can regenerate QR codes' },
        { status: 403 }
      );
    }

    // Check if table exists
    const existingTable = await prisma.table.findUnique({
      where: { id: params.id },
      include: { restaurant: { select: { slug: true } } },
    });

    if (!existingTable) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Generate new unique QR code
    const newQrCode = crypto.randomBytes(16).toString('hex');

    // Update table with new QR code
    const table = await prisma.table.update({
      where: { id: params.id },
      data: {
        qrCode: newQrCode,
      },
    });

    // Generate QR code URL pointing to the menu order page
    const qrCodeUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/${existingTable.restaurant.slug}/menu/${table.id}`;

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H',
    });

    return NextResponse.json({
      message: 'QR code regenerated successfully',
      table,
      qrDataUrl,
      qrCodeUrl,
    });
  } catch (error) {
    console.error('Failed to regenerate QR code:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate QR code' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tables/[id]/qr
 * Get QR code for table
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get format from query params
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, png, svg

    // Get table
    const table = await prisma.table.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        number: true,
        qrCode: true,
        floor: true,
        location: true,
        restaurant: { select: { slug: true } },
      },
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Generate QR code URL pointing to the menu order page
    const qrCodeUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/${table.restaurant.slug}/menu/${table.id}`;

    // Return based on format
    if (format === 'png') {
      // Generate QR code as PNG buffer
      const qrBuffer = await QRCode.toBuffer(qrCodeUrl, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'H',
      });

      return new NextResponse(new Uint8Array(qrBuffer), {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `inline; filename="table-${table.number}-qr.png"`,
        },
      });
    } else if (format === 'svg') {
      // Generate QR code as SVG
      const qrSvg = await QRCode.toString(qrCodeUrl, {
        type: 'svg',
        errorCorrectionLevel: 'H',
      });

      return new NextResponse(qrSvg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `inline; filename="table-${table.number}-qr.svg"`,
        },
      });
    } else {
      // Return JSON with data URL
      const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H',
      });

      return NextResponse.json({
        table,
        qrCodeUrl,
        qrDataUrl,
      });
    }
  } catch (error) {
    console.error('Failed to get QR code:', error);
    return NextResponse.json(
      { error: 'Failed to get QR code' },
      { status: 500 }
    );
  }
}
