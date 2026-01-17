'use client';

import { useState, useEffect } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import toast from 'react-hot-toast';

export default function NotifyButton({ productId, stock }) {
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [notified, setNotified] = useState(false);
  const { user, loading: authLoading } = useAuth(); // Added authLoading

  useEffect(() => {
    const checkWaitlistStatus = async () => {
      // Don't check until authentication status is finished loading
      if (authLoading) return;

      // If user is clearly not logged in, stop checking
      if (!user) {
        setIsChecking(false);
        return;
      }

      try {
        // Force no-cache on the request
        const res = await fetch(
          `/api/products/waitlist/check?productId=${productId}`,
          {
            cache: 'no-store',
            headers: { Pragma: 'no-cache' },
          },
        );

        const data = await res.json();
        if (data.isSubscribed) {
          setNotified(true);
        }
      } catch (err) {
        console.error('Waitlist status check failed:', err);
      } finally {
        setIsChecking(false);
      }
    };

    checkWaitlistStatus();
  }, [user, authLoading, productId]); // Added authLoading to dependencies

  if (stock > 0) return null;

  if (isChecking || authLoading) {
    return (
      <div className="w-full py-3 flex justify-center border border-stone-200 rounded-xl">
        <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
      </div>
    );
  }

  const handleNotify = async () => {
    if (!user) {
      toast.error('Please login to get notified');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/products/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email: user.email }),
      });

      if (res.ok) {
        setNotified(true);
        toast.success("We'll email you when it's back!");
      } else {
        const data = await res.json();
        toast.error(data.error || 'Something went wrong');
      }
    } catch (err) {
      toast.error('Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  if (notified) {
    return (
      <button
        disabled
        className="w-full bg-green-50 text-green-700 py-3 rounded-xl font-medium border border-green-200 flex items-center justify-center gap-2 cursor-default shadow-sm"
      >
        <Bell className="w-4 h-4 fill-current" />
        You're on the list!
      </button>
    );
  }

  return (
    <button
      onClick={handleNotify}
      disabled={loading}
      className="w-full bg-[#FDFBF7] text-[#8E5022] border border-[#8E5022] py-3 rounded-xl font-medium hover:bg-[#8E5022] hover:text-white transition-all flex items-center justify-center gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Bell className="w-4 h-4" /> Notify Me
        </>
      )}
    </button>
  );
}
