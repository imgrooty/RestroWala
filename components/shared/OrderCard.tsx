/**
 * Order Card Component
 * 
 * Reusable order card component for displaying orders
 * - Order details and status
 * - Color-coded by wait time
 * - Action buttons based on role
 * - Real-time updates
 */

'use client';

import { useState } from 'react';
import { Clock, MoreVertical, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OrderWithRelations } from '@/types/order';
import {
  STATUS_INFO,
  getStatusColor,
  getStatusBadgeVariant,
  calculateWaitTime,
  getWaitTimeColor,
  isOrderUrgent,
  getOrderPriority,
  getNextStatuses,
} from '@/lib/orderStateMachine';
import { OrderStatus, UserRole } from '@prisma/client';
import { format } from 'date-fns';

interface OrderCardProps {
  order: OrderWithRelations;
  userRole: UserRole;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
  onViewDetails?: (orderId: string) => void;
  showActions?: boolean;
  /** Use 'dark' for dark-background dashboards like the kitchen display */
  variant?: 'light' | 'dark';
}

export default function OrderCard({
  order,
  userRole,
  onStatusChange,
  onViewDetails,
  showActions = true,
  variant = 'light',
}: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const statusInfo = STATUS_INFO[order.status];
  const waitMinutes = calculateWaitTime(order.createdAt, order.status);
  const isUrgent = isOrderUrgent({ status: order.status, createdAt: order.createdAt });
  const priority = getOrderPriority({ status: order.status, createdAt: order.createdAt });
  const nextStatuses = getNextStatuses(order.status, userRole);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!onStatusChange) return;

    setIsUpdating(true);
    try {
      await onStatusChange(order.id, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityColor = () => {
    if (variant === 'dark') {
      switch (priority) {
        case 'urgent':
          return 'border-red-500 bg-slate-900';
        case 'high':
          return 'border-orange-500 bg-slate-900';
        case 'medium':
          return 'border-yellow-500 bg-slate-900';
        default:
          return 'border-slate-700 bg-slate-800';
      }
    }
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div
      className={`rounded-lg border-2 p-4 shadow-sm transition-all hover:shadow-md ${getPriorityColor()} ${
        isUrgent ? 'animate-pulse' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold text-lg ${variant === 'dark' ? 'text-white' : ''}`}>
              Order #{order.orderNumber}
            </h3>
            {isUrgent && (
              <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
            )}
          </div>
          <div className={`flex items-center gap-2 text-sm ${variant === 'dark' ? 'text-slate-400' : 'text-muted-foreground'}`}>
            <span>Table {order.table.number}</span>
            {order.table.floor && <span>• {order.table.floor}</span>}
            {order.user && <span>• {order.user.name}</span>}
          </div>
        </div>

        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${variant === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-700' : ''}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewDetails && (
                <DropdownMenuItem onClick={() => onViewDetails(order.id)}>
                  View Details
                </DropdownMenuItem>
              )}
              {nextStatuses.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isUpdating}
                >
                  Change to {STATUS_INFO[status].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-3">
        <Badge variant={getStatusBadgeVariant(order.status)} className={getStatusColor(order.status)}>
          {statusInfo.label}
        </Badge>
        <div className={`flex items-center gap-1 text-sm ${getWaitTimeColor(waitMinutes)}`}>
          <Clock className="h-3 w-3" />
          <span>{waitMinutes}m</span>
        </div>
        {priority !== 'low' && (
          <Badge
            variant="outline"
            className={`text-xs capitalize ${variant === 'dark' ? 'border-slate-600 text-slate-300' : ''}`}
          >
            {priority}
          </Badge>
        )}
      </div>

      {/* Order Items */}
      <div className="space-y-2 mb-3">
        {order.items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className={`font-medium ${variant === 'dark' ? 'text-white' : ''}`}>{item.quantity}x</span>
              <span className={variant === 'dark' ? 'text-slate-300' : ''}>{item.menuItem.name}</span>
            </span>
            <span className={variant === 'dark' ? 'text-slate-400' : 'text-muted-foreground'}>
              ${item.subtotal.toFixed(2)}
            </span>
          </div>
        ))}
        {order.items.length > 3 && (
          <div className={`text-xs ${variant === 'dark' ? 'text-slate-500' : 'text-muted-foreground'}`}>
            +{order.items.length - 3} more items
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between pt-3 border-t ${variant === 'dark' ? 'border-slate-700' : ''}`}>
        <div className="text-sm">
          <div className={`font-semibold ${variant === 'dark' ? 'text-white' : ''}`}>
            ${order.finalAmount.toFixed(2)}
          </div>
          <div className={variant === 'dark' ? 'text-slate-500' : 'text-muted-foreground'}>
            {format(new Date(order.createdAt), 'MMM d, h:mm a')}
          </div>
        </div>

        {/* Quick Actions */}
        {showActions && nextStatuses.length > 0 && (
          <div className="flex gap-2">
            {nextStatuses.slice(0, 2).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={variant === 'dark' ? 'default' : 'outline'}
                onClick={() => handleStatusChange(status)}
                disabled={isUpdating}
                className={`text-xs ${variant === 'dark' ? 'bg-orange-500 hover:bg-orange-400 text-white border-none' : ''}`}
              >
                {STATUS_INFO[status].label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className={`mt-3 pt-3 border-t ${variant === 'dark' ? 'border-slate-700' : ''}`}>
          <p className={`text-xs italic ${variant === 'dark' ? 'text-slate-400' : 'text-muted-foreground'}`}>
            {order.notes}
          </p>
        </div>
      )}
    </div>
  );
}
