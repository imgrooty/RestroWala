import { OrderStatus } from './prisma';

export interface OrderStatusChangedData {
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
        role: string;
    };
}

export interface TableStatusChangedData {
    tableId: string;
    tableNumber: number;
    status: string;
    previousStatus: string;
    waiterId: string | null;
}

export interface OrderCreatedData {
    order: any; // Using any for simplicity as OrderWithRelations might be circular
}

export interface ServerToClientEvents {
    'order:created': (data: OrderCreatedData) => void;
    'order:status-changed': (data: OrderStatusChangedData) => void;
    'table:status-changed': (data: TableStatusChangedData) => void;
}

export interface ClientToServerEvents {
    // Add client to server events if needed
}
