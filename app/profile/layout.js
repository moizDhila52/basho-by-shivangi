"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  MapPin, 
  Star, 
  LogOut, 
  Ticket, 
  Sparkles 
} from 'lucide-react';

export default function ProfileLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/profile', label: 'Overview', icon: LayoutDashboard },
    { href: '/profile/workshops', label: 'My Workshops', icon: Ticket },
    { href: '/profile/custom-orders', label: 'Custom Requests', icon: Sparkles }, 
    { href: '/profile/orders', label: 'My Orders', icon: Package },
    { href: '/profile/address', label: 'Addresses', icon: MapPin },
    { href: '/profile/reviews', label: 'My Reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-12">
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar */}
        <aside className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-[#EDD8B4]/30 h-fit lg:sticky lg:top-24">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all group
                    ${isActive 
                      ? "bg-[#442D1C] text-[#EDD8B4] shadow-md" 
                      : "text-[#5C4033] hover:bg-[#F5E6D3] hover:text-[#442D1C]"
                    }
                  `}
                >
                  <item.icon 
                    className={`w-5 h-5 transition-colors
                      ${isActive 
                        ? "text-[#EDD8B4]" 
                        : "text-[#8E5022] group-hover:text-[#442D1C]" 
                      }
                    `} 
                  />
                  {item.label}
                </Link>
              );
            })}
            
            <div className="pt-4 mt-4 border-t border-[#EDD8B4]/30">
              <form action="/api/auth/logout" method="POST">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </form>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-10">
          {children}
        </main>
      </div>
    </div>
  );
}