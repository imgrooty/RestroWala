import { NextApiRequest, NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { initIO } from '@/lib/socket';

export const config = {
    api: {
        bodyParser: false,
    },
};

type NextApiResponseWithSocket = NextApiResponse & {
    socket: {
        server: NetServer & {
            io?: IOServer;
        };
    };
};

/**
 * Initializes a Socket.IO server on the underlying HTTP server for this Next.js API route if one is not already present.
 *
 * If a Socket.IO server is created, it is assigned to `res.socket.server.io`. The handler always responds with
 * HTTP 200 and a JSON body `{ ok: true, initialized: true }`.
 *
 * @param res - Next.js response whose `socket.server` may receive an `io` property when initialization occurs
 */
export default function handler(_req: NextApiRequest, res: NextApiResponseWithSocket) {
    if (res.socket.server.io) {
        console.log('Socket is already running');
    } else {
        console.log('Socket is initializing...');
        res.socket.server.io = initIO(res.socket.server);
    }
    res.status(200).json({ ok: true, initialized: true });
}
