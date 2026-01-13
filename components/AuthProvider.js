'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const AuthContext = createContext({
  user: null,
  loading: true,
  refreshAuth: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const fetchSession = async () => {
    try {
      // 👇 The timestamp (?t=...) ensures the Browser doesn't serve old data
      const res = await fetch(`/api/user/me?t=${Date.now()}`, {
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth Refresh Error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper to update state instantly without waiting for network
  const updateUser = (newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  };

  useEffect(() => {
    fetchSession();
  }, [pathname]);

  return (
    <AuthContext.Provider
      value={{ user, loading, refreshAuth: fetchSession, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
