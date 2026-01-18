'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  ShoppingBag,
  Calendar,
  Palette,
  Truck,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';
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

  // 2. Listen for Real-Time Updates
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotif) => {
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
        setUnreadCount(data.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleMarkRead = async () => {
    if (unreadCount === 0) return;
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await fetch('/api/notifications/mark-read', { method: 'POST' });
  };

  const handleClearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    await fetch('/api/notifications/clear', { method: 'POST' });
  };

  // 🎨 Helper: Get Icon & Color based on Notification Type/Title
  const getNotificationStyle = (type, title) => {
    const lowerTitle = title?.toLowerCase() || '';

    // Workshop
    if (type === 'WORKSHOP') {
      return {
        icon: <Calendar className="h-4 w-4" />,
        bg: 'bg-purple-100',
        text: 'text-purple-600',
      };
    }
    // Custom Order
    if (type === 'CUSTOM_ORDER') {
      return {
        icon: <Palette className="h-4 w-4" />,
        bg: 'bg-blue-100',
        text: 'text-blue-600',
      };
    }
    // Order Status Specifics
    if (lowerTitle.includes('shipped')) {
      return {
        icon: <Truck className="h-4 w-4" />,
        bg: 'bg-orange-100',
        text: 'text-orange-600',
      };
    }
    if (lowerTitle.includes('delivered')) {
      return {
        icon: <CheckCircle2 className="h-4 w-4" />,
        bg: 'bg-green-100',
        text: 'text-green-600',
      };
    }
    if (lowerTitle.includes('cancelled')) {
      return {
        icon: <XCircle className="h-4 w-4" />,
        bg: 'bg-red-100',
        text: 'text-red-600',
      };
    }
    // Default / Order Placed
    return {
      icon: <ShoppingBag className="h-4 w-4" />,
      bg: 'bg-[#EDD8B4]/30', // Brand subtle gold
      text: 'text-[#8E5022]', // Brand dark brown
    };
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
          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-[#C85428] flex items-center justify-center text-[10px] text-white font-bold animate-in zoom-in border-2 border-white">
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
              className="fixed left-4 right-4 top-20 md:absolute md:left-auto md:right-0 md:top-full md:w-96 bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EDD8B4]/50 overflow-hidden z-50 origin-top-right"
            >
              <div className="p-4 border-b border-[#EDD8B4]/20 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                <h3 className="font-serif font-bold text-[#442D1C]">
                  Notifications
                </h3>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[10px] text-[#8E5022]/60 hover:text-[#C85428] uppercase font-bold tracking-wider transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center text-[#8E5022]/40 flex flex-col items-center gap-3">
                    <Bell className="h-8 w-8 opacity-20" />
                    <p className="text-sm font-medium">No new updates.</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    // Get dynamic style for each notification
                    const style = getNotificationStyle(notif.type, notif.title);

                    return (
                      <Link
                        href={notif.link || '#'}
                        key={notif.id}
                        onClick={() => setIsOpen(false)}
                        className={`block p-4 border-b border-[#EDD8B4]/10 transition-all ${
                          !notif.isRead ? 'bg-[#EDD8B4]/10' : 'hover:bg-white'
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* 🎨 NEW: Dynamic Icon Container */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg} ${style.text}`}
                          >
                            {style.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <p
                                className={`text-sm text-[#442D1C] truncate ${
                                  !notif.isRead ? 'font-bold' : 'font-medium'
                                }`}
                              >
                                {notif.title}
                              </p>
                              {/* New Indicator Dot */}
                              {!notif.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#C85428] flex-shrink-0 mt-1.5 animate-pulse" />
                              )}
                            </div>

                            <p className="text-xs text-[#8E5022]/80 leading-relaxed line-clamp-2">
                              {notif.message}
                            </p>

                            <p className="text-[10px] text-[#8E5022]/40 mt-2 font-medium">
                              {new Date(notif.createdAt).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
