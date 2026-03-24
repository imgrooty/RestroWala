import { NextResponse } from 'next/server';
import { isIOInitialized, getIO } from '../../../lib/socket';

export const dynamic = 'force-dynamic';

/**
 * Report Socket.io server status and connected client count.
 *
 * When Socket.io is not initialized, responds with JSON containing `status: 'inactive'`,
 * a human-readable `message` instructing to call `/api/socketio`, and `initEndpoint: '/api/socketio'`.
 * When initialized, responds with JSON containing `status: 'active'`, `connectedClients` (the number of currently connected sockets),
 * and `timestamp` (ISO 8601 string of the response time). On error, responds with `{ error: 'Internal server error' }` and HTTP 500.
 *
 * @returns A JSON HTTP response describing the Socket.io status as explained above.
 */
export async function GET() {
  try {
    if (!isIOInitialized()) {
      return NextResponse.json(
        {
          status: 'inactive',
          message: 'Socket.io not yet initialized. Call /api/socketio once to bootstrap the server.',
          initEndpoint: '/api/socketio',
        },
        { status: 200 }
      );
    }

    const io = getIO();
    const sockets = await io.fetchSockets();

    return NextResponse.json({
      status: 'active',
      connectedClients: sockets.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Socket.io status route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
