import { Server } from 'socket.io';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. 🛡️ SELF-HEALING: If Socket.io is missing, initialize it immediately!
  if (!res.socket.server.io) {
    console.log('⚡ Lazy Initializing Socket.io server...');

    const io = new Server(res.socket.server, {
      path: '/api/socket', // Must match frontend path
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    res.socket.server.io = io;
  }

  // 2. Now it is guaranteed to exist
  const io = res.socket.server.io;
  const { userId, event, data } = req.body;

  console.log(`📡 Dispatching: ${event} to ${userId}`);

  // 3. Send the message
  if (userId === 'BROADCAST_ALL') {
    io.emit(event, data);
  } else {
    io.to(userId).emit(event, data);
  }

  res.status(200).json({ success: true, message: 'Event dispatched' });
}
