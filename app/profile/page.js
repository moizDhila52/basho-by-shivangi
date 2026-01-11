"use client";

import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

// Simple loading state
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-32 bg-stone-200 rounded-xl w-full"></div>
    <div className="h-64 bg-stone-200 rounded-xl w-full"></div>
  </div>
);

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#EDD8B4]/30 flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-[#FDFBF7] flex items-center justify-center text-[#8E5022]">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-sm text-stone-400 mb-1">{label}</div>
        <div className="font-medium text-[#442D1C]">{value}</div>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!user) return <div className="p-8 text-center text-stone-600">Please log in to view your profile.</div>;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-[#EDD8B4]/30 flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#FDFBF7] shadow-lg">
            {/* Direct Image Rendering for Cloudinary */}
            <img 
              src={user.image || "/images/placeholder-user.jpg"} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h1 className="text-2xl font-serif text-[#442D1C] mb-1">{user.name || "Pottery Enthusiast"}</h1>
          <p className="text-[#8E5022]">{user.email}</p>
        </div>
        
        <button className="px-6 py-2 border border-[#8E5022] text-[#8E5022] rounded-full hover:bg-[#8E5022] hover:text-white transition-all">
          Edit Profile
        </button>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard 
          icon={Mail} 
          label="Email Address" 
          value={user.email} 
        />
        <InfoCard 
          icon={Phone} 
          label="Phone Number" 
          value={user.phone || "Add phone number"} 
        />
        <InfoCard 
          icon={Calendar} 
          label="Member Since" 
          value={user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'N/A'} 
        />
        {/* Address Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#EDD8B4]/30 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#FDFBF7] flex items-center justify-center text-[#8E5022]">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-stone-400 mb-1">Default Address</div>
            <div className="font-medium text-[#442D1C]">
              Manage your addresses in the Address tab
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}