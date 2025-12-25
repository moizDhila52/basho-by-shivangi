"use client";

import { useCart } from "@/hooks/use-cart";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import UserMenu from "@/components/UserMenu"; // <--- 1. IMPORT ADDED

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const cart = useCart();

  // Get Auth state
  const { user, loading } = useAuth();

  // Check if we are on the homepage
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Logout Function (For Mobile Menu)
  const handleLogout = async () => {
    try {
      // 2. FIXED PATH: Matches your standard auth structure
      await fetch("/api/auth/logout", { method: "POST" });
      setIsMobileMenuOpen(false);
      window.location.href = "/"; // Hard refresh
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navLinks = [
    {
      href: "/products",
      label: "Shop",
      submenu: [
        { href: "/products/tea-ware", label: "Tea Ceremony" },
        { href: "/products/dinnerware", label: "Dining" },
        { href: "/products/special-edition", label: "Special Edition" },
      ],
    },
    { href: "/workshops", label: "Workshops" },
    { href: "/about", label: "Our Story" },
    { href: "/connect", label: "Connect" },
  ];

  // Don't show header on Admin Dashboard layout
  if (pathname && pathname.startsWith("/admin")) return null;

  // Logic: If not homepage, ALWAYS white. If homepage, white only when scrolled.
  const isHeaderWhite = !isHomePage || isScrolled;

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isHeaderWhite
            ? "bg-white/95 backdrop-blur-xl border-b border-[#EDD8B4]/30 shadow-sm py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          {/* Mobile Menu Trigger */}
          <div className="md:hidden z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`rounded-full transition-all ${
                isHeaderWhite
                  ? "hover:bg-[#EDD8B4]/20 text-[#442D1C]"
                  : "bg-white/20 hover:bg-white/40 text-white"
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Logo */}
          <Link href="/" className="z-50 relative group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <div
                className={`font-serif text-2xl font-bold tracking-tight ${
                  isHeaderWhite ? "text-[#442D1C]" : "text-white"
                }`}
              >
                Bashō
              </div>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link) => (
              <div key={link.href} className="relative group">
                <Link href={link.href}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`px-5 py-2 rounded-full transition-all ${
                      isHeaderWhite
                        ? "group-hover:bg-[#EDD8B4]/20"
                        : "group-hover:bg-white/10"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium transition-colors ${
                        pathname === link.href
                          ? "text-[#C85428]"
                          : isHeaderWhite
                          ? "text-[#442D1C]"
                          : "text-white"
                      }`}
                    >
                      {link.label}
                    </span>
                  </motion.div>
                </Link>

                {/* Dropdown for Shop */}
                {link.submenu && (
                  <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="bg-white rounded-xl p-2 min-w-[200px] shadow-xl border border-[#EDD8B4]/30 overflow-hidden">
                      {link.submenu.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2.5 rounded-lg hover:bg-[#FDFBF7] text-[#442D1C] text-sm font-medium transition-colors hover:text-[#C85428]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full transition-all hidden md:flex ${
                isHeaderWhite
                  ? "hover:bg-[#EDD8B4]/20 text-[#442D1C]"
                  : "bg-white/20 hover:bg-white/40 text-white"
              }`}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full transition-all ${
                    isHeaderWhite
                      ? "hover:bg-[#EDD8B4]/20 text-[#442D1C]"
                      : "bg-white/20 hover:bg-white/40 text-white"
                  }`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {cart?.items?.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#C85428] flex items-center justify-center text-[10px] text-white font-bold">
                      {cart.items.length}
                    </span>
                  )}
                </Button>
              </motion.div>
            </Link>

            {/* Auth Section */}
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : (
              <div className="relative">
                {!user ? (
                  <Link href="/login">
                    <Button
                      size="sm"
                      className={`rounded-full font-medium transition-all ${
                        isHeaderWhite
                          ? "bg-[#442D1C] text-white hover:bg-[#2c1d12]"
                          : "bg-white text-[#442D1C] hover:bg-gray-100"
                      }`}
                    >
                      Sign In
                    </Button>
                  </Link>
                ) : (
                  // 3. REPLACED INLINE LOGIC WITH USERMENU COMPONENT
                  <UserMenu user={user} />
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[280px] bg-[#FDFBF7] shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-serif text-2xl font-bold text-[#442D1C]">
                    Bashō
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5 text-[#442D1C]" />
                  </Button>
                </div>

                {/* Mobile Nav Links */}
                <div className="space-y-6">
                  {navLinks.map((link) => (
                    <div key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-lg font-medium text-[#442D1C]"
                      >
                        {link.label}
                      </Link>
                      {link.submenu && (
                        <div className="pl-4 mt-2 space-y-3 border-l-2 border-[#EDD8B4]">
                          {link.submenu.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block text-sm text-[#8E5022]"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mobile Admin Link */}
                {user?.role === "ADMIN" && (
                  <div className="mt-6 pt-6 border-t border-[#EDD8B4]">
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-[#C85428] font-bold"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Admin Dashboard
                    </Link>
                  </div>
                )}

                {/* Mobile Auth */}
                <div className="mt-8 pt-6 border-t border-[#EDD8B4]">
                  {!user ? (
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-[#442D1C] text-white">
                        Sign In
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#EDD8B4] flex items-center justify-center text-[#442D1C] font-bold">
                          {user.email?.[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[#442D1C]">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button variant="outline" className="w-full text-xs">
                            Profile
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          className="w-full text-xs"
                          onClick={handleLogout}
                        >
                          Logout
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
