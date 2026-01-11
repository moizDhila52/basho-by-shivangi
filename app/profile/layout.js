import Link from 'next/link';
import { LayoutDashboard, Package, MapPin, Star, LogOut, Ticket } from 'lucide-react';

export default function ProfileLayout({ children }) {
  const navItems = [
    { href: '/profile', label: 'Overview', icon: LayoutDashboard },
    { href: '/profile/workshops', label: 'My Workshops', icon: Ticket },
    { href: '/profile/orders', label: 'My Orders', icon: Package },
    { href: '/profile/address', label: 'Addresses', icon: MapPin },
    { href: '/profile/reviews', label: 'My Reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-12">
      {/* CHANGE: Increased max-w to 1920px (nearly full width) 
         and adjusted grid columns to giving content more room (2 cols sidebar, 10 cols content)
      */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar: Fixed width, Sticky on scroll */}
        <aside className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-[#EDD8B4]/30 h-fit lg:sticky lg:top-24">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#FDFBF7] text-[#442D1C] font-medium transition-colors group"
              >
                <item.icon className="w-5 h-5 text-stone-400 group-hover:text-[#8E5022]" />
                {item.label}
              </Link>
            ))}
            
            <div className="pt-4 mt-4 border-t border-[#EDD8B4]/30">
              <form action="/api/auth/logout" method="POST">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </form>
            </div>
          </nav>
        </aside>

        {/* Main Content: Takes remaining space */}
        <main className="lg:col-span-10">
          {children}
        </main>
      </div>
    </div>
  );
}