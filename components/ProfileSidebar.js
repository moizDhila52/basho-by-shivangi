'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Star,
  LogOut,
  Ticket,
  Sparkles,
  Camera,
  Loader2,
  Settings,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Removed Firebase imports as they aren't needed for your DB-based session

export default function ProfileSidebar({ user }) {
  const pathname = usePathname();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState(user?.image);
  const { updateUser } = useAuth();

  const navItems = [
    { href: '/profile', label: 'Overview', icon: LayoutDashboard },
    { href: '/profile/workshops', label: 'My Workshops', icon: Ticket },
    {
      href: '/profile/custom-orders',
      label: 'Custom Requests',
      icon: Sparkles,
    },
    { href: '/profile/orders', label: 'My Orders', icon: Package },
    { href: '/profile/address', label: 'Addresses', icon: MapPin },
    { href: '/profile/reviews', label: 'My Reviews', icon: Star },
    { href: '/profile/settings', label: 'Settings', icon: Settings },
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be less than 5MB');
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/user/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setAvatar(data.imageUrl); // Update Sidebar
        toast.success('Profile picture updated!');

        // 👇 INSTANTLY UPDATE NAVBAR (No reload needed)
        updateUser({ image: data.imageUrl });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };
  return (
    <aside className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-[#EDD8B4]/30 h-fit lg:sticky lg:top-24 overflow-hidden">
      {/* 1. TOP SECTION: Profile Picture & Info */}
      <div className="bg-[#FDFBF7] p-8 flex flex-col items-center text-center border-b border-[#EDD8B4]/30">
        <div className="relative group mb-4">
          <div className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden relative bg-[#EDD8B4]">
            {avatar ? (
              <Image
                src={avatar}
                alt="Profile"
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-serif text-[#8E5022]">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          {/* CAMERA BUTTON REMOVED FROM HERE */}
        </div>

        <h2 className="font-serif text-xl text-[#442D1C] font-bold">
          {user?.name || 'Valued Customer'}
        </h2>
        <p className="text-stone-500 text-sm mt-1">{user?.email}</p>
      </div>

      {/* 2. BOTTOM SECTION: Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${
                isActive
                  ? 'bg-[#8E5022] text-white shadow-md'
                  : 'text-[#442D1C] hover:bg-[#FDFBF7]'
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${
                  isActive
                    ? 'text-white'
                    : 'text-stone-400 group-hover:text-[#8E5022]'
                }`}
              />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-[#EDD8B4]/30">
          <form action="/api/auth/logout" method="POST">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </nav>
    </aside>
  );
}
