'use client';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const pathname = usePathname();

  const [counts, setCounts] = useState({
    orders: 0,
    customOrders: 0,
    workshops: 0,
    inquiries: 0,
  });

  const [refreshTrigger, setRefreshTrigger] = useState({
    orders: 0,
    customOrders: 0,
    workshops: 0,
    inquiries: 0,
  });

  const lastIds = useRef({
    orders: null,
    customOrders: null,
    workshops: null,
    inquiries: null,
  });

  const soundsRef = useRef({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      soundsRef.current = {
        order: new Audio('/sounds/order.mp3'),
        custom: new Audio('/sounds/custom.mp3'),
        workshop: new Audio('/sounds/workshop.mp3'),
        inquiry: new Audio('/sounds/inquiry.mp3'),
      };
    }
  }, []);

  const playSound = (type) => {
    const sound = soundsRef.current[type];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch((e) => console.log('Audio autoplay blocked', e));
    }
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // --- UPDATED CHECKER ---
  const checkEndpoint = async (config) => {
    const {
      key,
      endpoint,
      sound,
      toastMsg,
      icon,
      pagePath,
      nameField,
      statusFilter, // <--- NEW PARAMETER
    } = config;

    try {
      const res = await fetch(endpoint);
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return;

      // 1. FILTER: Date (Today Only)
      let todaysItems = data.filter((item) => isToday(item.createdAt));

      // 2. FILTER: Status (Optional)
      // If a statusFilter is provided, apply it to find "Actionable" items
      let actionableItems = todaysItems;
      if (statusFilter) {
        actionableItems = todaysItems.filter(statusFilter);
      }

      // 3. UNREAD CALCULATION
      // For the badge, we count actionable items that are newer than last view
      const lastViewed = localStorage.getItem(`basho_last_viewed_${key}`);
      const unreadCount = lastViewed
        ? actionableItems.filter(
            (item) =>
              new Date(item.createdAt).getTime() >
              new Date(lastViewed).getTime(),
          ).length
        : actionableItems.length;

      // 4. REAL-TIME ALERT (Sound/Toast)
      // We look for the latest *ACTIONABLE* item (e.g. latest CONFIRMED order)
      const latestRelevantItem = actionableItems[0];

      if (
        latestRelevantItem &&
        lastIds.current[key] &&
        latestRelevantItem.id !== lastIds.current[key]
      ) {
        // Since we already filtered for isToday in actionableItems, we know it's today.

        if (pathname.startsWith(pagePath)) {
          playSound(sound);
          toast.success(
            `New ${toastMsg}: ${latestRelevantItem[nameField] || 'Received'}`,
            { icon },
          );
          setRefreshTrigger((prev) => ({ ...prev, [key]: prev[key] + 1 }));

          setCounts((prev) => ({ ...prev, [key]: 0 }));
          localStorage.setItem(
            `basho_last_viewed_${key}`,
            new Date().toISOString(),
          );
        } else {
          playSound(sound);
          toast(`New ${toastMsg}!`, { icon });
        }
      }

      // Update Ref to the latest *relevant* ID
      if (latestRelevantItem) {
        lastIds.current[key] = latestRelevantItem.id;
      }

      // 5. UPDATE BADGE
      if (!pathname.startsWith(pagePath)) {
        setCounts((prev) => ({ ...prev, [key]: unreadCount }));
      } else {
        setCounts((prev) => ({ ...prev, [key]: 0 }));
      }
    } catch (error) {
      console.error(`Error checking ${key}:`, error);
    }
  };

  const runAllChecks = () => {
    checkEndpoint({
      key: 'orders',
      endpoint: '/api/admin/orders',
      sound: 'order',
      toastMsg: 'Order',
      icon: '💰',
      pagePath: '/admin/orders',
      nameField: 'customerName',
      // 👇 THIS FIXES YOUR ISSUE: Only alert if NOT Pending
      statusFilter: (order) => order.status !== 'PENDING',
    });

    checkEndpoint({
      key: 'customOrders',
      endpoint: '/api/custom-orders',
      sound: 'custom',
      toastMsg: 'Custom Request',
      icon: '🎨',
      pagePath: '/admin/custom-orders',
      nameField: 'contactName',
    });

    checkEndpoint({
      key: 'workshops',
      endpoint: '/api/admin/registrations',
      sound: 'workshop',
      toastMsg: 'Registration',
      icon: '🎟️',
      pagePath: '/admin/workshops',
      nameField: 'studentName',
    });

    checkEndpoint({
      key: 'inquiries',
      endpoint: '/api/admin/inquiries',
      sound: 'inquiry',
      toastMsg: 'Inquiry',
      icon: '💼',
      pagePath: '/admin/inquiries',
      nameField: 'companyName',
    });
  };

  useEffect(() => {
    runAllChecks();
    const interval = setInterval(runAllChecks, 10000);
    return () => clearInterval(interval);
  }, [pathname]);

  const markAsRead = (type) => {
    setCounts((prev) => ({ ...prev, [type]: 0 }));
    localStorage.setItem(`basho_last_viewed_${type}`, new Date().toISOString());
  };

  return (
    <NotificationContext.Provider
      value={{ counts, refreshTrigger, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
