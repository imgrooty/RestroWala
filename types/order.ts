/**
 * Order Related Types
 * 
 * Types for orders, order items, and related data
 */

import {
  Order as LocalOrder,
  OrderItem as LocalOrderItem,
  OrderStatus
} from './prisma';

// Extended Order with relations
export interface OrderWithRelations extends LocalOrder {
  items: OrderItemWithRelations[];
  table: any;
  user?: any;
  payment?: any;
}

// Extended OrderItem with relations
export interface OrderItemWithRelations extends LocalOrderItem {
  menuItem: any;
}

// Create order data
export interface CreateOrderData {
  tableId: string;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  notes?: string;
  customerName?: string;
  customerPhone?: string;
}

// Update order status
export interface UpdateOrderStatusData {
  status: OrderStatus;
  notes?: string;
}

// Order filters
export interface OrderFilters {
  status?: OrderStatus;
  tableId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

// Order summary for dashboard
export interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}
