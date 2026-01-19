/**
 * Socket.io Type Definitions
 * 
 * Type definitions for Socket.io events and payloads
 */

import { OrderStatus, UserRole } from './prisma';
import { OrderWithRelations } from './order';

/**
 * Order events
 */
export interface OrderCreatedEvent {
  order: OrderWithRelations;
}

export interface OrderStatusChangedEvent {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  previousStatus: OrderStatus;
  tableId: string;
  tableNumber: number;
  timestamp: Date;
  updatedBy: {
    id: string;
    name: string;
    role: UserRole;
  };
}

/**
 * Table events
 */
export interface TableStatusChangedEvent {
  tableId: string;
  tableNumber: number;
  status: string;
  previousStatus: string;
  waiterId: string | null;
}

/**
 * Socket event map for type safety
 * Use this interface to ensure type-safe Socket.io event handlers
 * 
 * Example usage:
 * ```typescript
 * socket.on('order:created', (data: OrderCreatedEvent) => { ... });
 * socket.on('order:status-changed', (data: OrderStatusChangedEvent) => { ... });
 * ```
 */
export interface SocketEvents {
  'order:created': (data: OrderCreatedEvent) => void;
  'order:status-changed': (data: OrderStatusChangedEvent) => void;
  'table:status-changed': (data: TableStatusChangedEvent) => void;
}
