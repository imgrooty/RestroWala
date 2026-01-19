/**
 * Table Form Dialog Component
 * 
 * Dialog for creating and editing restaurant tables
 * - Form validation
 * - Waiter assignment
 * - Floor and location selection
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableStatus } from '@prisma/client';

const tableSchema = z.object({
  number: z.number().min(1, 'Table number must be at least 1'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  floor: z.string().optional(),
  location: z.string().optional(),
  status: z.nativeEnum(TableStatus),
  waiterId: z.string().optional(),
});

type TableFormData = z.infer<typeof tableSchema>;

interface TableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table?: any;
  onSave: (data: TableFormData) => Promise<void>;
}

export default function TableFormDialog({
  open,
  onOpenChange,
  table,
  onSave,
}: TableFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [waiters, setWaiters] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      number: table?.number || 1,
      capacity: table?.capacity || 2,
      floor: table?.floor || '',
      location: table?.location || '',
      status: table?.status || TableStatus.AVAILABLE,
      waiterId: table?.waiterId || '',
    },
  });

  const selectedStatus = watch('status');

  /**
   * Fetch available waiters
   */
  useEffect(() => {
    const fetchWaiters = async () => {
      try {
        const response = await fetch('/api/staff?role=WAITER');
        if (response.ok) {
          const data = await response.json();
          setWaiters(data.staff || []);
        }
      } catch (error) {
        console.error('Failed to fetch waiters:', error);
      }
    };

    if (open) {
      fetchWaiters();
    }
  }, [open]);

  /**
   * Reset form when dialog opens/closes
   */
  useEffect(() => {
    if (open) {
      reset({
        number: table?.number || 1,
        capacity: table?.capacity || 2,
        floor: table?.floor || '',
        location: table?.location || '',
        status: table?.status || TableStatus.AVAILABLE,
        waiterId: table?.waiterId || '',
      });
    }
  }, [open, table, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: TableFormData) => {
    setLoading(true);
    try {
      await onSave(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {table ? 'Edit Table' : 'Add New Table'}
          </DialogTitle>
          <DialogDescription>
            {table
              ? 'Update table information and settings'
              : 'Create a new table and generate its QR code'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Table Number */}
          <div className="space-y-2">
            <Label htmlFor="number">
              Table Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="number"
              type="number"
              min="1"
              {...register('number', { valueAsNumber: true })}
              placeholder="1"
            />
            {errors.number && (
              <p className="text-sm text-red-600">{errors.number.message}</p>
            )}
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacity">
              Capacity (People) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              {...register('capacity', { valueAsNumber: true })}
              placeholder="2"
            />
            {errors.capacity && (
              <p className="text-sm text-red-600">{errors.capacity.message}</p>
            )}
          </div>

          {/* Floor */}
          <div className="space-y-2">
            <Label htmlFor="floor">Floor (Optional)</Label>
            <Select
              value={watch('floor') || ''}
              onValueChange={(value) => setValue('floor', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No floor</SelectItem>
                <SelectItem value="Ground Floor">Ground Floor</SelectItem>
                <SelectItem value="First Floor">First Floor</SelectItem>
                <SelectItem value="Second Floor">Second Floor</SelectItem>
                <SelectItem value="Terrace">Terrace</SelectItem>
                <SelectItem value="Outdoor">Outdoor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="e.g., Near window, Corner, Center"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setValue('status', value as TableStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TableStatus.AVAILABLE}>Available</SelectItem>
                <SelectItem value={TableStatus.OCCUPIED}>Occupied</SelectItem>
                <SelectItem value={TableStatus.RESERVED}>Reserved</SelectItem>
                <SelectItem value={TableStatus.CLEANING}>Cleaning</SelectItem>
                <SelectItem value={TableStatus.MAINTENANCE}>Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Waiter Assignment */}
          <div className="space-y-2">
            <Label htmlFor="waiterId">Assign Waiter (Optional)</Label>
            <Select
              value={watch('waiterId') || ''}
              onValueChange={(value) => setValue('waiterId', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select waiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No waiter assigned</SelectItem>
                {waiters.map((waiter) => (
                  <SelectItem key={waiter.id} value={waiter.id}>
                    {waiter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : table ? 'Update Table' : 'Create Table'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
