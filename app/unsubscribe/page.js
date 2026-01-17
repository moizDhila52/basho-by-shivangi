'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function UnsubscribeContent() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setMessage(data.message);
      } else {
        setMessage(data.error || 'Failed to unsubscribe');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-[#E5E0D8] shadow-sm rounded-xl overflow-hidden mx-auto">
      <div className="p-8 sm:p-10">
        {/* Minimal Header */}
        <div className="text-center mb-10">
           <img 
             src="\images\Basho - logotm-03.jpg" 
             alt="Bashō" 
             className="h-12 w-auto mx-auto mb-6 object-contain opacity-90"
           />
          <h1 className="text-xl font-serif text-[#442D1C] font-medium">Unsubscribe</h1>
        </div>

        {success ? (
          <div className="text-center animate-in fade-in duration-500">
            <div className="mb-6 flex justify-center">
              <span className="bg-[#F0FDF4] text-[#166534] rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </div>
            <p className="text-[#442D1C] mb-8 font-medium">{message}</p>
            <a 
              href="/" 
              className="text-sm text-[#8E5022] hover:text-[#442D1C] border-b border-[#EDD8B4] pb-0.5 hover:border-[#442D1C] transition-colors"
            >
              Return to shop
            </a>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-8 text-center text-sm leading-relaxed">
              Confirm your email below to be removed from our mailing list.
            </p>

            <form onSubmit={handleUnsubscribe} className="space-y-5">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg text-[#442D1C] placeholder-gray-400 focus:outline-none focus:border-[#8E5022] transition-colors text-sm"
                  placeholder="name@example.com"
                />
              </div>

              {message && (
                <p className={`text-xs text-center ${message.includes('Failed') || message.includes('error') ? 'text-red-600' : 'text-blue-600'}`}>
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-3 bg-[#442D1C] text-white text-sm font-medium rounded-lg hover:bg-[#2E1F14] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Unsubscribe'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                You will still receive transactional emails for orders.
              </p>
              <div className="mt-6 pt-6 border-t border-[#F5F2EB]">
                <a href="/" className="text-xs text-[#8E5022] hover:underline">
                  Cancel
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen w-full bg-[#FDFBF7] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-center text-xs text-gray-400">Loading...</div>}>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
}