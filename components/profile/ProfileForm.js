'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Loader2,
  Trash2,
  Save,
  Edit2,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function ProfileForm({ user }) {
  // Initial state to compare changes against
  const initialState = {
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
  };

  const [formData, setFormData] = useState(initialState);
  const [imagePreview, setImagePreview] = useState(user.image || null);

  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // Track if form changed
  const [imageRemoved, setImageRemoved] = useState(false);

  const fileInputRef = useRef(null);
  const router = useRouter();
  const { addToast } = useToast();

  // Check if form is "dirty" (changed)
  useEffect(() => {
    const hasTextChanges =
      JSON.stringify(formData) !== JSON.stringify(initialState);
    const hasImageChanges = imagePreview !== user.image; // Check if image changed or removed
    setIsDirty(hasTextChanges || hasImageChanges);
  }, [formData, imagePreview, user.image]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageRemoved(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    setImageRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);

    let imageToSend = imagePreview;
    if (imageRemoved && !imagePreview) {
      imageToSend = null; // Explicit null to delete on backend
    }

    const payload = { ...formData, image: imageToSend };

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        addToast('Profile updated successfully', 'success');
        setIsEditing(false); // Exit edit mode
        setIsDirty(false); // Reset dirty state
        router.refresh();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      addToast('Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
   <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden w-full mx-auto">
      {/* --- HEADER / COVER AREA --- */}
      <div className="h-32 bg-[#FDFBF7] border-b border-[#EDD8B4]/30 relative">
        <div className="absolute top-4 right-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#442D1C] text-sm font-medium rounded-full shadow-sm border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData(initialState); // Reset changes
                setImagePreview(user.image); // Reset image
              }}
              className="text-xs text-red-500 font-medium hover:underline bg-white px-3 py-1.5 rounded-full border border-red-100"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="px-8 pb-8">
        {/* --- AVATAR SECTION (Overlapping Header) --- */}
        <div className="relative -mt-16 mb-8 flex justify-center">
          <div className="relative group">
            <div
              onClick={handleImageClick}
              className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-serif text-[#442D1C] overflow-hidden border-[6px] border-white shadow-lg bg-[#EDD8B4] transition-all ${
                isEditing ? 'cursor-pointer hover:opacity-90' : ''
              }`}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user.name?.[0]?.toUpperCase() || 'U'}</span>
              )}
            </div>

            {/* Edit Controls (Only visible in Edit Mode) */}
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="absolute bottom-2 right-1 p-2 bg-[#442D1C] text-white rounded-full shadow-md hover:bg-[#2c1d12] transition-colors z-10 border-2 border-white"
                  title="Upload Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 p-2 bg-white text-red-500 rounded-full shadow-sm hover:bg-red-50 transition-colors z-10 border border-stone-200"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* --- FORM FIELDS --- */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-6">
            {/* Name Field */}
            <div
              className={`transition-all ${
                isEditing ? 'opacity-100' : 'opacity-80'
              }`}
            >
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8E5022] mb-2">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-3 rounded-xl transition-all font-medium text-[#442D1C] ${
                  isEditing
                    ? 'bg-white border border-[#C85428]/50 focus:ring-4 focus:ring-[#C85428]/10 outline-none'
                    : 'bg-transparent border-b border-stone-200 rounded-none px-0'
                }`}
                placeholder="Your Name"
              />
            </div>

            {/* Email Field (Always Disabled but styled nicer) */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8E5022] mb-2">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <div className="relative">
                <input
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-stone-500 font-medium cursor-not-allowed"
                />
                {isEditing && (
                  <span className="absolute right-3 top-3.5 text-[10px] text-stone-400">
                    (Read-only)
                  </span>
                )}
              </div>
            </div>

            {/* Phone Field */}
            <div
              className={`transition-all ${
                isEditing ? 'opacity-100' : 'opacity-80'
              }`}
            >
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8E5022] mb-2">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-3 rounded-xl transition-all font-medium text-[#442D1C] ${
                  isEditing
                    ? 'bg-white border border-[#C85428]/50 focus:ring-4 focus:ring-[#C85428]/10 outline-none'
                    : 'bg-transparent border-b border-stone-200 rounded-none px-0'
                }`}
                placeholder="+91 99999 99999"
              />
            </div>
          </div>

          {/* --- ACTION BAR (Only Visible when Editing) --- */}
          {isEditing && (
            <div
              className={`pt-6 mt-4 border-t border-stone-100 flex justify-end gap-3 transition-all duration-300 ${
                isDirty
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(initialState);
                  setImagePreview(user.image);
                }}
                className="px-6 py-3 text-stone-500 font-bold hover:bg-stone-50 rounded-xl transition-colors text-sm"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#442D1C] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#2c1d12] transition-all shadow-lg shadow-[#442D1C]/20 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    {' '}
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...{' '}
                  </>
                ) : (
                  <>
                    {' '}
                    <Save className="w-4 h-4" /> Save Changes{' '}
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
