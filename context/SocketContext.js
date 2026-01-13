'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
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
    // 👇 CHANGE 1: Allow guests to connect (Removed !user?.id check)
    if (loading) return;

    // 1. Initialize Socket
    const newSocket = io(
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      {
        path: '/socket.io',
        transports: ['websocket'],
        reconnectionAttempts: 5,
      },
    );

    // 2. Connection Logic
    newSocket.on('connect', () => {
      console.log('✅ Socket Client Connected:', newSocket.id);

      // 👇 CHANGE 2: Only join private room IF logged in
      if (user?.id) {
        newSocket.emit('join-room', user.id);
      }
    });

    // 3. Listen for User Notifications (Private)
    newSocket.on('notification', (data) => {
      console.log('🔔 REAL-TIME EVENT RECEIVED:', data);
      playNotificationSound();
      addToast(data.title, 'success');
      setUnreadCount((prev) => prev + 1);
    });

    // 4. 👇 NEW: Listen for Stock Updates (Public Broadcast)
    // We emit a global event so any component (Product/Wishlist) can listen
    newSocket.on('stock-update', (data) => {
      // Dispatch a custom window event so hooks can pick it up easily
      window.dispatchEvent(
        new CustomEvent('product-stock-update', { detail: data }),
      );
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket Connection Error:', err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, loading, addToast]); // Removed user.id dependency to keep socket stable

  return (
    <SocketContext.Provider value={{ socket, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
