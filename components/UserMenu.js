"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Package,
} from "lucide-react";

export default function UserMenu({ user }) {
  // Changed prop from 'session' to 'user'
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    // FIXED PATH: Matches your standard auth structure
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    window.location.href = "/";
  }

  if (!user) return null; // Should be handled by parent, but safety check

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        {/* Avatar Circle */}
        <div className="w-10 h-10 bg-[#EDD8B4] rounded-full flex items-center justify-center text-[#442D1C] font-serif font-bold text-lg border-2 border-transparent hover:border-[#C85428] transition-all">
          {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white border border-[#EDD8B4] rounded-xl shadow-xl py-2 z-50">
          <div className="px-4 py-3 border-b border-[#EDD8B4]/20 mb-1 bg-[#FDFBF7]">
            <p className="text-sm font-bold text-[#442D1C] truncate">
              {user.name || "User"}
            </p>
            <p className="text-xs text-[#8E5022] truncate">{user.email}</p>
          </div>

          {/* --- ADMIN LINK (Only visible to Admins) --- */}
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#C85428] hover:bg-[#EDD8B4]/20"
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin Dashboard
            </Link>
          )}

          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#442D1C] hover:bg-[#FDFBF7]"
            onClick={() => setIsOpen(false)}
          >
            <UserIcon className="w-4 h-4" />
            My Profile
          </Link>
          <Link
            href="/profile/orders"
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#442D1C] hover:bg-[#FDFBF7]"
            onClick={() => setIsOpen(false)}
          >
            <Package className="w-4 h-4" />
            My Orders
          </Link>

          <div className="border-t border-[#EDD8B4]/20 mt-2 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
