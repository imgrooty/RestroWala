/**
 * useSocket Hook Stub
 * 
 * Stub implementation for Socket.io client hook
 * Note: Full Socket.io requires a custom server which is not compatible with Vercel's serverless architecture.
 * This stub prevents build errors while maintaining API compatibility.
 */

import { useEffect, useRef } from 'react';

export interface SocketStub {
  connected: boolean;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler: (...args: any[]) => void) => void;
  emit: (event: string, ...args: any[]) => void;
}

/**
 * useSocket hook
 * Returns a stub socket instance that maintains API compatibility
 * but doesn't establish real WebSocket connections
 */
export function useSocket(): SocketStub {
  const eventHandlers = useRef<Map<string, Set<Function>>>(new Map());

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Socket.io Stub] useSocket hook initialized - real-time features disabled in serverless mode');
    }

    return () => {
      // Cleanup
      eventHandlers.current.clear();
    };
  }, []);

  return {
    connected: false, // Always disconnected in stub
    on: (event: string, handler: (...args: any[]) => void) => {
      if (!eventHandlers.current.has(event)) {
        eventHandlers.current.set(event, new Set());
      }
      eventHandlers.current.get(event)?.add(handler);
    },
    off: (event: string, handler: (...args: any[]) => void) => {
      eventHandlers.current.get(event)?.delete(handler);
    },
    emit: (event: string, ...args: any[]) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket.io Stub] emit:', event, args);
      }
      // Stub - doesn't actually emit
    },
  };
}
