"use client";
import { useCart } from "@/hooks/use-cart";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, LogOut } from "lucide-react"; 
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Fixed import

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cart = useCart();
  const [isMounted, setIsMounted] = useState(false);
  
  // Get Auth state
  const { user, loading } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navLinks = [
    { href: "/products", label: "Shop" },
    { href: "/workshops", label: "Workshops" },
    { href: "/about", label: "Our Story" },
    { href: "/media", label: "Testimonials" },
    { href: "/connect", label: "Connect" },
  ];

  if (pathname && pathname.startsWith("/api/admin")) return null;
  if (pathname && pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-basho-earth" />
            ) : (
              <Menu className="h-6 w-6 text-basho-earth" />
            )}
          </Button>
        </div>

        {/* Logo */}
        <Link href="/">
           <img src="/brand/logo-basho.png" className="h-8 cursor-pointer" alt="Basho Logo" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-stone-600 hover:text-basho-clay transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Icons & Auth */}
        <div className="flex items-center gap-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5 text-basho-earth" />
              {cart.items.length > 0 && (
                 <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-basho-clay"></span>
              )}
            </Button>
          </Link>

          {loading ? (
             <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
          ) : (
            <>
              {!user ? (
                <Link href="/login">
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    Sign In
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                    {/* Optional: Show User Avatar if available from Google */}
                    {user.photoURL && (
                        <img src={user.photoURL} className="w-8 h-8 rounded-full border border-gray-200" alt="Profile" />
                    )}
                    <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout}
                    title="Sign Out"
                    >
                    <LogOut className="h-5 w-5 text-stone-600 hover:text-red-500" />
                    </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-white p-6 flex flex-col gap-6 z-40">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-serif text-basho-earth py-2 border-b border-basho-earth/10"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4">
            {!user ? (
               <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                 <Button className="w-full">Sign In</Button>
               </Link>
            ) : (
               <Button onClick={handleLogout} variant="outline" className="w-full border-red-200 text-red-600">
                 Sign Out
               </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}