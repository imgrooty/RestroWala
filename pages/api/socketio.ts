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

export default function handler(_req: NextApiRequest, res: NextApiResponseWithSocket) {
    if (res.socket.server.io) {
        console.log('Socket is already running');
    } else {
        console.log('Socket is initializing...');
        res.socket.server.io = initIO(res.socket.server);
    }
    res.status(200).json({ ok: true, initialized: true });
}
