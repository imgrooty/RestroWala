/**
 * QR Code Utilities
 * 
 * Helper functions for QR code generation and management
 */

import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Generate unique QR code string
 */
export function generateUniqueQRCode(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate QR code URL for a table
 */
export function getTableQRUrl(tableId: string, slug: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/${slug}/menu/${tableId}`;
}

/**
 * Generate QR code as data URL
 */
export async function generateQRDataUrl(
  url: string,
  options?: {
    width?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
  }
): Promise<string> {
  const {
    width = 300,
    margin = 2,
    darkColor = '#000000',
    lightColor = '#FFFFFF',
  } = options || {};

  return QRCode.toDataURL(url, {
    width,
    margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel: 'H',
  });
}

/**
 * Generate QR code as PNG buffer
 */
export async function generateQRBuffer(
  url: string,
  options?: {
    width?: number;
    margin?: number;
  }
): Promise<Buffer> {
  const { width = 400, margin = 2 } = options || {};

  return QRCode.toBuffer(url, {
    width,
    margin,
    errorCorrectionLevel: 'H',
  });
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRSvg(
  url: string,
  options?: {
    margin?: number;
  }
): Promise<string> {
  const { margin = 2 } = options || {};

  return QRCode.toString(url, {
    type: 'svg',
    margin,
    errorCorrectionLevel: 'H',
  });
}

/**
 * Generate QR code with custom branding
 */
export async function generateBrandedQRCode(
  url: string,
  _tableNumber: number,
  _options?: {
    floor?: string;
    location?: string;
    logoUrl?: string;
  }
): Promise<string> {
  // This would generate a more complex QR code with branding
  // For now, returns standard QR code
  // Can be enhanced with canvas manipulation to add logo overlay
  
  return generateQRDataUrl(url, { width: 400 });
}

/**
 * Validate QR code string
 */
export function isValidQRCode(qrCode: string): boolean {
  // Check if QR code is a valid hex string of correct length
  return /^[a-f0-9]{32}$/i.test(qrCode);
}

/**
 * Generate printable QR code HTML
 */
export function generatePrintableQR(
  qrDataUrl: string,
  tableNumber: number,
  options?: {
    floor?: string;
    location?: string;
    instructions?: string;
  }
): string {
  const {
    floor,
    location,
    instructions = 'Scan this QR code to view our menu and place your order',
  } = options || {};

  const locationText = [floor, location].filter(Boolean).join(' - ');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Table ${tableNumber} QR Code</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .container {
            text-align: center;
            max-width: 400px;
            page-break-inside: avoid;
          }
          img {
            max-width: 100%;
            height: auto;
            margin: 20px 0;
          }
          h1 {
            font-size: 48px;
            margin: 20px 0;
            font-weight: bold;
          }
          .location {
            color: #666;
            font-size: 24px;
            margin: 10px 0;
          }
          .instructions {
            color: #999;
            font-size: 18px;
            margin-top: 30px;
            line-height: 1.5;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Table ${tableNumber}</h1>
          ${locationText ? `<div class="location">${locationText}</div>` : ''}
          <img src="${qrDataUrl}" alt="Table QR Code" />
          <div class="instructions">${instructions}</div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Calculate QR code size based on content
 */
export function calculateOptimalQRSize(contentLength: number): number {
  // More content = larger QR code for better scanning
  if (contentLength < 50) return 200;
  if (contentLength < 100) return 300;
  if (contentLength < 200) return 400;
  return 500;
}
