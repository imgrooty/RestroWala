/**
 * Order State Machine
 * 
 * Defines valid order status transitions and business rules
 * - State validation
 * - Transition rules
 * - Role-based permissions
 * - Timestamp management
 */

import { OrderStatus, UserRole } from '@/types/prisma';

// Valid state transitions
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['SERVED', 'CANCELLED'],
  SERVED: ['COMPLETED'],
  COMPLETED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

// Role-based permissions for status changes
const ROLE_PERMISSIONS: Record<UserRole, OrderStatus[]> = {
  CUSTOMER: ['CANCELLED'], // Can only cancel pending orders
  WAITER: ['CONFIRMED', 'SERVED', 'CANCELLED'], // Can confirm, serve, or cancel
  CASHIER: ['SERVED', 'COMPLETED', 'CANCELLED'], // Can complete orders (payment)
  KITCHEN_STAFF: ['PREPARING', 'READY'], // Can start preparing and mark ready
  MANAGER: Object.values(OrderStatus), // Can change to any status
  ADMIN: Object.values(OrderStatus), // Can change to any status
};

// Status display information
export const STATUS_INFO: Record<
  OrderStatus,
  { label: string; color: string; icon: string; description: string }
> = {
  PENDING: {
    label: 'Pending',
    color: 'yellow',
    icon: 'clock',
    description: 'Order placed, awaiting confirmation',
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'blue',
    icon: 'check-circle',
    description: 'Order confirmed by waiter',
  },
  PREPARING: {
    label: 'Preparing',
    color: 'orange',
    icon: 'chef-hat',
    description: 'Being prepared in kitchen',
  },
  READY: {
    label: 'Ready',
    color: 'green',
    icon: 'check',
    description: 'Ready to be served',
  },
  SERVED: {
    label: 'Served',
    color: 'purple',
    icon: 'tray',
    description: 'Delivered to customer',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'gray',
    icon: 'check-double',
    description: 'Order completed and paid',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'red',
    icon: 'x-circle',
    description: 'Order cancelled',
  },
};

/**
 * Check if a status transition is valid
 */
export function canTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  return TRANSITIONS[currentStatus].includes(newStatus);
}

/**
 * Check if a user role can change order to a specific status
 */
export function canChangeStatus(
  role: UserRole,
  newStatus: OrderStatus
): boolean {
  return ROLE_PERMISSIONS[role].includes(newStatus);
}

/**
 * Validate status transition with role check
 */
export function validateTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
  userRole: UserRole
): { valid: boolean; error?: string } {
  // Check if transition is valid
  if (!canTransition(currentStatus, newStatus)) {
    return {
      valid: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}`,
    };
  }

  // Check if user role has permission
  if (!canChangeStatus(userRole, newStatus)) {
    return {
      valid: false,
      error: `Role ${userRole} cannot change status to ${newStatus}`,
    };
  }

  return { valid: true };
}

/**
 * Get next possible statuses for an order
 */
export function getNextStatuses(
  currentStatus: OrderStatus,
  userRole: UserRole
): OrderStatus[] {
  const possibleStatuses = TRANSITIONS[currentStatus];
  return possibleStatuses.filter((status) =>
    canChangeStatus(userRole, status)
  );
}

/**
 * Get status color class for Tailwind
 */
export function getStatusColor(status: OrderStatus): string {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
    red: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[STATUS_INFO[status].color] || colors.gray;
}

/**
 * Get status badge variant
 */
export function getStatusBadgeVariant(status: OrderStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PENDING':
      return 'secondary';
    case 'CONFIRMED':
      return 'default';
    case 'PREPARING':
      return 'default';
    case 'READY':
      return 'default';
    case 'SERVED':
      return 'secondary';
    case 'COMPLETED':
      return 'outline';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'default';
  }
}

/**
 * Calculate wait time in minutes
 */
export function calculateWaitTime(createdAt: Date, status: OrderStatus): number {
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  // Terminal states don't count wait time
  if (status === 'COMPLETED' || status === 'CANCELLED') {
    return 0;
  }

  return diffMinutes;
}

/**
 * Get wait time color based on duration
 */
export function getWaitTimeColor(waitMinutes: number): string {
  if (waitMinutes < 5) return 'text-green-600';
  if (waitMinutes < 15) return 'text-yellow-600';
  if (waitMinutes < 30) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Check if order needs attention (urgent)
 */
export function isOrderUrgent(order: {
  status: OrderStatus;
  createdAt: Date;
}): boolean {
  const waitMinutes = calculateWaitTime(order.createdAt, order.status);

  // Urgent if:
  // - Pending for more than 10 minutes
  // - Ready for more than 5 minutes
  // - Preparing for more than 30 minutes
  if (order.status === 'PENDING' && waitMinutes > 10) return true;
  if (order.status === 'READY' && waitMinutes > 5) return true;
  if (order.status === 'PREPARING' && waitMinutes > 30) return true;

  return false;
}

/**
 * Get order priority level
 */
export function getOrderPriority(order: {
  status: OrderStatus;
  createdAt: Date;
}): 'low' | 'medium' | 'high' | 'urgent' {
  const waitMinutes = calculateWaitTime(order.createdAt, order.status);

  if (isOrderUrgent(order)) return 'urgent';
  if (waitMinutes > 20) return 'high';
  if (waitMinutes > 10) return 'medium';
  return 'low';
}
