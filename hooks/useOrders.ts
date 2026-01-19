/**
 * useOrders Hook
 * 
 * Hook for managing orders with polling-based updates
 * - Fetch orders with filters
 * - Polling as a sync mechanism
 * - Optimistic updates
 * - Error handling
 * - TypeScript typing
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface UseOrdersOptions {
  filters?: {
    status?: string | string[];
    tableId?: string;
    userId?: string;
    restaurantId?: string;
    slug?: string;
  };
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const { filters, autoRefresh = false, refreshInterval = 30000 } = options;

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  /**
   * Fetch orders from API
   */
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          filters.status.forEach(s => params.append('status', s));
        } else {
          params.append('status', filters.status);
        }
      }
      if (filters?.tableId) params.append('tableId', filters.tableId);
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.restaurantId) params.append('restaurantId', filters.restaurantId);
      if (filters?.slug) params.append('slug', filters.slug);

      const response = await fetch(`/api/orders?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(message);
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Create new order
   */
  const createOrder = useCallback(async (orderData: any) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();

      toast({
        title: 'Success',
        description: 'Order created successfully',
      });

      return data.order;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create order',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  /**
   * Update order status
   */
  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const data = await response.json();
      return data.order;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  /**
   * Delete order
   */
  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      toast({
        title: 'Success',
        description: 'Order deleted successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete order',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Polling for updates (replaces Socket.io)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchOrders]);

  return {
    orders,
    loading,
    error,
    connected: false, // Legacy for UI compatibility
    refetch: fetchOrders,
    createOrder,
    updateOrderStatus,
    deleteOrder,
  };
}
