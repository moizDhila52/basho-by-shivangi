"use client";
import { useCart } from "@/hooks/use-cart";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  Menu,
  X,
  LogOut,
  User,
  Sparkles,
  ChevronDown,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const cart = useCart();
  const [isMounted, setIsMounted] = useState(false);

  // Get Auth state
  const { user, loading } = useAuth();

  useEffect(() => {
    setIsMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      router.push("/");
      router.refresh();
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
    { href: "/testimonials", label: "Testimonials" },
    { href: "/connect", label: "Connect" },
  ];

  if (pathname && pathname.startsWith("/api/admin")) return null;
  if (pathname && pathname.startsWith("/admin")) return null;

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-[#EDD8B4]/30 shadow-lg py-2"
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
                isScrolled
                  ? "bg-white/80 hover:bg-white"
                  : "bg-white/20 hover:bg-white/40"
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-[#442D1C]" />
              ) : (
                <Menu className="h-5 w-5 text-[#442D1C]" />
              )}
            </Button>
          </div>

          {/* Logo - Updated with Image */}
          <Link href="/" className="z-50">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              {/* Logo Image */}
              <div className="relative">
                <img
                  src="/brand/logo-basho.png"
                  alt="Basho Logo"
                  className="h-12 w-auto object-contain" // Adjust height as needed
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML = `
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#8E5022] to-[#C85428] flex items-center justify-center">
                    <span class="font-serif text-white text-lg">芭</span>
                  </div>
                `;
                  }}
                  style={{
                    "--bgcolor": "#fbfaf6",
                    filter: "drop-shadow(0 0 5px #fff)",
                  }}
                />
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
                    className="px-6 py-2 rounded-full transition-all group-hover:bg-[#EDD8B4]/20"
                  >
                    <span
                      className={`text-sm font-medium transition-colors ${
                        pathname === link.href
                          ? "text-[#C85428]"
                          : isScrolled
                          ? "text-[#442D1C]"
                          : "text-white"
                      } group-hover:text-[#C85428]`}
                    >
                      {link.label}
                    </span>

                    {/* Hover underline */}
                    <div
                      className={`h-0.5 mx-auto mt-1 w-0 group-hover:w-4/5 transition-all duration-300 ${
                        pathname === link.href
                          ? "bg-[#C85428] w-4/5"
                          : "bg-[#C85428]/50"
                      }`}
                    />
                  </motion.div>
                </Link>

                {/* Dropdown for Shop */}
                {link.submenu && (
                  <div className="absolute left-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 min-w-[200px] shadow-xl border border-[#EDD8B4]/30">
                      {link.submenu.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-3 rounded-lg hover:bg-[#EDD8B4]/20 text-[#442D1C] text-sm font-medium transition-colors"
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
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full transition-all hidden md:flex ${
                isScrolled
                  ? "bg-white/80 hover:bg-white text-[#442D1C]"
                  : "bg-white/20 hover:bg-white/40 text-white"
              }`}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Cart with Animation */}
            <Link href="/cart">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full transition-all ${
                    isScrolled
                      ? "bg-white/80 hover:bg-white text-[#442D1C]"
                      : "bg-white/20 hover:bg-white/40 text-white"
                  }`}
                >
                  <ShoppingBag className="h-5 w-5" />

                  {/* Cart Badge */}
                  {cart.items.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-[#C85428] to-[#8E5022] flex items-center justify-center"
                    >
                      <span className="text-xs text-white font-bold">
                        {cart.items.length > 9 ? "9+" : cart.items.length}
                      </span>
                    </motion.span>
                  )}
                </Button>
              </motion.div>
            </Link>
            {/* Auth Section */}
            {loading ? (
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-[#EDD8B4]/20 to-[#8E5022]/20 animate-pulse"></div>
            ) : (
              <div className="relative">
                {!user ? (
                  <Link href="/login">
                    <Button
                      variant={isScrolled ? "default" : "outline"}
                      size="sm"
                      className={`rounded-full transition-all ${
                        isScrolled
                          ? "bg-[#8E5022] hover:bg-[#652810] text-white shadow-lg"
                          : "bg-transparent border-white/40 text-white hover:bg-white/20"
                      }`}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="cursor-pointer"
                    >
                      {user.photoURL ? (
                        <div className="relative">
                          <img
                            src={user.photoURL}
                            className="w-9 h-9 rounded-full border-2 border-white shadow-lg"
                            alt="Profile"
                          />
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#C85428]/20 to-transparent" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#8E5022] to-[#C85428] flex items-center justify-center text-white font-medium shadow-lg">
                          {user.email?.[0].toUpperCase()}
                        </div>
                      )}
                    </motion.div>

                    {/* User Dropdown */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-12 bg-white/95 backdrop-blur-xl rounded-2xl p-4 min-w-[200px] shadow-xl border border-[#EDD8B4]/30 z-50"
                        >
                          <div className="mb-4">
                            <p className="font-medium text-[#442D1C]">
                              {user.displayName || user.email}
                            </p>
                            <p className="text-xs text-[#8E5022]">
                              Welcome back
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Link
                              href="/profile"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#EDD8B4]/20 text-[#442D1C] text-sm transition-colors"
                            >
                              <User className="h-4 w-4" />
                              My Profile
                            </Link>
                            <Link
                              href="/orders"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#EDD8B4]/20 text-[#442D1C] text-sm transition-colors"
                            >
                              <ShoppingBag className="h-4 w-4" />
                              My Orders
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 text-sm transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Decorative Line */}
        <div
          className={`h-px w-full transition-all duration-500 ${
            isScrolled
              ? "bg-gradient-to-r from-transparent via-[#EDD8B4]/50 to-transparent"
              : "bg-transparent"
          }`}
        />
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden"
            >
              {/* Menu Header */}
              <div
                className="p-6 border-b border-[#EDD8B4]/30"
                style={{ backgroundColor: "rd" }}
              >
                <div
                  className="flex items-center justify-between mb-4"
                  style={{ backgroundColor: "salon" }}
                >
                  <img
                    src="/brand/logo-basho.png"
                    className="h-8"
                    alt="brand-logo"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5 text-[#442D1C]" />
                  </Button>
                </div>

                {user && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#EDD8B4]/10 mb-4">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        className="w-10 h-10 rounded-full border-2 border-white"
                        alt="Profile"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8E5022] to-[#C85428] flex items-center justify-center text-white font-medium">
                        {user.email?.[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-[#442D1C] text-sm">
                        {user.displayName || user.email}
                      </p>
                      <p className="text-xs text-[#8E5022]">Welcome</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Navigation */}
              <div className="p-6">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <div key={link.href} className="mb-2">
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-4 rounded-xl hover:bg-[#EDD8B4]/20 text-[#442D1C] font-medium transition-colors"
                      >
                        <span>{link.label}</span>
                        {link.submenu && (
                          <ChevronDown className="h-4 w-4 text-[#8E5022]" />
                        )}
                      </Link>

                      {/* Mobile Submenu */}
                      {link.submenu && (
                        <div className="ml-4 mt-1 space-y-1">
                          {link.submenu.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block px-4 py-3 rounded-lg hover:bg-[#EDD8B4]/20 text-[#8E5022] text-sm transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>

                {/* Mobile Auth Actions */}
                <div className="mt-8 pt-6 border-t border-[#EDD8B4]/30">
                  {!user ? (
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-gradient-to-r from-[#8E5022] to-[#C85428] text-white">
                        <User className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#EDD8B4]/20 text-[#442D1C] font-medium transition-colors"
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#EDD8B4]/20 text-[#442D1C] font-medium transition-colors"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-medium transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer of Mobile Menu */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#EDD8B4]/30">
                <p className="text-xs text-center text-[#8E5022]/60">
                  Bashō — Handcrafted Japanese Ceramics
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
