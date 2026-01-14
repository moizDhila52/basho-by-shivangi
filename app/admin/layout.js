'use client';

import { useAuth } from '@/components/AuthProvider';
import { ToastProvider } from '@/components/ToastProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  LogOut,
  Menu,
  Bell,
  MessageSquare,
  Truck,
  Briefcase,
  Calendar,
  Image as ImageIcon,
  PenTool,
  X,
  Tags, // <--- ADDED for Categories
  Mail, // <--- ADDED for Newsletter
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AdminProvider, useAdmin } from '@/context/AdminContext';
import {
  NotificationProvider,
  useNotification,
} from '@/context/NotificationContext';

const THEME = {
  sidebar: 'bg-[#442D1C]',
  sidebarText: 'text-[#EDD8B4]',
  sidebarActive: 'bg-[#652810]',
  background: 'bg-[#FDFBF7]',
};

const NAVIGATION_GROUPS = [
  {
    group: 'Overview',
    items: [
      {
        name: 'Dashboard',
        icon: <LayoutDashboard size={20} />,
        path: '/admin',
      },
      {
        name: 'Customers',
        icon: <Users size={20} />,
        path: '/admin/customers',
      },
    ],
  },
  {
    group: 'Store & Orders',
    items: [
      {
        name: 'Products',
        icon: <Package size={20} />,
        path: '/admin/products',
      },
      // --- NEW CATEGORIES SECTION ---
      {
        name: 'Categories',
        icon: <Tags size={20} />,
        path: '/admin/categories',
      },
      {
        name: 'Orders',
        icon: <ShoppingBag size={20} />,
        path: '/admin/orders',
        hasBadge: true,
      },
      {
        name: 'Custom Orders',
        icon: <PenTool size={20} />,
        path: '/admin/custom-orders',
        hasBadge: true,
      },
      {
        name: 'Workshops',
        icon: <Users size={20} />,
        path: '/admin/workshops',
        hasBadge: true,
      },
      {
        name: 'Inquiries',
        icon: <Briefcase size={20} />,
        path: '/admin/inquiries',
        hasBadge: true,
      },
      {
        name: 'Shipping & GST',
        icon: <Truck size={20} />,
        path: '/admin/shipping',
      },
    ],
  },
  {
    group: 'Content Management',
    items: [
      {
        name: 'Events & Exhibitions',
        icon: <Calendar size={20} />,
        path: '/admin/events',
      },
      // --- NEW NEWSLETTER SECTION ---
      {
        name: 'Newsletter',
        icon: <Mail size={20} />,
        path: '/admin/newsletter',
      },
      {
        name: 'Gallery',
        icon: <ImageIcon size={20} />,
        path: '/admin/gallery',
      },
      {
        name: 'Testimonials',
        icon: <MessageSquare size={20} />,
        path: '/admin/testimonials',
      },
    ],
  },
];

// Inner component to access AdminContext and Auth
function AdminLayoutContent({ children }) {
  const { user, loading } = useAuth();
  const { stats } = useAdmin();
  const { counts, markOrdersAsRead } = useNotification();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading || !user) return null;

  return (
    <div
      className={`flex h-screen w-full ${THEME.background} text-[#442D1C] font-sans overflow-hidden relative`}
    >
      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          ${THEME.sidebar} ${THEME.sidebarText} 
          fixed lg:relative z-50 h-full flex flex-col 
          transition-all duration-300 ease-in-out border-r border-[#652810]
          ${
            isMobileOpen
              ? 'translate-x-0 w-64'
              : '-translate-x-full lg:translate-x-0'
          }
          ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between lg:justify-center border-b border-[#652810] px-4">
          {isSidebarOpen || isMobileOpen ? (
            <h1 className="font-serif text-2xl tracking-wide font-bold">
              Bashō.
            </h1>
          ) : (
            <span className="font-serif text-xl font-bold">B.</span>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-[#EDD8B4]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <nav className="space-y-6 px-3">
            {NAVIGATION_GROUPS.map((group, idx) => (
              <div key={idx}>
                {(isSidebarOpen || isMobileOpen) && (
                  <p className="px-3 text-xs font-semibold text-[#EDD8B4]/50 uppercase tracking-wider mb-2">
                    {group.group}
                  </p>
                )}
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.path;

                    let badgeCount = 0;
                    if (item.name === 'Orders') badgeCount = counts.orders;
                    if (item.name === 'Custom Orders') badgeCount = counts.customOrders;
                    if (item.name === 'Workshops') badgeCount = counts.workshops;
                    if (item.name === 'Corporate Inquiries') badgeCount = counts.inquiries;

                    return (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          onClick={() => {
                            if (item.name === 'Orders') markOrdersAsRead();
                            if (item.name === 'Custom Orders') markAsRead('customOrders');
                            if (item.name === 'Workshops') markAsRead('workshops');
                            if (item.name === 'Corporate Inquiries') badgeCount = counts.inquiries;
                          }}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group
                            ${
                              isActive
                                ? `${THEME.sidebarActive} text-white shadow-sm`
                                : 'text-[#EDD8B4]/80 hover:bg-[#652810]/50 hover:text-white'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`${
                                isActive
                                  ? 'text-[#EDD8B4]'
                                  : 'text-[#EDD8B4]/70'
                              }`}
                            >
                              {item.icon}
                            </span>
                            {(isSidebarOpen || isMobileOpen) && (
                              <span>{item.name}</span>
                            )}
                          </div>

                          {badgeCount > 0 && (
                            <span
                              className={`
                              flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full shadow-md animate-pulse
                              ${
                                isSidebarOpen || isMobileOpen
                                  ? 'px-2 py-0.5'
                                  : 'w-2 h-2 p-0 ml-[-8px] mt-[-10px]'
                              }
                            `}
                            >
                              {isSidebarOpen || isMobileOpen ? badgeCount : ''}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-[#652810]">
          <div
            className={`flex items-center gap-3 ${
              !isSidebarOpen && !isMobileOpen && 'justify-center'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#EDD8B4] flex items-center justify-center text-[#442D1C] font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
            {(isSidebarOpen || isMobileOpen) && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">
                  {user.name || 'Admin'}
                </p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-[#EDD8B4]/60 hover:text-[#C85428] flex items-center gap-1 transition-colors"
                >
                  <LogOut size={12} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#EDD8B4] flex items-center justify-between px-4 lg:px-6 z-20">
          <div className="flex items-center gap-4">
            {/* Desktop Toggle */}
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="hidden lg:block p-2 hover:bg-[#FDFBF7] rounded-md text-[#652810] transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 hover:bg-[#FDFBF7] rounded-md text-[#652810] transition-colors"
            >
              <Menu size={20} />
            </button>

            <h2 className="font-serif text-xl font-bold text-[#442D1C]">
              {NAVIGATION_GROUPS.flatMap((g) => g.items).find(
                (i) => i.path === pathname,
              )?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-[#FDFBF7] rounded-full transition-colors text-[#652810]">
              <Bell size={20} />
              {(stats.pendingOrders > 0 || stats.lowStockItems > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#FDFBF7] scrollbar-thin scrollbar-thumb-[#EDD8B4] scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto pb-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminProvider>
      <NotificationProvider>
        <ToastProvider>
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </ToastProvider>
      </NotificationProvider>
    </AdminProvider>
  );
}