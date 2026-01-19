import { NextApiRequest, NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { initIO } from '@/lib/socket';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default function handler(_req: NextApiRequest, res: NextApiResponse & { socket: { server: NetServer } }) {
    if ((res.socket.server as any).io) {
        console.log('Socket is already running');
    } else {
        console.log('Socket is initializing...');
        initIO(res.socket.server);
    }
    res.end();
}
