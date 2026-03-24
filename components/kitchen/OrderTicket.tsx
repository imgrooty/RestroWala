/**
 * Order Ticket Component
 *
 * Kitchen-facing ticket view of a single order.
 * Displays all items, special instructions, a live timer and status action buttons.
 */

'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChefHat, CheckCircle2 } from 'lucide-react';
import OrderTimer from './OrderTimer';
import { STATUS_INFO, getNextStatuses, isOrderUrgent } from '@/lib/orderStateMachine';
import { OrderStatus, UserRole } from '@prisma/client';
import { OrderWithRelations } from '@/types/order';

interface OrderTicketProps {
  order: OrderWithRelations;
  userRole?: UserRole;
  onStatusChange?: (orderId: string, status: OrderStatus) => Promise<void>;
}

export default function OrderTicket({
  order,
  userRole = UserRole.KITCHEN_STAFF,
  onStatusChange,
}: OrderTicketProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const nextStatuses = getNextStatuses(order.status, userRole);
  const urgent = isOrderUrgent({ status: order.status, createdAt: new Date(order.createdAt) });

  const handle = async (status: OrderStatus) => {
    if (!onStatusChange) return;
    setIsUpdating(true);
    try {
      await onStatusChange(order.id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`bg-slate-800 rounded-2xl border ${
        urgent ? 'border-red-500/60' : 'border-slate-700'
      } p-4 space-y-3`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Table {order.table?.number}
          </p>
          <h3 className="text-lg font-black text-white">#{order.orderNumber}</h3>
        </div>
        <div className="flex items-center gap-2">
          {urgent && <AlertCircle className="h-4 w-4 text-red-400 animate-pulse" />}
          <OrderTimer
            orderCreatedAt={order.createdAt}
            preparationTime={order.items.reduce(
              (max, i) => Math.max(max, i.menuItem?.preparationTime ?? 0),
              0
            )}
          />
        </div>
      </div>

      {/* Items */}
      <ul className="space-y-2 border-t border-slate-700 pt-3">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-start gap-2">
            <span className="min-w-[24px] text-center bg-orange-500/20 text-orange-300 text-xs font-black rounded px-1 py-0.5">
              {item.quantity}×
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {item.menuItem?.name ?? 'Unknown item'}
              </p>
              {item.specialInstructions && (
                <p className="text-xs text-yellow-300 mt-0.5">
                  ⚡ {item.specialInstructions}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Notes */}
      {order.notes && (
        <p className="text-xs text-slate-400 italic border-t border-slate-700 pt-2">
          📝 {order.notes}
        </p>
      )}

      {/* Status badge */}
      <div className="flex items-center gap-2 border-t border-slate-700 pt-2">
        <Badge className="bg-slate-700 text-slate-200 text-[10px] font-bold border-none">
          {STATUS_INFO[order.status]?.label ?? order.status}
        </Badge>
      </div>

      {/* Actions */}
      {nextStatuses.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {nextStatuses.map((s) => {
            const isReady = s === 'READY';
            return (
              <Button
                key={s}
                size="sm"
                disabled={isUpdating}
                onClick={() => handle(s)}
                className={`flex-1 text-xs font-bold ${
                  isReady
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-orange-500 hover:bg-orange-400 text-white'
                }`}
              >
                {isReady ? (
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <ChefHat className="h-3.5 w-3.5 mr-1" />
                )}
                {STATUS_INFO[s]?.label ?? s}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
