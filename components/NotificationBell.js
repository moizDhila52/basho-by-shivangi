'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/components/AuthProvider';

export default function NotificationBell({
  isHeaderWhite,
  textColorClass,
  hoverBgClass,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Use global state from context
  const { socket, unreadCount, setUnreadCount } = useSocket();
  const { user } = useAuth();

  // 1. Fetch History on Load
  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user]);

  // 2. Listen for Real-Time Updates (to update the LIST)
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotif) => {
      // Add new item to the top of the list instantly
      setNotifications((prev) => [
        {
          ...newNotif,
          id: Date.now().toString(),
          isRead: false,
          createdAt: new Date(),
        },
        ...prev,
      ]);
    };

    socket.on('notification', handleNewNotification);
    return () => socket.off('notification', handleNewNotification);
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        // Sync unread count
        setUnreadCount(data.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleMarkRead = async () => {
    if (unreadCount === 0) return;
    setUnreadCount(0); // Reset global count
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true }))); // Visual update
    await fetch('/api/notifications/mark-read', { method: 'POST' });
  };

  const handleClearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    await fetch('/api/notifications/clear', { method: 'POST' });
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) handleMarkRead();
        }}
        className={`rounded-full relative ${hoverBgClass} ${textColorClass}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold animate-in zoom-in border-2 border-white">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed left-4 right-4 top-20 md:absolute md:left-auto md:right-0 md:top-full md:w-80 bg-white rounded-2xl shadow-xl border border-[#EDD8B4]/30 overflow-hidden z-50 origin-top-right"
            >
              <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-[#FDFBF7]">
                <h3 className="font-serif font-bold text-[#442D1C]">
                  Notifications
                </h3>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[10px] text-stone-400 hover:text-[#C85428] uppercase font-bold tracking-wider"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-[60vh] md:max-h-[300px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-stone-400 text-sm">
                    No new updates.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <Link
                      href={notif.link || '#'}
                      key={notif.id}
                      onClick={() => setIsOpen(false)}
                      className={`block p-4 border-b border-stone-50 transition-colors ${
                        !notif.isRead ? 'bg-[#EDD8B4]/10' : 'hover:bg-[#FDFBF7]'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                            !notif.isRead ? 'bg-[#C85428]' : 'bg-stone-200'
                          }`}
                        />
                        <div>
                          <p
                            className={`text-sm text-[#442D1C] mb-1 ${
                              !notif.isRead ? 'font-bold' : 'font-medium'
                            }`}
                          >
                            {notif.title}
                          </p>
                          <p className="text-xs text-stone-500 leading-relaxed">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-stone-400 mt-2">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
