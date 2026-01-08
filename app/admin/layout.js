"use client";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  Package,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Calendar,
  Bell,
  Search,
  ChevronDown,
  UserCircle,
  Home,
  BarChart3,
  Star,
  Tag,
  ShoppingCart,
  MessageSquare,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";

// Bashō Color Palette
const COLORS = {
  dark: "#442D1C",
  brown: "#652810",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
};

const sidebarVariants = {
  collapsed: { x: -280, opacity: 0 },
  expanded: { x: 0, opacity: 1 },
};

const navItems = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: "/admin",
  },
  {
    name: "Analytics",
    icon: <BarChart3 className="w-5 h-5" />,
    path: "/admin/analytics",
  },
  {
    name: "Orders",
    icon: <ShoppingBag className="w-5 h-5" />,
    path: "/admin/orders",
    count: true,
  },
  {
    name: "Products",
    icon: <Package className="w-5 h-5" />,
    path: "/admin/products",
  },
  {
    name: "Categories",
    icon: <Tag className="w-5 h-5" />,
    path: "/admin/categories",
  },
  {
    name: "Customers",
    icon: <Users className="w-5 h-5" />,
    path: "/admin/customers",
  },
  {
    name: "Workshops",
    icon: <Calendar className="w-5 h-5" />,
    path: "/admin/workshops",
  },
  {
    name: "Reviews",
    icon: <Star className="w-5 h-5" />,
    path: "/admin/reviews",
  },
  {
    name: "Coupons",
    icon: <ShoppingCart className="w-5 h-5" />,
    path: "/admin/coupons",
  },
  {
    name: "Messages",
    icon: <MessageSquare className="w-5 h-5" />,
    path: "/admin/messages",
    count: true,
  },
  {
    name: "Settings",
    icon: <Settings className="w-5 h-5" />,
    path: "/admin/settings",
  },
];

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }

    if (user) {
      // Fetch pending orders count
      fetch("/api/admin/orders/count?status=PENDING")
        .then((res) => res.json())
        .then((data) => setPendingOrdersCount(data.count || 0))
        .catch(console.error);

      // Fetch unread messages count
      fetch("/api/admin/messages/count?read=false")
        .then((res) => res.json())
        .then((data) => setUnreadMessagesCount(data.count || 0))
        .catch(console.error);

      // Fetch notifications
      fetch("/api/admin/notifications")
        .then((res) => res.json())
        .then((data) => setNotifications(data.slice(0, 5)))
        .catch(console.error);
    }
  }, [user, loading, router, pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname === "/admin/orders") return "Orders Management";
    if (pathname === "/admin/products") return "Product Catalog";
    if (pathname === "/admin/categories") return "Categories";
    if (pathname === "/admin/customers") return "Customer Insights";
    if (pathname === "/admin/workshops") return "Workshop Management";
    if (pathname === "/admin/reviews") return "Product Reviews";
    if (pathname === "/admin/coupons") return "Coupons & Discounts";
    if (pathname === "/admin/messages") return "Customer Messages";
    if (pathname === "/admin/analytics") return "Analytics";
    if (pathname === "/admin/settings") return "Settings";
    return "Admin Panel";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-[#EDD8B4]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#EDD8B4] border-t-[#C85428] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8E5022] font-serif font-medium">
            Loading Admin Panel...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#FDFBF7] to-[#EDD8B4]/10">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white shadow-lg border border-[#EDD8B4]"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-[#442D1C]" />
        ) : (
          <Menu className="w-6 h-6 text-[#442D1C]" />
        )}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || isMobileMenuOpen) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-[#442D1C] to-[#652810] text-[#EDD8B4] shadow-2xl md:relative md:flex flex-col"
          >
            {/* Logo & User */}
            <div className="p-6 border-b border-[#EDD8B4]/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C85428] to-[#8E5022] flex items-center justify-center shadow-lg">
                  <Home className="w-6 h-6 text-[#EDD8B4]" />
                </div>
                <div>
                  <h1 className="font-serif text-xl text-[#EDD8B4]">
                    Bashō Admin
                  </h1>
                  <p className="text-sm text-[#EDD8B4]/70">Artisan Ceramics</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#EDD8B4]/10 hover:bg-[#EDD8B4]/15 transition-colors cursor-pointer border border-[#EDD8B4]/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8E5022] to-[#C85428] flex items-center justify-center shadow">
                  <UserCircle className="w-6 h-6 text-[#EDD8B4]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#EDD8B4] truncate">
                    {user.name || "Admin User"}
                  </p>
                  <p className="text-xs text-[#EDD8B4]/60 truncate">
                    {user.email}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-[#EDD8B4]/60 flex-shrink-0" />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const hasCount =
                  item.count &&
                  (item.path === "/admin/orders"
                    ? pendingOrdersCount > 0
                    : item.path === "/admin/messages"
                    ? unreadMessagesCount > 0
                    : false);
                const countValue =
                  item.path === "/admin/orders"
                    ? pendingOrdersCount
                    : unreadMessagesCount;

                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                      isActive
                        ? "bg-gradient-to-r from-[#EDD8B4]/20 to-[#C85428]/20 text-[#EDD8B4] border-l-4 border-[#C85428]"
                        : "text-[#EDD8B4]/80 hover:text-[#EDD8B4] hover:bg-[#EDD8B4]/10"
                    }`}
                  >
                    <div
                      className={`transition-transform group-hover:scale-110 ${
                        isActive ? "text-[#EDD8B4]" : "text-[#EDD8B4]/60"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span className="font-medium flex-1">{item.name}</span>
                    {hasCount && (
                      <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-[#C85428] to-[#8E5022] text-white rounded-full animate-pulse min-w-[24px] flex items-center justify-center">
                        {countValue}
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute right-3 w-2 h-2 rounded-full bg-[#C85428] animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-[#EDD8B4]/20">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[#EDD8B4] hover:text-white hover:bg-gradient-to-r from-[#C85428]/20 to-[#C85428]/10 transition-all group border border-[#EDD8B4]/10 hover:border-[#C85428]/30"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#C85428]/20 to-[#8E5022]/20 group-hover:from-[#C85428]/30 group-hover:to-[#8E5022]/30 transition-colors">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#EDD8B4] shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex-1">
              <h2 className="font-serif text-2xl font-bold text-[#442D1C]">
                {getPageTitle()}
              </h2>
              <p className="text-sm text-[#8E5022]">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8E5022]" />
                <input
                  type="text"
                  placeholder="Search orders, products, customers..."
                  className="pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85428] focus:border-transparent w-64 transition-all text-[#442D1C] placeholder:text-[#8E5022]/50"
                />
              </div>

              {/* Notifications */}
              <div className="relative group">
                <button className="p-2.5 rounded-xl border border-[#EDD8B4] hover:border-[#C85428] bg-white hover:bg-[#FDFBF7] transition-colors relative">
                  <Bell className="w-5 h-5 text-[#8E5022]" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#C85428] to-[#8E5022] text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#EDD8B4] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-4 border-b border-[#EDD8B4] bg-gradient-to-r from-[#FDFBF7] to-white">
                    <h3 className="font-serif font-bold text-lg text-[#442D1C]">
                      Notifications
                    </h3>
                    <p className="text-xs text-[#8E5022] mt-1">
                      Latest updates from your store
                    </p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <div
                          key={index}
                          className="p-4 border-b border-[#EDD8B4]/30 hover:bg-[#FDFBF7] transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                notification.type === "order"
                                  ? "bg-[#C85428]/10"
                                  : notification.type === "review"
                                  ? "bg-[#8E5022]/10"
                                  : notification.type === "message"
                                  ? "bg-[#652810]/10"
                                  : "bg-[#EDD8B4]/20"
                              }`}
                            >
                              {notification.type === "order" && (
                                <ShoppingBag className="w-4 h-4 text-[#C85428]" />
                              )}
                              {notification.type === "review" && (
                                <Star className="w-4 h-4 text-[#8E5022]" />
                              )}
                              {notification.type === "message" && (
                                <MessageSquare className="w-4 h-4 text-[#652810]" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#442D1C]">
                                {notification.title}
                              </p>
                              <p className="text-xs text-[#8E5022] mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-[#8E5022]/60 mt-2">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-[#EDD8B4] mx-auto mb-3" />
                        <p className="text-[#8E5022]">No new notifications</p>
                        <p className="text-sm text-[#8E5022]/60 mt-1">
                          You're all caught up!
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-[#EDD8B4] bg-[#FDFBF7] rounded-b-2xl">
                    <Link
                      href="/admin/notifications"
                      className="text-sm text-[#C85428] hover:text-[#8E5022] font-medium flex items-center gap-2 justify-center"
                    >
                      View all notifications
                      <ChevronDown className="w-4 h-4 rotate-270" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Toggle Sidebar (Desktop) */}
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="hidden md:block p-2.5 rounded-xl border border-[#EDD8B4] hover:border-[#C85428] bg-white hover:bg-[#FDFBF7] transition-colors"
                title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <Menu className="w-5 h-5 text-[#8E5022]" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
