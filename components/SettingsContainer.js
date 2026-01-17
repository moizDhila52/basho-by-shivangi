"use client";
import { useState } from 'react';
import ProfileForm from './ProfileForm'; // Assuming ProfileForm is in components/
import { Camera, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function SettingsContainer({ user }) {
    // State to manage image preview if user selects a new one before saving
    const [imagePreview, setImagePreview] = useState(user.image);
    const [isUploading, setIsUploading] = useState(false);

    // Placeholder for Image Upload Handler
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Show preview immediately
        setImagePreview(URL.createObjectURL(file));

        // 2. TODO: Implement actual backend upload here
        // const formData = new FormData();
        // formData.append('file', file);
        // setIsUploading(true);
        // await fetch('/api/user/image-upload', { method: 'POST', body: formData }) ...
        // setIsUploading(false);
        alert("Backend upload integration required here.");
    };

    // Placeholder for Remove Image Handler
    const handleRemoveImage = async () => {
        if(confirm("Are you sure you want to remove your profile picture?")) {
            setImagePreview(null);
             // TODO: Call backend api to remove image link from DB
             // await fetch('/api/user/image-remove', { method: 'POST' }) ...
             alert("Image removed (UI update only - needs backend intgration).");
        }
    };

  return (
    <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm space-y-8">

      {/* --- 1. Image Management Section --- */}
      <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-stone-100">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-stone-50 bg-[#EDD8B4] flex items-center justify-center">
            {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                <span className="text-4xl font-serif font-bold text-[#442D1C]">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                </span>
            )}
        </div>

        <div className="flex flex-col gap-3">
            <h3 className="font-bold text-[#442D1C]">Profile Picture</h3>
            <p className="text-sm text-stone-500">Supports JPG, PNG (Max 5MB)</p>
            <div className="flex gap-3 mt-2">
                 {/* Upload Button (Hidden Input trick) */}
                <label className="flex items-center gap-2 px-4 py-2 bg-[#442D1C] text-white text-sm rounded-lg cursor-pointer hover:bg-[#C85428] transition-colors">
                    <Camera className="w-4 h-4" />
                    Upload New
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>

                {/* Remove Button */}
                {imagePreview && (
                    <button
                        onClick={handleRemoveImage}
                        className="flex items-center gap-2 px-4 py-2 border border-stone-200 text-stone-600 text-sm rounded-lg hover:bg-stone-50 transition-colors group"
                    >
                        <Trash2 className="w-4 h-4 group-hover:text-red-500" />
                        Remove
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* --- 2. The Form Section --- */}
      <div>
        <h3 className="font-bold text-[#442D1C] mb-4">Personal Details</h3>
        <ProfileForm user={user} />
      </div>

    </div>
  );
}