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

/**
 * Manages fetching and CRUD operations for orders with optional polling support.
 *
 * Accepts an options object to apply server-side filters and enable automatic refresh.
 *
 * @param options - Configuration for the hook:
 *   - `filters` (optional): query filters to apply when fetching orders; may include `status` (string or string[]), `tableId`, `userId`, `restaurantId`, and `slug`.
 *   - `autoRefresh` (optional): when `true`, periodically refetches orders at `refreshInterval`.
 *   - `refreshInterval` (optional): polling interval in milliseconds (default 30000).
 * @returns An object containing:
 *   - `orders`: the current array of orders.
 *   - `loading`: `true` while a fetch is in progress, `false` otherwise.
 *   - `error`: an error message when a fetch fails, or `null`.
 *   - `connected`: a legacy compatibility flag (always `false`).
 *   - `refetch`: function to re-run the orders fetch.
 *   - `createOrder`: function to create a new order; returns the created order object from the API response.
 *   - `updateOrderStatus`: function to update an order's status; returns the updated order object from the API response.
 *   - `deleteOrder`: function to delete an order.
 */
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
          params.append('statuses', filters.status.join(','));
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
      setOrders(data.data || data.orders || []);
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

      return data.data || data.order;
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
      return data.data || data.order;
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
