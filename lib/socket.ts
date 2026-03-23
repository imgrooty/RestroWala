import { Server as NetServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { OrderStatus } from '../types/prisma';

// Use a global variable to persist the IO instance across HMR in development
declare global {
    // eslint-disable-next-line no-var
    let io: IOServer | undefined;
}

const globalForIO = globalThis as typeof globalThis & { io?: IOServer };

export const isIOInitialized = () => {
    return !!globalForIO.io;
};

export const getIO = () => {
    if (!globalForIO.io) {
        throw new Error('Socket.io not initialized. Call initIO first.');
    }
    return globalForIO.io;
};

/**
 * Initializes the Socket.io server.
 * Note: In Next.js App Router, this usually needs a workaround to get the HTTP server instance.
 */
export const initIO = (server: NetServer) => {
    if (globalForIO.io) {
        console.log('Socket.io already initialized');
        return globalForIO.io;
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

    globalForIO.io = io;
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
    if (!globalForIO.io) {
        console.warn('Cannot emit order status change: Socket.io not initialized');
        return;
    }
    globalForIO.io.emit('order:status-changed', data);
};

export const emitTableStatusChanged = (data: {
    tableId: string;
    tableNumber: number;
    status: string;
    previousStatus: string;
    waiterId: string | null;
}) => {
    if (!globalForIO.io) {
        console.warn('Cannot emit table status change: Socket.io not initialized');
        return;
    }
    globalForIO.io.emit('table:status-changed', data);
};

export const emitOrderCreated = (data: { order: any }) => {
    if (!globalForIO.io) {
        console.warn('Cannot emit order creation: Socket.io not initialized');
        return;
    }
    globalForIO.io.emit('order:created', data);
};
