/**
 * Socket.io API Route
 * 
 * Initialize and expose Socket.io server
 * - Next.js 14 App Router compatible
 * - Server initialization
 * - WebSocket upgrade handling
 */

import { NextRequest } from 'next/server';
import { getIO, isIOInitialized } from '@/lib/socket';

export async function GET(req: NextRequest) {
  try {
    // Check if Socket.io is initialized
    if (!isIOInitialized()) {
      return new Response(
        JSON.stringify({ error: 'Socket.io not initialized' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const io = getIO();
    
    // Get connected clients count
    const sockets = await io.fetchSockets();
    const connectedClients = sockets.length;

    return new Response(
      JSON.stringify({
        status: 'active',
        connectedClients,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Socket.io route error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
