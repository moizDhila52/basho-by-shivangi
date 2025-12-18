'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation' // Import useRouter
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react'

// 🍪 Helper to read cookies in the browser
function getCookie(name) {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false) // Start blocked

  // 👮 SECURITY CHECK
  useEffect(() => {
    const token = getCookie('admin_token')
    
    if (!token) {
      // 🚫 Not Logged In? Go to Login Page
      router.push('/login')
    } else {
      // ✅ Logged In? Show the page
      setIsAuthorized(true)
    }
  }, [router])

  // Don't show anything until we check the cookie
  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-400">Verifying access...</div>
  }

  // ... (Your Existing Layout Code below) ...
  return (
    <div className="min-h-screen bg-stone-50 flex font-sans text-stone-900">
      
      {/* MOBILE OVERLAY */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={`
          fixed md:sticky top-0 h-screen z-50 w-72 bg-basho-earth text-stone-100 shadow-2xl 
          flex flex-col transition-transform duration-300 ease-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-basho-earth">
          <div>
            <h1 className="text-2xl font-serif tracking-widest text-white">BASHO.</h1>
            <p className="text-[10px] uppercase tracking-wider text-stone-400 mt-1">Admin Panel</p>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="md:hidden p-1 rounded-md hover:bg-white/10 text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <NavItem href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem href="/admin/orders" icon={<ShoppingBag size={20} />} label="Orders" />
          <NavItem href="/admin/products" icon={<Package size={20} />} label="Products" />
          <NavItem href="/admin/customers" icon={<Users size={20} />} label="Customers" />
          <div className="pt-8 pb-2 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">System</div>
          <NavItem href="/admin/settings" icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <button 
            // LOGOUT BUTTON
            onClick={() => {
              document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;" // Clear cookie
              router.push('/login')
            }}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-basho-clay flex items-center justify-center text-white font-serif font-bold">A</div>
            <div className="text-left flex-1">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-stone-400 group-hover:text-red-300 transition-colors">Log Out</p>
            </div>
            <LogOut size={18} className="text-stone-500 group-hover:text-red-300" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-2 -ml-2 rounded-lg text-stone-600 hover:bg-stone-100 active:scale-95 transition-all"
            >
              <Menu size={24} />
            </button>
            <span className="font-serif font-bold text-stone-800 text-lg">Dashboard</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-basho-earth/10 flex items-center justify-center text-basho-earth font-bold text-xs">A</div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-8 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

function NavItem({ href, icon, label }) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))

  return (
    <Link 
      href={href}
      className={`
        group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
        ${isActive 
          ? 'bg-basho-clay text-white shadow-lg shadow-basho-clay/20 translate-x-1' 
          : 'text-stone-300 hover:bg-white/5 hover:text-white hover:translate-x-1'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className={`${isActive ? 'text-white' : 'text-stone-400 group-hover:text-white transition-colors'}`}>
          {icon}
        </span>
        <span className="font-medium tracking-wide text-sm">{label}</span>
      </div>
      {isActive && <ChevronRight size={16} className="text-white/50" />}
    </Link>
  )
}