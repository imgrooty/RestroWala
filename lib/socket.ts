/**
 * Socket.io Server Stub
 * 
 * Stub implementation for Socket.io functionality
 * Note: Full Socket.io requires a custom server which is not compatible with Vercel's serverless architecture.
 * This stub prevents build errors while maintaining API compatibility.
 */

import { OrderStatusChangedEvent, TableStatusChangedEvent } from '@/types/socket';

// Mock Socket.io server instance
let ioInstance: any = null;

/**
 * Get Socket.io server instance
 * Returns a stub implementation
 */
export function getIO() {
  if (!ioInstance) {
    ioInstance = {
      fetchSockets: async () => [],
      emit: () => {},
      to: () => ({
        emit: () => {},
      }),
    };
  }
  return ioInstance;
}

/**
 * Check if Socket.io is initialized
 * Always returns false in serverless environment
 */
export function isIOInitialized(): boolean {
  return false;
}

/**
 * Emit order status changed event
 * Stub implementation - logs to console in development
 */
export function emitOrderStatusChanged(data: OrderStatusChangedEvent): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Socket.io Stub] Order status changed:', data);
  }
  // In a full implementation, this would emit via Socket.io
  // For serverless, consider using alternative real-time solutions like:
  // - Pusher
  // - Ably
  // - Server-Sent Events
  // - Polling
}

/**
 * Emit table status changed event
 * Stub implementation - logs to console in development
 */
export function emitTableStatusChanged(data: TableStatusChangedEvent): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Socket.io Stub] Table status changed:', data);
  }
  // In a full implementation, this would emit via Socket.io
}
