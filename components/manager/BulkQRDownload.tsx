/**
 * Bulk QR Download Component
 * 
 * Download QR codes for multiple tables at once
 * - Generate ZIP file with all QR codes
 * - Batch processing
 * - Progress indicator
 */

'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import QRCode from 'qrcode';

interface BulkQRDownloadProps {
  tables: Array<{
    id: string;
    number: number;
    floor?: string;
    location?: string;
  }>;
}

export default function BulkQRDownload({ tables }: BulkQRDownloadProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  /**
   * Generate and download all QR codes
   */
  const handleBulkDownload = async () => {
    if (tables.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No tables to download',
      });
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      // For simplicity, we'll download individual files
      // In production, consider using JSZip to create a single ZIP file
      
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        
        // Generate QR code
        const qrUrl = `${window.location.origin}/customer/menu?table=${table.id}`;
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const size = 800;
        canvas.width = size;
        canvas.height = size + 200;

        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Generate QR on temp canvas
        const tempCanvas = document.createElement('canvas');
        await QRCode.toCanvas(tempCanvas, qrUrl, {
          width: size,
          margin: 2,
          errorCorrectionLevel: 'H',
        });

        // Draw QR code
        ctx.drawImage(tempCanvas, 0, 0);

        // Add text
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

        // Convert to blob and download
        await new Promise<void>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `table-${table.number}-qr-code.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }
            resolve();
          }, 'image/png');
        });

        // Update progress
        setProgress(Math.round(((i + 1) / tables.length) * 100));

        // Small delay to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast({
        title: 'Success',
        description: `Downloaded ${tables.length} QR codes successfully`,
      });
    } catch (error) {
      console.error('Bulk download error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to download QR codes',
      });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleBulkDownload}
        disabled={loading || tables.length === 0}
        variant="outline"
      >
        <Download className="w-4 h-4 mr-2" />
        {loading ? `Downloading... ${progress}%` : `Download All (${tables.length})`}
      </Button>
      
      {loading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
