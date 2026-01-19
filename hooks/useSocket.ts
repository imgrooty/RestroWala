'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
    const [connected, setConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Proactively initialize the server-side socket
        fetch('/api/socketio').catch(err => console.error('Failed to init socket server:', err));

        // Initialize the socket-client
        // The path must match the server-side initialization
        const socketInstance = io(process.env.NEXT_PUBLIC_SITE_URL || '', {
            path: '/api/socket',
            addTrailingSlash: false,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected');
            setConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
        });

        socketInstance.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        socketRef.current = socketInstance;

        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, []);

    return {
        socket: socketRef.current,
        connected,
        on: (event: string, callback: (...args: any[]) => void) => {
            socketRef.current?.on(event, callback);
        },
        off: (event: string, callback: (...args: any[]) => void) => {
            socketRef.current?.off(event, callback);
        },
        emit: (event: string, ...args: any[]) => {
            socketRef.current?.emit(event, ...args);
        }
    };
};
