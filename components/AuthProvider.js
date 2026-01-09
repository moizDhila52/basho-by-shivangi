"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // To re-check auth on route change

const AuthContext = createContext({ user: null, loading: true });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname(); // Hook to detect navigation

  const fetchSession = async () => {
    try {
      // setLoading(true); // Optional: depends if you want global loading state on nav
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [pathname]); // Re-fetch session whenever the URL changes (updates Header avatar)

  return (
    <AuthContext.Provider value={{ user, loading, refreshAuth: fetchSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
