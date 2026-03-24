/**
 * Table QR Code Generator Component
 * 
 * Generate and display QR codes for restaurant tables
 * - QR code generation
 * - Download as PNG
 * - Display table information
 * - Print functionality
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, Printer, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import QRCode from 'qrcode';

interface TableQRGeneratorProps {
  table: {
    id: string;
    number: number;
    qrCode: string;
    capacity?: number;
    floor?: string;
    location?: string;
  };
}

/**
 * Generate a QR image for the table URL, store its data URL for display, and draw a canvas copy for downloads.
 */

/**
 * Compose a high-resolution PNG containing the QR code and table details, then trigger its download.
 */

/**
 * Open a printable window containing the QR image and table details, invoke the print dialog, and close the window after printing.
 */

/**
 * Request a new unique QR code for the table from the API, notify on success, and reload the page.
 */
export default function TableQRGenerator({ table }: TableQRGeneratorProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Generate QR code URL (customer menu with table ID)
  const qrCodeUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/customer/menu?table=${table.id}`;

  /**
   * Generate QR code
   */
  const generateQRCode = async () => {
    try {
      setLoading(true);

      // Generate QR code as data URL
      const dataUrl = await QRCode.toDataURL(qrCodeUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });

      setQrDataUrl(dataUrl);

      // Also draw on canvas for download
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, qrCodeUrl, {
          width: 400,
          margin: 2,
          errorCorrectionLevel: 'H',
        });
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate QR code',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Download QR code as PNG
   */
  const downloadQRCode = async () => {
    try {
      // Create a larger canvas for high-quality download
      const canvas = document.createElement('canvas');
      const size = 800; // High resolution
      canvas.width = size;
      canvas.height = size + 200; // Extra space for text

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Generate QR code on temp canvas
      const tempCanvas = document.createElement('canvas');
      await QRCode.toCanvas(tempCanvas, qrCodeUrl, {
        width: size,
        margin: 2,
        errorCorrectionLevel: 'H',
      });

      // Draw QR code
      ctx.drawImage(tempCanvas, 0, 0);

      // Add text below QR code
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Table ${table.number}`, size / 2, size + 60);

      if (table.floor || table.location) {
        ctx.font = '32px Arial';
        ctx.fillStyle = '#666666';
        const location = [table.floor, table.location].filter(Boolean).join(' - ');
        ctx.fillText(location, size / 2, size + 110);
      }

      ctx.font = '24px Arial';
      ctx.fillStyle = '#999999';
      ctx.fillText('Scan to view menu & order', size / 2, size + 160);

      // Download
      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `table-${table.number}-qr-code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: 'Success',
          description: 'QR code downloaded successfully',
        });
      }, 'image/png');
    } catch (error) {
      console.error('Failed to download QR code:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to download QR code',
      });
    }
  };

  /**
   * Print QR code
   */
  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please allow popups to print',
      });
      return;
    }

    const location = [table.floor, table.location].filter(Boolean).join(' - ');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table ${table.number} QR Code</title>
          <style>
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
            }
            img {
              max-width: 100%;
              height: auto;
              margin: 20px 0;
            }
            h1 {
              font-size: 32px;
              margin: 10px 0;
            }
            .location {
              color: #666;
              font-size: 18px;
              margin: 10px 0;
            }
            .instructions {
              color: #999;
              font-size: 14px;
              margin-top: 20px;
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
            <h1>Table ${table.number}</h1>
            ${location ? `<div class="location">${location}</div>` : ''}
            <img src="${qrDataUrl}" alt="Table QR Code" />
            <div class="instructions">
              Scan this QR code to view our menu and place your order
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  /**
   * Regenerate QR code with new unique code
   */
  const regenerateQRCode = async () => {
    try {
      const response = await fetch(`/api/tables/${table.id}/qr`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate QR code');
      }

      toast({
        title: 'Success',
        description: 'QR code regenerated successfully',
      });

      // Reload page or refresh data
      window.location.reload();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to regenerate QR code',
      });
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [table.id]);

  return (
    <div className="space-y-4">
      {/* QR Code Display */}
      <div className="flex justify-center p-6 bg-white border-2 border-dashed border-gray-300 rounded-lg">
        {loading ? (
          <div className="w-[300px] h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
          </div>
        ) : (
          <div className="text-center">
            <img
              src={qrDataUrl}
              alt={`Table ${table.number} QR Code`}
              className="w-[300px] h-[300px]"
            />
            <div className="mt-4">
              <p className="font-semibold text-lg">Table {table.number}</p>
              {(table.floor || table.location) && (
                <p className="text-sm text-gray-600">
                  {[table.floor, table.location].filter(Boolean).join(' - ')}
                </p>
              )}
              {table.capacity && (
                <p className="text-xs text-gray-500 mt-1">
                  Capacity: {table.capacity} {table.capacity === 1 ? 'person' : 'people'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for download */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={downloadQRCode}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button
          onClick={printQRCode}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button
          onClick={regenerateQRCode}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate
        </Button>
      </div>

      {/* QR Code URL Info */}
      <div className="p-3 bg-gray-50 rounded text-xs font-mono break-all">
        <p className="text-gray-600 mb-1">QR Code URL:</p>
        <p className="text-gray-800">{qrCodeUrl}</p>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-600 space-y-1">
        <p><strong>Download:</strong> Save as high-resolution PNG image</p>
        <p><strong>Print:</strong> Print directly for table display</p>
        <p><strong>Regenerate:</strong> Create new unique QR code for this table</p>
      </div>
    </div>
  );
}
