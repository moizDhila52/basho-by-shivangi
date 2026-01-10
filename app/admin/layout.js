"use client";
import { useAuth } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Users, // Customer DB
  Package,
  LogOut,
  Menu,
  Bell,
  MessageSquare, // Testimonials
  FileText,
  Truck,
  Palette,
  Briefcase,
  Calendar, // Events
  Image as ImageIcon, // Gallery
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const THEME = {
  sidebar: "bg-[#442D1C]",
  sidebarText: "text-[#EDD8B4]",
  sidebarActive: "bg-[#652810]",
  background: "bg-[#FDFBF7]",
};

const NAVIGATION_GROUPS = [
  {
    group: "Overview",
    items: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard size={20} />,
        path: "/admin",
      },
      {
        name: "Analytics",
        icon: <FileText size={20} />,
        path: "/admin/analytics",
      },
      {
        name: "Customers", // Added Customer Database Management
        icon: <Users size={20} />,
        path: "/admin/customers",
      },
    ],
  },
  {
    group: "Store & Orders",
    items: [
      {
        name: "Products",
        icon: <Package size={20} />,
        path: "/admin/products",
      },
      {
        name: "Orders",
        icon: <ShoppingBag size={20} />,
        path: "/admin/orders",
      },
      {
        name: "Inquiries",
        icon: <Briefcase size={20} />,
        path: "/admin/inquiries",
      },
      {
        name: "Shipping & GST",
        icon: <Truck size={20} />,
        path: "/admin/shipping",
      },
    ],
  },
  {
    group: "Content Management", // Added Group for Events/Gallery/Testimonials
    items: [
      {
        name: "Events & Exhibitions",
        icon: <Calendar size={20} />,
        path: "/admin/events",
      },
      {
        name: "Gallery",
        icon: <ImageIcon size={20} />,
        path: "/admin/gallery",
      },
      {
        name: "Testimonials",
        icon: <MessageSquare size={20} />,
        path: "/admin/testimonials",
      },
    ],
  },
  {
    group: "Experience",
    items: [
      {
        name: "Workshops",
        icon: <Palette size={20} />,
        path: "/admin/workshops",
      },
    ],
  },
];

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <ToastProvider>
      <div className={`flex h-screen w-full ${THEME.background} text-[#442D1C] font-sans overflow-hidden`}>
        {/* SIDEBAR */}
        <aside
          className={`${THEME.sidebar} ${THEME.sidebarText} 
            flex flex-col transition-all duration-300 ease-in-out border-r border-[#652810]
            ${isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:w-20 lg:translate-x-0"} 
            fixed lg:relative z-30 h-full`}
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-[#652810] px-4">
            {isSidebarOpen ? (
              <h1 className="font-serif text-2xl tracking-wide font-bold">Bashō.</h1>
            ) : (
              <span className="font-serif text-xl font-bold">B.</span>
            )}
          </div>

          {/* Nav Items */}
          <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
            <nav className="space-y-6 px-3">
              {NAVIGATION_GROUPS.map((group, idx) => (
                <div key={idx}>
                  {isSidebarOpen && (
                    <p className="px-3 text-xs font-semibold text-[#EDD8B4]/50 uppercase tracking-wider mb-2">
                      {group.group}
                    </p>
                  )}
                  <ul className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.path;
                      return (
                        <li key={item.path}>
                          <Link
                            href={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                              ${isActive 
                                ? `${THEME.sidebarActive} text-white shadow-sm` 
                                : "text-[#EDD8B4]/80 hover:bg-[#652810]/50 hover:text-white"
                              }`}
                            title={item.name}
                          >
                            <span className={`${isActive ? "text-[#EDD8B4]" : "text-[#EDD8B4]/70"}`}>
                              {item.icon}
                            </span>
                            {isSidebarOpen && <span>{item.name}</span>}
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
            <div className={`flex items-center gap-3 ${!isSidebarOpen && "justify-center"}`}>
              <div className="w-8 h-8 rounded-full bg-[#EDD8B4] flex items-center justify-center text-[#442D1C] font-bold">
                {user.email?.[0].toUpperCase()}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{user.name || "Admin"}</p>
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

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-16 bg-white border-b border-[#EDD8B4] flex items-center justify-between px-6 z-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-[#FDFBF7] rounded-md text-[#652810] transition-colors"
              >
                <Menu size={20} />
              </button>
              <h2 className="font-serif text-xl font-bold text-[#442D1C] hidden md:block">
                {NAVIGATION_GROUPS.flatMap((g) => g.items).find((i) => i.path === pathname)?.name || "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-[#FDFBF7] rounded-full transition-colors text-[#652810]">
                <Bell size={20} />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FDFBF7] scrollbar-thin scrollbar-thumb-[#EDD8B4] scrollbar-track-transparent">
            <div className="max-w-7xl mx-auto pb-10">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}