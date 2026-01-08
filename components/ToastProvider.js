"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="pointer-events-auto min-w-[300px] max-w-md bg-white border border-[#EDD8B4] shadow-lg rounded-xl p-4 flex items-start gap-3"
            >
              <div
                className={`mt-0.5 ${
                  toast.type === "error"
                    ? "text-red-500"
                    : toast.type === "success"
                    ? "text-green-600"
                    : "text-[#C85428]"
                }`}
              >
                {toast.type === "error" ? (
                  <AlertCircle size={20} />
                ) : toast.type === "success" ? (
                  <CheckCircle size={20} />
                ) : (
                  <Info size={20} />
                )}
              </div>
              <div className="flex-1">
                <h4
                  className={`text-sm font-bold ${
                    toast.type === "error"
                      ? "text-red-900"
                      : toast.type === "success"
                      ? "text-green-900"
                      : "text-[#442D1C]"
                  }`}
                >
                  {toast.type === "error"
                    ? "Error"
                    : toast.type === "success"
                    ? "Success"
                    : "Note"}
                </h4>
                <p className="text-sm text-[#8E5022]/80 mt-0.5">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#8E5022]/40 hover:text-[#442D1C] transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
