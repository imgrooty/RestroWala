/**
 * Kitchen Order Detail Page
 *
 * Detailed view of a single order for kitchen staff.
 * - Full item list with quantities & special instructions
 * - Live timer since order was placed
 * - Status action buttons (role-aware)
 * - Order notes
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import OrderTimer from '@/components/kitchen/OrderTimer';
import { STATUS_INFO, getNextStatuses, isOrderUrgent } from '@/lib/orderStateMachine';
import { OrderWithRelations } from '@/types/order';
import { OrderStatus, UserRole } from '@prisma/client';
import { format } from 'date-fns';

export default function KitchenOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      const data = await res.json();
      const raw = data.data ?? data.order ?? data;
      // Normalise date fields
      setOrder({
        ...raw,
        createdAt: new Date(raw.createdAt),
        updatedAt: new Date(raw.updatedAt),
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Could not load order details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const data = await res.json();
      const raw = data.data ?? data.order ?? data;
      setOrder({
        ...raw,
        createdAt: new Date(raw.createdAt),
        updatedAt: new Date(raw.updatedAt),
      });
      toast({ title: 'Success', description: `Order marked as ${STATUS_INFO[newStatus]?.label}` });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-16 w-16 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-slate-400 font-semibold text-lg">Order not found</p>
        <Button
          variant="ghost"
          className="text-slate-300 hover:text-white"
          onClick={() => router.back()}
        >
          Go back
        </Button>
      </div>
    );
  }

  const nextStatuses = getNextStatuses(order.status, UserRole.KITCHEN_STAFF);
  const urgent = isOrderUrgent({ status: order.status, createdAt: order.createdAt });
  const statusInfo = STATUS_INFO[order.status];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-slate-400 hover:text-white -ml-1"
        onClick={() => router.push('/kitchen/orders')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </Button>

      {/* Order header */}
      <div
        className={`bg-slate-800 rounded-3xl border ${
          urgent ? 'border-red-500/60' : 'border-slate-700'
        } p-6`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Table {order.table?.number}
              {order.table?.floor ? ` · ${order.table.floor}` : ''}
            </p>
            <h1 className="text-3xl font-black text-white">
              #{order.orderNumber}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Placed at {format(order.createdAt, 'MMM d, h:mm a')}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {urgent && (
              <span className="flex items-center gap-1 text-red-400 text-xs font-bold animate-pulse">
                <AlertCircle className="h-3.5 w-3.5" /> Urgent
              </span>
            )}
            <OrderTimer
              orderCreatedAt={order.createdAt}
              preparationTime={order.items.reduce(
                (max, i) => Math.max(max, i.menuItem?.preparationTime ?? 0),
                0
              )}
            />
            <Badge className="bg-slate-700 text-slate-200 font-bold border-none">
              {statusInfo?.label ?? order.status}
            </Badge>
          </div>
        </div>

        {order.notes && (
          <p className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2 text-yellow-200 text-sm">
            📝 {order.notes}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 space-y-4">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
          Order Items ({order.items.length})
        </h2>
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 bg-slate-900/50 rounded-xl p-3"
            >
              <span className="min-w-[32px] text-center bg-orange-500/20 text-orange-300 text-sm font-black rounded-lg px-1.5 py-1">
                {item.quantity}×
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">
                  {item.menuItem?.name ?? 'Unknown item'}
                </p>
                {item.menuItem?.preparationTime && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    ~{item.menuItem.preparationTime} min
                  </p>
                )}
                {item.specialInstructions && (
                  <p className="text-xs text-yellow-300 mt-1 font-medium">
                    ⚡ {item.specialInstructions}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Status Actions */}
      {nextStatuses.length > 0 && (
        <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 space-y-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
            Update Status
          </h2>
          <div className="flex flex-wrap gap-3">
            {nextStatuses.map((s) => {
              const isReady = s === 'READY';
              return (
                <Button
                  key={s}
                  disabled={isUpdating}
                  onClick={() => handleStatusChange(s)}
                  className={`flex-1 font-bold ${
                    isReady
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-orange-500 hover:bg-orange-400 text-white'
                  }`}
                >
                  Mark as {STATUS_INFO[s]?.label ?? s}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

