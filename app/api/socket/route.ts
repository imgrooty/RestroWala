import { NextResponse } from 'next/server';
import { isIOInitialized, getIO } from '../../../lib/socket';

export const dynamic = 'force-dynamic';

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
