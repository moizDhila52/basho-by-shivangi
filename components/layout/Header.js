'use client'
import { useCart } from '@/hooks/use-cart'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Menu, X, User } from 'lucide-react' // Ensure lucide-react is installed
import { Button } from '@/components/ui/Button'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

export default function Header() {
    const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const cart = useCart()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  const navLinks = [
    { href: '/products', label: 'Shop' },
    { href: '/workshops', label: 'Workshops' },
    { href: '/about', label: 'Our Story' },
  ]
if (pathname && pathname.startsWith('/api/admin')) {
    return null
  }
if (pathname && pathname.startsWith('/admin')) {
    return null
  }

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
        <Link href="/" className="font-serif text-2xl font-bold text-basho-earth tracking-tighter">
          BASHO.
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
              {/* Cart Count Badge */}
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-basho-clay"></span>
            </Button>
          </Link>

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="hidden md:flex">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-basho-minimal p-6 flex flex-col gap-6 animate-fade-in">
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
             <SignedOut>
                <SignInButton mode="modal">
                  <Button className="w-full">Sign In</Button>
                </SignInButton>
             </SignedOut>
          </div>
        </div>
      )}
    </header>
  )
}