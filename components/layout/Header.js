"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Added for Logo
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Menu,
  X,
  LayoutDashboard,
  Heart,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import UserMenu from "@/components/UserMenu";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext"; // Added Wishlist hook

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { getTotalItems } = useCart();
  const { getWishlistCount } = useWishlist(); // Use Wishlist State
  const { user, loading } = useAuth();

  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsMobileMenuOpen(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // New Navigation Structure
  const navLinks = [
    {
      label: "Shop",
      href: "/products",
      submenu: [
        { href: "/products", label: "All Products" },
        { href: "/products?category=tea-ware", label: "Tea Ceremony" },
        { href: "/products?category=dinnerware", label: "Dining" },
        { href: "/products?category=seasonal", label: "Special Edition" },
      ],
    },
    { href: "/custom-order", label: "Custom Order" },
    { href: "/workshops", label: "Workshops" },
    { href: "/connect", label: "Connect" },
    {
      label: "More",
      href: "#", // Placeholder for dropdown parent
      submenu: [
        { href: "/events", label: "Events" },
        { href: "/gallery", label: "Gallery" },
        { href: "/testimonials", label: "Testimonials" },
      ],
    },
  ];

  if (pathname && pathname.startsWith("/admin")) return null;

  // Header Logic
  // isHeaderWhite = True when scrolled OR not on homepage
  const isHeaderWhite = !isHomePage || isScrolled;
  
  const textColorClass = isHeaderWhite ? "text-[#442D1C]" : "text-white";
  const hoverBgClass = isHeaderWhite
    ? "hover:bg-[#EDD8B4]/20"
    : "hover:bg-white/20";

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          isHeaderWhite
            ? "bg-white/95 backdrop-blur-xl border-b border-[#EDD8B4]/30 shadow-sm py-2"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-8">
          
          {/* 1. Mobile Menu Trigger */}
          <div className="md:hidden z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`rounded-full ${hoverBgClass} ${textColorClass}`}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* 2. Logo Logic */}
          <Link
            href="/"
            className="relative z-50 transform transition-transform hover:scale-105"
          >
            <div className="relative h-10 w-32">
                {/* Logic:
                   If White Header (Light Theme context) -> Show img2 (Dark Logo)
                   If Transparent Header (Dark Theme context) -> Show img1 (Light Logo)
                */}
                <Image 
                    src={isHeaderWhite ? "/brand/logo-basho-byy-shivangi.png" : "/brand/logo-basho-byy-shivangi.png"}
                    alt="Basho Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
          </Link>

          {/* 3. Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group px-1">
                <Link href={link.href}>
                  <div
                    className={`px-4 py-2 rounded-full transition-all flex items-center gap-1 ${hoverBgClass}`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        pathname === link.href
                          ? "text-[#C85428]"
                          : textColorClass
                      }`}
                    >
                      {link.label}
                    </span>
                    {link.submenu && (
                        <ChevronDown size={14} className={`opacity-70 ${textColorClass}`} />
                    )}
                  </div>
                </Link>

                {/* Dropdown */}
                {link.submenu && (
                  <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-2 min-w-[200px] shadow-xl border border-[#EDD8B4]/30 overflow-hidden">
                      {link.submenu.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2.5 rounded-xl hover:bg-[#FDFBF7] text-[#442D1C] text-sm font-medium transition-colors hover:text-[#C85428]"
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

          {/* 4. Right Actions */}
          <div className="flex items-center gap-2">
            
            {/* Wishlist with Badge */}
            <Link href="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full hidden sm:flex relative ${hoverBgClass} ${textColorClass}`}
              >
                <Heart className="h-5 w-5" />
                {getWishlistCount() > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-[#C85428] flex items-center justify-center text-[10px] text-white font-bold animate-in zoom-in">
                    {getWishlistCount()}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart with Badge */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full relative ${hoverBgClass} ${textColorClass}`}
              >
                <ShoppingBag className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-[#C85428] flex items-center justify-center text-[10px] text-white font-bold animate-in zoom-in">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
            </Link>

            {/* Auth / User Menu */}
            {loading ? (
              <div className="w-9 h-9 rounded-full bg-gray-200/50 animate-pulse ml-2" />
            ) : user ? (
              <div className="ml-2">
                <UserMenu user={user} />
              </div>
            ) : (
              <Link href="/login" className="ml-2">
                <Button
                  size="sm"
                  className={`rounded-full px-6 font-medium transition-transform hover:scale-105 ${
                    isHeaderWhite
                      ? "bg-[#442D1C] text-[#EDD8B4] hover:bg-[#652810]"
                      : "bg-white text-[#442D1C] hover:bg-[#FDFBF7]"
                  }`}
                >
                  Sign In
                </Button>
              </Link>
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
              className="fixed top-0 left-0 h-full w-[300px] bg-[#FDFBF7] shadow-2xl z-50 md:hidden overflow-y-auto border-r border-[#EDD8B4]"
            >
              <div className="p-6 flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-10">
                  <div className="relative h-8 w-24">
                     <Image src="/img2.png" alt="Logo" fill className="object-contain" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-6 w-6 text-[#8E5022]" />
                  </Button>
                </div>

                {/* Mobile Links */}
                <div className="flex-1 space-y-6">
                  {navLinks.map((link) => (
                    <div key={link.label}>
                      {/* If it has a submenu, just show label, otherwise link */}
                      {link.submenu ? (
                          <div className="mb-2">
                              <span className="text-xl font-medium text-[#442D1C] block mb-2">{link.label}</span>
                              <div className="pl-4 border-l-2 border-[#EDD8B4] space-y-3">
                                  {link.submenu.map((sub) => (
                                      <Link
                                          key={sub.href}
                                          href={sub.href}
                                          onClick={() => setIsMobileMenuOpen(false)}
                                          className="block text-sm text-[#8E5022] font-medium"
                                      >
                                          {sub.label}
                                      </Link>
                                  ))}
                              </div>
                          </div>
                      ) : (
                          <Link
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-xl font-medium text-[#442D1C] block mb-2"
                          >
                            {link.label}
                          </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mobile Auth Actions */}
                <div className="pt-8 border-t border-[#EDD8B4]">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#EDD8B4]">
                        <div className="w-10 h-10 rounded-full bg-[#442D1C] flex items-center justify-center text-[#EDD8B4] font-bold">
                          {user.email?.[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-medium text-[#442D1C] truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-[#8E5022] truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="col-span-2"
                          >
                            <Button
                              variant="outline"
                              className="w-full justify-start gap-2 border-[#C85428] text-[#C85428]"
                            >
                              <LayoutDashboard size={16} /> Admin Panel
                            </Button>
                          </Link>
                        )}
                        <Link
                          href="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button
                            variant="outline"
                            className="w-full justify-start gap-2 border-[#EDD8B4] text-[#442D1C]"
                          >
                            <User size={16} /> Profile
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          className="w-full justify-start gap-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                          onClick={handleLogout}
                        >
                          <LogOut size={16} /> Logout
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-[#442D1C] text-[#EDD8B4] hover:bg-[#652810] py-6 text-lg rounded-xl">
                        Sign In / Register
                      </Button>
                    </Link>
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