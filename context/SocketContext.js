'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { user, loading } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (loading || !user || !user.id) return;

    // 1. Force a clean connection
    const newSocket = io(
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      {
        path: '/socket.io',
        // These options help with stability
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      },
    );

    // 2. Robust Room Joining Logic
    const joinRoom = () => {
      console.log('🔌 Socket connected! Joining room:', user.id);
      newSocket.emit('join-room', user.id);
    };

    if (newSocket.connected) {
      joinRoom(); // If already connected, join immediately
    }

    newSocket.on('connect', joinRoom); // If connecting now, join when ready

    // 3. Handle Notifications & Sound
    newSocket.on('notification', (data) => {
      console.log('🔔 Notification received:', data);

      // Play Sound
      const audio = new Audio('/sounds/notification.mp3');
      audio
        .play()
        .catch((err) => console.log('Audio blocked by browser:', err));

      // Show Toast
      addToast(data.title, 'success');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, loading, addToast]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
