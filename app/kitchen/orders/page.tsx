/**
 * Kitchen Orders Page (Kitchen Display System - KDS)
 * 
 * Kitchen display system for managing orders
 * - Kanban-style board layout
 * - Real-time order updates
 * - Sound notifications for new orders
 * - Color-coded by wait time
 * - Item-level status tracking
 * - Filter by preparation time
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Clock, CheckCircle2, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import OrderCard from '@/components/shared/OrderCard';
import { useOrders } from '@/hooks/useOrders';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/components/ui/use-toast';
import { OrderWithRelations } from '@/types/order';
import { UserRole } from '@prisma/client';
import {
  isOrderUrgent,
} from '@/lib/orderStateMachine';
import { apiClient } from '@/lib/api-client';

export default function KitchenOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for notifications
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.7;
  }, []);

  // useOrders hook with auto-refresh every 30 seconds (fallback)
  const { orders: allOrders, loading: ordersLoading, refetch } = useOrders({
    autoRefresh: true,
    refreshInterval: 30000,
  });

  const { on } = useSocket();

  useEffect(() => {
    on('order:created', () => {
      refetch();
      if (audioRef.current) audioRef.current.play().catch(() => { });
      toast({ title: 'New Order', description: 'A new order has been placed' });
    });

    on('order:status-changed', () => {
      refetch();
    });
  }, [on, refetch, toast]);

  // Use allOrders and filter them
  useEffect(() => {
    if (!ordersLoading && allOrders) {
      setOrders(
        allOrders
          .filter((o) =>
            ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status)
          )
          .map((o) => {
            const createdAt = o.createdAt instanceof Date
              ? o.createdAt
              : (typeof o.createdAt === 'string' || typeof o.createdAt === 'number')
                ? new Date(o.createdAt)
                : new Date(0);
            const updatedAt = o.updatedAt instanceof Date
              ? o.updatedAt
              : (typeof o.updatedAt === 'string' || typeof o.updatedAt === 'number')
                ? new Date(o.updatedAt)
                : new Date(0);
            return { ...o, createdAt, updatedAt };
          })
      );
      setIsLoading(false);
    }
    if (!ordersLoading && !allOrders) {
      setOrders([]);
      setIsLoading(false);
    }
  }, [allOrders, ordersLoading]);

  const handleStatusChange = async (orderId: string, newStatus: any) => {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast({
        title: 'Success',
        description: 'Order status updated',
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (orderId: string) => {
    router.push(`/kitchen/orders/${orderId}`);
  };

  // Group orders by status
  const ordersByStatus = {
    PENDING: orders.filter((o) => o.status === 'PENDING'),
    CONFIRMED: orders.filter((o) => o.status === 'CONFIRMED'),
    PREPARING: orders.filter((o) => o.status === 'PREPARING'),
    READY: orders.filter((o) => o.status === 'READY'),
  };

  // Sort orders by urgency (oldest first)
  const sortByUrgency = (orders: OrderWithRelations[]) => {
    return [...orders].sort((a, b) => {
      const aUrgent = isOrderUrgent({ status: a.status, createdAt: a.createdAt });
      const bUrgent = isOrderUrgent({ status: b.status, createdAt: b.createdAt });
      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 space-y-8">
      {/* High-Visibility Command Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">
            <ChefHat className="h-3 w-3" /> Kitchen Intelligence Active
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter italic">KDS <span className="text-slate-700 leading-none">ALPHA</span></h1>
          <p className="text-slate-500 font-bold text-lg uppercase tracking-widest">
            Synchronized • {orders.length} ACTIVE COMMANDS
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-800/50 backdrop-blur-md p-4 rounded-3xl border border-slate-700 flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency</p>
              <p className="text-2xl font-black text-emerald-400">98%</p>
            </div>
            <div className="h-8 w-[2px] bg-slate-700" />
            <div className="h-12 w-12 rounded-2xl bg-slate-700 flex items-center justify-center text-slate-400">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <div className="h-24 w-24 border-8 border-slate-800 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-black text-xl uppercase tracking-[0.4em]">Linking Feed...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Pending Column */}
          <div className="space-y-6">
            <div className="bg-rose-600/10 backdrop-blur-sm p-6 rounded-[2.5rem] border border-rose-500/20 shadow-2xl shadow-rose-500/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-rose-400 flex items-center gap-3 italic uppercase tracking-tighter">
                  <Clock className="h-7 w-7" />
                  Incoming
                </h2>
                <Badge className="bg-rose-500 text-white border-none px-4 py-1.5 rounded-full font-black text-sm shadow-lg shadow-rose-500/20">
                  {ordersByStatus.PENDING.length}
                </Badge>
              </div>
              <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto px-1 scrollbar-hide">
                {sortByUrgency(ordersByStatus.PENDING).map((order) => (
                  <div key={order.id} className="animate-in zoom-in-95 duration-500">
                    <OrderCard
                      order={order}
                      userRole={UserRole.KITCHEN_STAFF}
                      onStatusChange={handleStatusChange}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                ))}
                {ordersByStatus.PENDING.length === 0 && (
                  <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-[2rem]">
                    <p className="text-slate-600 font-black text-xs uppercase tracking-widest">No New Orders</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Confirmed Column */}
          <div className="space-y-6">
            <div className="bg-indigo-600/10 backdrop-blur-sm p-6 rounded-[2.5rem] border border-indigo-500/20 shadow-2xl shadow-indigo-500/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-indigo-400 flex items-center gap-3 italic uppercase tracking-tighter">
                  <Clock className="h-7 w-7" />
                  Buffered
                </h2>
                <Badge className="bg-indigo-500 text-white border-none px-4 py-1.5 rounded-full font-black text-sm shadow-lg shadow-indigo-500/20">
                  {ordersByStatus.CONFIRMED.length}
                </Badge>
              </div>
              <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto px-1 scrollbar-hide">
                {sortByUrgency(ordersByStatus.CONFIRMED).map((order) => (
                  <div key={order.id} className="animate-in zoom-in-95 duration-500">
                    <OrderCard
                      order={order}
                      userRole={UserRole.KITCHEN_STAFF}
                      onStatusChange={handleStatusChange}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                ))}
                {ordersByStatus.CONFIRMED.length === 0 && (
                  <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-[2rem]">
                    <p className="text-slate-600 font-black text-xs uppercase tracking-widest">Feed Empty</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preparing Column */}
          <div className="space-y-6">
            <div className="bg-orange-600/10 backdrop-blur-sm p-6 rounded-[2.5rem] border border-orange-500/20 shadow-2xl shadow-orange-500/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-orange-400 flex items-center gap-3 italic uppercase tracking-tighter">
                  <ChefHat className="h-7 w-7" />
                  Thermal Process
                </h2>
                <Badge className="bg-orange-500 text-white border-none px-4 py-1.5 rounded-full font-black text-sm shadow-lg shadow-orange-500/20 animate-pulse">
                  {ordersByStatus.PREPARING.length}
                </Badge>
              </div>
              <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto px-1 scrollbar-hide">
                {sortByUrgency(ordersByStatus.PREPARING).map((order) => (
                  <div key={order.id} className="animate-in zoom-in-95 duration-500">
                    <OrderCard
                      order={order}
                      userRole={UserRole.KITCHEN_STAFF}
                      onStatusChange={handleStatusChange}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                ))}
                {ordersByStatus.PREPARING.length === 0 && (
                  <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-[2rem]">
                    <p className="text-slate-600 font-black text-xs uppercase tracking-widest">Station Idle</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ready Column */}
          <div className="space-y-6">
            <div className="bg-emerald-600/10 backdrop-blur-sm p-6 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-emerald-400 flex items-center gap-3 italic uppercase tracking-tighter">
                  <CheckCircle2 className="h-7 w-7" />
                  Output Ready
                </h2>
                <Badge className="bg-emerald-500 text-white border-none px-4 py-1.5 rounded-full font-black text-sm shadow-lg shadow-emerald-500/20">
                  {ordersByStatus.READY.length}
                </Badge>
              </div>
              <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto px-1 scrollbar-hide">
                {sortByUrgency(ordersByStatus.READY).map((order) => (
                  <div key={order.id} className="animate-in zoom-in-95 duration-500">
                    <OrderCard
                      order={order}
                      userRole={UserRole.KITCHEN_STAFF}
                      onStatusChange={handleStatusChange}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                ))}
                {ordersByStatus.READY.length === 0 && (
                  <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-[2rem]">
                    <p className="text-slate-600 font-black text-xs uppercase tracking-widest">Standby</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
