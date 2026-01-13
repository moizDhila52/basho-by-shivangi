'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';

export default function NotifyButton({ productId, stock }) {
  const [loading, setLoading] = useState(false);
  const [notified, setNotified] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  // If in stock, don't show anything (or show Add to Cart)
  if (stock > 0) return null;

  const handleNotify = async () => {
    if (!user) {
      addToast('Please login to get notified', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/products/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        setNotified(true);
        addToast("We will email you when it's back!", 'success');
      } else {
        addToast('Something went wrong', 'error');
      }
    } catch (err) {
      addToast('Failed to connect', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (notified) {
    return (
      <button
        disabled
        className="w-full bg-green-50 text-green-700 py-3 rounded-xl font-medium border border-green-200 flex items-center justify-center gap-2 cursor-default"
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
        'Saving...'
      ) : (
        <>
          <Bell className="w-4 h-4" />
          Notify Me When Available
        </>
      )}
    </button>
  );
}
