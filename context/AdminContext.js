// context/AdminContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import toast from 'react-hot-toast';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const { socket } = useSocket();
  
  // 1. GLOBAL ADMIN STATE (The "Single Source of Truth")
  const [stats, setStats] = useState({
    pendingOrders: 0,
    todaysOrders: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    activeVisitors: 0
  });

  // 2. Fetch Initial Stats (On Load only)
  useEffect(() => {
    const fetchInitialStats = async () => {
      try {
        const res = await fetch('/api/admin/stats'); // You'll need this simple API
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load admin stats", err);
      }
    };
    fetchInitialStats();
  }, []);

  // 3. LISTEN FOR LIVE UPDATES (No Refresh Logic)
  useEffect(() => {
    if (!socket) return;

    // A. Listen for New Orders
    const handleNewOrder = (data) => {
      // Play Sound
      const audio = new Audio('/sounds/cash-register.mp3'); // Add a nice sound
      audio.play().catch(e => console.log('Audio blocked'));

      // Show Toaster
      toast.success(`New Order: ₹${data.amount} from ${data.customerName}`, {
        duration: 5000,
        position: 'top-right',
        icon: '💰'
      });

      // Update Counters Instantly
      setStats(prev => ({
        ...prev,
        pendingOrders: prev.pendingOrders + 1,
        todaysOrders: prev.todaysOrders + 1,
        totalRevenue: prev.totalRevenue + data.amount
      }));
    };

    // B. Listen for Stock Alerts (reusing the logic from user side, but for admin count)
    const handleStockUpdate = (data) => {
        if(data.stock === 0) {
            setStats(prev => ({
                ...prev,
                lowStockItems: prev.lowStockItems + 1
            }));
            toast.error(`Alert: ${data.productName} is Out of Stock!`, { icon: '⚠️' });
        }
    };

    socket.on('admin:new-order', handleNewOrder);
    socket.on('admin:stock-alert', handleStockUpdate);

    return () => {
      socket.off('admin:new-order', handleNewOrder);
      socket.off('admin:stock-alert', handleStockUpdate);
    };
  }, [socket]);

  return (
    <AdminContext.Provider value={{ stats }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);