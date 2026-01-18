// pages/api/socket.js
import { Server } from 'socket.io';

export default function SocketHandler(req, res) {
  if (res.socket.server.io) {
    res.end();
    return;
  }

  const io = new Server(res.socket.server, {
    path: '/api/socket', // This matches your frontend now
    addTrailingSlash: false,
    cors: { origin: '*' }, // Secure this in production
  });

  res.socket.server.io = io;

  io.on('connection', (socket) => {
    socket.on('join-room', (userId) => {
      socket.join(userId);
    });
  });

  console.log('socket.io initialized');
  res.end();
}