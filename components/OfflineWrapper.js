"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCcw, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function OfflineWrapper({ children }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // 1. Check initial status safely
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    // 2. Define event handlers
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("No internet connection.");
    };

    // 3. Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 4. Cleanup listeners on unmount
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    // Simulate a check delay
    setTimeout(() => {
      if (navigator.onLine) {
        setIsOnline(true);
        toast.success("Back online!");
      } else {
        toast.error("Still offline.");
      }
      setIsRetrying(false);
    }, 1500);
  };

  // IF ONLINE: Render the website normally
  if (isOnline) {
    return <>{children}</>;
  }

  // IF OFFLINE: Render the "One Eyesight" Light Theme Error
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-500 w-full min-h-[50vh] bg-[#FAF7F2]">
      
      {/* Icon Circle: Dark Brown low opacity background */}
      <div className="w-16 h-16 md:w-20 md:h-20 bg-[#442D1C]/10 rounded-full flex items-center justify-center mb-4 relative">
        <div className="absolute inset-0 rounded-full border border-[#442D1C]/20 animate-ping opacity-20" />
        <WifiOff className="w-8 h-8 md:w-10 md:h-10 text-[#442D1C]" />
      </div>

      {/* Typography: Dark Brown Text */}
      <h2 className="font-serif text-2xl md:text-3xl text-[#442D1C] mb-2">
        Connection Lost
      </h2>
      
      <p className="text-[#442D1C]/70 mb-6 text-sm md:text-base max-w-[90%] mx-auto leading-relaxed">
        The connection has drifted away. <br className="hidden md:block" /> 
        Check your network to reconnect.
      </p>

      {/* Button: Dark Brown Background, Light Text */}
      <button
        onClick={handleRetry}
        disabled={isRetrying}
        className="flex items-center gap-2 px-6 py-2 md:px-8 md:py-3 bg-[#442D1C] text-[#FAF7F2] rounded-full font-medium text-xs md:text-sm transition-all hover:scale-105 hover:bg-black shadow-md disabled:opacity-70"
      >
        {isRetrying ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCcw className="w-4 h-4" />
        )}
        {isRetrying ? "Reconnecting..." : "Try Again"}
      </button>
    </div>
  );
}