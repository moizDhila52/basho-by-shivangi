'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Ticket,
  Settings,
  Sparkles,
  MapPin,
  Star,
  ChevronUp,
  User,
} from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(null); // 'orders' | 'personal' | null

  const menuRef = useRef(null); // Ref for the popup menu
  const navRef = useRef(null); // Ref for the bottom bar buttons

  // Close menu when clicking outside (BUT ignore clicks on the nav bar itself)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If click is inside the Menu OR inside the Nav Bar, do nothing
      if (
        (menuRef.current && menuRef.current.contains(event.target)) ||
        (navRef.current && navRef.current.contains(event.target))
      ) {
        return;
      }
      // Otherwise, close the menu
      setOpenMenu(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to check if a main tab is active
  const isActive = (path) => pathname === path;

  // Helper to check if a group is active
  const isGroupActive = (paths) => paths.includes(pathname);

  const toggleMenu = (menuName) => {
    if (openMenu === menuName) {
      setOpenMenu(null); // Close if already open
    } else {
      setOpenMenu(menuName); // Open if closed
    }
  };

  return (
    <>
      {/* --- POPUP MENUS (Rendered ABOVE the bar) --- */}
      {openMenu && (
        <div
          ref={menuRef}
          className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden mx-auto max-w-xs">
            {/* ORDERS MENU */}
            {openMenu === 'orders' && (
              <div className="flex flex-col">
                <Link
                  href="/profile/orders"
                  onClick={() => setOpenMenu(null)}
                  className={`px-5 py-4 flex items-center gap-3 border-b border-stone-50 hover:bg-[#FDFBF7] ${
                    isActive('/profile/orders')
                      ? 'text-[#C85428] font-bold'
                      : 'text-stone-600'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  Standard Orders
                </Link>
                <Link
                  href="/profile/custom-orders"
                  onClick={() => setOpenMenu(null)}
                  className={`px-5 py-4 flex items-center gap-3 hover:bg-[#FDFBF7] ${
                    isActive('/profile/custom-orders')
                      ? 'text-[#C85428] font-bold'
                      : 'text-stone-600'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  Custom Requests
                </Link>
              </div>
            )}

            {/* PERSONAL MENU (Addresses & Reviews) */}
            {openMenu === 'personal' && (
              <div className="flex flex-col">
                <Link
                  href="/profile/address"
                  onClick={() => setOpenMenu(null)}
                  className={`px-5 py-4 flex items-center gap-3 border-b border-stone-50 hover:bg-[#FDFBF7] ${
                    isActive('/profile/address')
                      ? 'text-[#C85428] font-bold'
                      : 'text-stone-600'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  Saved Addresses
                </Link>
                <Link
                  href="/profile/reviews"
                  onClick={() => setOpenMenu(null)}
                  className={`px-5 py-4 flex items-center gap-3 hover:bg-[#FDFBF7] ${
                    isActive('/profile/reviews')
                      ? 'text-[#C85428] font-bold'
                      : 'text-stone-600'
                  }`}
                >
                  <Star className="w-5 h-5" />
                  My Reviews
                </Link>
              </div>
            )}
          </div>
          {/* Arrow pointing down */}
          <div
            className={`absolute -bottom-2 w-4 h-4 bg-white transform rotate-45 shadow-sm border-r border-b border-stone-100
            ${openMenu === 'orders' ? 'left-1/2 -translate-x-1/2' : ''} 
            ${openMenu === 'personal' ? 'right-[20%]' : ''} 
          `}
          />
        </div>
      )}

      {/* --- BOTTOM NAVIGATION BAR --- */}
      {/* 👇 Added ref={navRef} here to detect clicks inside the bar */}
      <div
        ref={navRef}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-2 py-2 flex justify-between items-center z-40 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        {/* 1. Dashboard */}
        <Link
          href="/profile"
          onClick={() => setOpenMenu(null)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${
            isActive('/profile') ? 'text-[#8E5022]' : 'text-stone-400'
          }`}
        >
          <LayoutDashboard
            className="w-6 h-6"
            strokeWidth={isActive('/profile') ? 2.5 : 2}
          />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* 2. Workshops */}
        <Link
          href="/profile/workshops"
          onClick={() => setOpenMenu(null)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${
            isActive('/profile/workshops') ? 'text-[#8E5022]' : 'text-stone-400'
          }`}
        >
          <Ticket
            className="w-6 h-6"
            strokeWidth={isActive('/profile/workshops') ? 2.5 : 2}
          />
          <span className="text-[10px] font-medium">Workshops</span>
        </Link>

        {/* 3. ORDERS GROUP (Popup Trigger) */}
        <button
          onClick={() => toggleMenu('orders')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors relative ${
            isGroupActive(['/profile/orders', '/profile/custom-orders']) ||
            openMenu === 'orders'
              ? 'text-[#8E5022]'
              : 'text-stone-400'
          }`}
        >
          <div className="relative">
            <Package className="w-6 h-6" strokeWidth={2} />
            <div
              className={`absolute -top-2 -right-2 rounded-full border border-stone-100 p-0.5 shadow-sm transition-colors ${
                openMenu === 'orders'
                  ? 'bg-[#8E5022] text-white border-[#8E5022]'
                  : 'bg-[#FDFBF7] text-inherit'
              }`}
            >
              <ChevronUp
                className={`w-2.5 h-2.5 ${
                  openMenu === 'orders' ? 'rotate-180' : ''
                } transition-transform`}
              />
            </div>
          </div>
          <span className="text-[10px] font-medium">Orders</span>
        </button>

        {/* 4. PERSONAL GROUP (Address + Reviews) */}
        <button
          onClick={() => toggleMenu('personal')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors relative ${
            isGroupActive(['/profile/address', '/profile/reviews']) ||
            openMenu === 'personal'
              ? 'text-[#8E5022]'
              : 'text-stone-400'
          }`}
        >
          <div className="relative">
            <User className="w-6 h-6" strokeWidth={2} />
            <div
              className={`absolute -top-2 -right-2 rounded-full border border-stone-100 p-0.5 shadow-sm transition-colors ${
                openMenu === 'personal'
                  ? 'bg-[#8E5022] text-white border-[#8E5022]'
                  : 'bg-[#FDFBF7] text-inherit'
              }`}
            >
              <ChevronUp
                className={`w-2.5 h-2.5 ${
                  openMenu === 'personal' ? 'rotate-180' : ''
                } transition-transform`}
              />
            </div>
          </div>
          <span className="text-[10px] font-medium">My Info</span>
        </button>

        {/* 5. Settings */}
        <Link
          href="/profile/settings"
          onClick={() => setOpenMenu(null)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${
            isActive('/profile/settings') ? 'text-[#8E5022]' : 'text-stone-400'
          }`}
        >
          <Settings
            className="w-6 h-6"
            strokeWidth={isActive('/profile/settings') ? 2.5 : 2}
          />
          <span className="text-[10px] font-medium">Settings</span>
        </Link>
      </div>
    </>
  );
}
