'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); // Move count here
  const { user, loading } = useAuth();
  const { addToast } = useToast();

  // Helper to play sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5; // 50% volume
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('🔊 Audio blocked. User must interact with page first.');
        });
      }
    } catch (err) {
      console.error('Audio setup error:', err);
    }
  };

  useEffect(() => {
    if (loading || !user?.id) return;

    // 1. Initialize Socket
    const newSocket = io(
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      {
        path: '/socket.io',
        transports: ['websocket'], // Force WebSocket for better performance
        reconnectionAttempts: 5,
      },
    );

    // 2. Connection Logic
    newSocket.on('connect', () => {
      console.log('✅ Socket Client Connected:', newSocket.id);
      // Join the room immediately upon connection
      newSocket.emit('join-room', user.id);
    });

    // 3. Listen for Incoming Notifications
    newSocket.on('notification', (data) => {
      console.log('🔔 REAL-TIME EVENT RECEIVED:', data);

      // A. Play Sound
      playNotificationSound();

      // B. Show Toast
      addToast(data.title, 'success');

      // C. Update Unread Count (Global State)
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket Connection Error:', err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, loading, addToast]);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
