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
 * Regenerates a table's QR code and returns the updated table record along with QR data.
 *
 * @param params - The route parameters object containing the table `id`.
 * @returns A JSON response containing `message`, the updated `table` record, `qrDataUrl`, and `qrCodeUrl` on success. On error returns a JSON response with an `error` message and an appropriate HTTP status: `401`, `403`, `404`, or `500`.
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

    // Generate QR code URL
    const qrCodeUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/customer/menu?table=${table.id}`;

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
 * Serve a table's QR code in PNG, SVG, or JSON (data URL) format.
 *
 * When `format=png` returns a PNG image response with `Content-Type: image/png`
 * and `Content-Disposition: inline; filename="table-<number>-qr.png"`. When
 * `format=svg` returns an SVG response with `Content-Type: image/svg+xml`
 * and `Content-Disposition: inline; filename="table-<number>-qr.svg"`. For any
 * other `format` returns a JSON object containing the table record, the URL
 * encoded in the QR (`qrCodeUrl`), and a data URL of the generated QR (`qrDataUrl`).
 *
 * @param params.id - The ID of the table whose QR code should be returned
 * @returns For `png`: a PNG binary response; for `svg`: an SVG text response; otherwise a JSON object with `table`, `qrCodeUrl`, and `qrDataUrl`
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
      },
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Generate QR code URL
    const qrCodeUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/customer/menu?table=${table.id}`;

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
