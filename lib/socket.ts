import { Server as NetServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { OrderStatus } from '../types/prisma';

// Use a global variable to persist the IO instance across HMR in development
declare global {
    var io: IOServer | undefined;
}

export const isIOInitialized = () => {
    return !!global.io;
};

export const getIO = () => {
    if (!global.io) {
        throw new Error('Socket.io not initialized. Call initIO first.');
    }
    return global.io;
};

/**
 * Initializes the Socket.io server.
 * Note: In Next.js App Router, this usually needs a workaround to get the HTTP server instance.
 */
export const initIO = (server: NetServer) => {
    if (global.io) {
        console.log('Socket.io already initialized');
        return global.io;
    }

    console.log('Initializing Socket.io server...');
    const io = new IOServer(server, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    global.io = io;
    return io;
};

// --- Event Emitters ---

export const emitOrderStatusChanged = (data: {
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
}) => {
    if (!global.io) {
        console.warn('Cannot emit order status change: Socket.io not initialized');
        return;
    }
    global.io.emit('order:status-changed', data);
};

export const emitTableStatusChanged = (data: {
    tableId: string;
    tableNumber: number;
    status: string;
    previousStatus: string;
    waiterId: string | null;
}) => {
    if (!global.io) {
        console.warn('Cannot emit table status change: Socket.io not initialized');
        return;
    }
    global.io.emit('table:status-changed', data);
};

export const emitOrderCreated = (data: { order: any }) => {
    if (!global.io) {
        console.warn('Cannot emit order creation: Socket.io not initialized');
        return;
    }
    global.io.emit('order:created', data);
};
