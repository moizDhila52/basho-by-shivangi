'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Upload,
  MapPin,
  User,
  Layout,
  Loader2,
  Check,
  Mail,
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export default function NewWorkshopPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    maxStudents: '',
    location: 'Studio Bashō, Surat',
    language: 'English/Hindi',
    level: 'Beginner',
    instructorName: '',
    instructorRole: 'Lead Potter',
    instructorBio: '',
    image: '',
    instructorImage: '',
    sessions: [{ date: '', time: '10:00 AM', spots: '' }],
    sendNewsletter: false,
  });

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', CLOUDINARY_PRESET);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: data }
      );
      const json = await res.json();
      setFormData((prev) => ({ ...prev, [field]: json.secure_url }));
      addToast('Image uploaded', 'success');
    } catch (err) {
      addToast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSessionChange = (index, field, value) => {
    const newSessions = [...formData.sessions];
    newSessions[index][field] = value;
    setFormData({ ...formData, sessions: newSessions });
  };

  const addSessionRow = () => {
    setFormData((prev) => ({
      ...prev,
      sessions: [
        ...prev.sessions,
        { date: '', time: '10:00 AM', spots: prev.maxStudents },
      ],
    }));
  };

  const removeSessionRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed');

      if (formData.sendNewsletter) {
        addToast('Workshop created & Newsletter sent!', 'success');
      } else {
        addToast('Workshop scheduled successfully!', 'success');
      }

      router.push('/admin/workshops');
    } catch (error) {
      addToast('Failed to create workshop', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white border border-[#EDD8B4] rounded-xl hover:bg-[#EDD8B4]/20 text-[#8E5022] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#442D1C]">
            Schedule Workshop
          </h1>
          <p className="text-[#8E5022] text-xs md:text-sm">
            Create a new class and add sessions
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* LEFT COLUMN: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Basic Details */}
          <div className="bg-white p-4 md:p-6 rounded-xl border border-[#EDD8B4] shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-[#442D1C] flex items-center gap-2 border-b border-[#EDD8B4] pb-2 text-lg">
              <Layout size={18} /> Workshop Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Title
                </label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none"
                  placeholder="e.g. Intro to Wheel Throwing"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Price (₹)
                </label>
                <input
                  required
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none"
                  placeholder="1500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Max Students
                </label>
                <input
                  required
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) =>
                    setFormData({ ...formData, maxStudents: e.target.value })
                  }
                  className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none"
                  placeholder="10"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Schedule / Sessions */}
          <div className="bg-white p-4 md:p-6 rounded-xl border border-[#EDD8B4] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#EDD8B4] pb-2">
              <h3 className="font-serif font-bold text-[#442D1C] flex items-center gap-2 text-lg">
                <Calendar size={18} /> Session Schedule
              </h3>
              <button
                type="button"
                onClick={addSessionRow}
                className="text-xs font-bold text-[#C85428] bg-[#C85428]/5 px-3 py-1.5 rounded-lg hover:bg-[#C85428]/10 transition-colors flex items-center gap-1"
              >
                <Plus size={14} /> Add Date
              </button>
            </div>

            <div className="space-y-3">
              {formData.sessions.map((session, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-3 items-end bg-[#FDFBF7] p-3 rounded-lg border border-[#EDD8B4]/50"
                >
                  <div className="w-full md:flex-1">
                    <label className="text-[10px] font-bold text-[#8E5022] uppercase mb-1 block">
                      Date
                    </label>
                    <input
                      required
                      type="date"
                      value={session.date}
                      onChange={(e) =>
                        handleSessionChange(index, 'date', e.target.value)
                      }
                      className="w-full p-2 bg-white border border-[#EDD8B4] rounded-md text-sm"
                    />
                  </div>
                  <div className="w-full md:w-32">
                    <label className="text-[10px] font-bold text-[#8E5022] uppercase mb-1 block">
                      Time
                    </label>
                    <input
                      required
                      type="time"
                      value={session.time}
                      onChange={(e) =>
                        handleSessionChange(index, 'time', e.target.value)
                      }
                      className="w-full p-2 bg-white border border-[#EDD8B4] rounded-md text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSessionRow(index)}
                    className="w-full md:w-auto p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg flex justify-center items-center"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Instructor Info */}
          <div className="bg-white p-4 md:p-6 rounded-xl border border-[#EDD8B4] shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-[#442D1C] flex items-center gap-2 border-b border-[#EDD8B4] pb-2 text-lg">
              <User size={18} /> Instructor
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name (e.g. Sarah J.)"
                value={formData.instructorName}
                onChange={(e) =>
                  setFormData({ ...formData, instructorName: e.target.value })
                }
                className="p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg w-full focus:ring-1 focus:ring-[#C85428] outline-none"
              />
              <input
                type="text"
                placeholder="Role (e.g. Senior Artist)"
                value={formData.instructorRole}
                onChange={(e) =>
                  setFormData({ ...formData, instructorRole: e.target.value })
                }
                className="p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg w-full focus:ring-1 focus:ring-[#C85428] outline-none"
              />

              {/* PASTE YOUR NEW CODE HERE */}
    <div className="md:col-span-2">
      <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
        Instructor Bio
      </label>
      <textarea
        rows={3}
        placeholder="Tell students about the instructor's background and expertise..."
        value={formData.instructorBio}
        onChange={(e) =>
          setFormData({ ...formData, instructorBio: e.target.value })
        }
        className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none text-sm"
      />
    </div>

              {/* Instructor Image Upload */}
              <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-4 bg-[#FDFBF7] p-3 rounded-lg border border-[#EDD8B4]">
                <div className="w-16 h-16 bg-white rounded-full overflow-hidden border border-[#EDD8B4] flex-shrink-0">
                  {formData.instructorImage ? (
                    <img
                      src={formData.instructorImage}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 m-4 text-[#EDD8B4]" />
                  )}
                </div>
                <label className="cursor-pointer bg-white px-4 py-2 border border-[#EDD8B4] rounded-lg text-sm font-medium text-[#442D1C] hover:bg-[#EDD8B4]/20 transition-colors w-full md:w-auto text-center">
                  Upload Photo
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'instructorImage')}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (Image & Meta) */}
        <div className="space-y-6">
          {/* Main Image */}
          <div className="bg-white p-4 md:p-6 rounded-xl border border-[#EDD8B4] shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-[#442D1C]">Cover Image</h3>
            <div className="aspect-video bg-[#FDFBF7] rounded-lg border-2 border-dashed border-[#EDD8B4] flex flex-col items-center justify-center overflow-hidden relative group">
              {formData.image ? (
                <>
                  <img
                    src={formData.image}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer text-white text-sm font-bold flex items-center gap-2 hover:underline">
                      <Upload size={16} /> Change
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'image')}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2 text-[#8E5022] w-full h-full justify-center hover:bg-[#EDD8B4]/10 transition-colors">
                  {uploading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Upload size={24} />
                  )}
                  <span className="text-sm font-medium">Click to Upload</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'image')}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Quick Details */}
          <div className="bg-white p-4 md:p-6 rounded-xl border border-[#EDD8B4] shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-[#442D1C]">
              Meta Details
            </h3>

            <div>
              <label className="text-[10px] font-bold text-[#8E5022] uppercase">
                Duration
              </label>
              <div className="flex items-center gap-2 bg-[#FDFBF7] p-2 rounded-lg border border-[#EDD8B4]">
                <Clock size={16} className="text-[#C85428]" />
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="bg-transparent outline-none text-sm w-full text-[#442D1C]"
                  placeholder="e.g. 2 Hours"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8E5022] uppercase">
                Level
              </label>
              <select
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
                className="w-full p-2 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg text-sm text-[#442D1C] outline-none"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8E5022] uppercase">
                Location
              </label>
              <div className="flex items-center gap-2 bg-[#FDFBF7] p-2 rounded-lg border border-[#EDD8B4]">
                <MapPin size={16} className="text-[#C85428]" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="bg-transparent outline-none text-sm w-full text-[#442D1C]"
                />
              </div>
            </div>
          </div>

          {/* Newsletter Toggle */}
          <div className="bg-white p-4 md:p-6 rounded-xl border border-[#EDD8B4] shadow-sm">
            <label className="flex items-start gap-3 cursor-pointer">
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
                  formData.sendNewsletter
                    ? 'bg-[#C85428] border-[#C85428]'
                    : 'border-[#C85428] bg-white'
                }`}
              >
                {formData.sendNewsletter && (
                  <Check className="w-3.5 h-3.5 text-white" />
                )}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={formData.sendNewsletter}
                onChange={(e) =>
                  setFormData({ ...formData, sendNewsletter: e.target.checked })
                }
              />
              <div className="flex-1">
                <span className="flex items-center gap-2 font-bold text-[#442D1C] text-sm">
                  <Mail className="w-4 h-4 text-[#C85428]" /> Notify Subscribers
                </span>
                <span className="block text-xs text-[#8E5022] mt-1 leading-relaxed">
                  Send a "New Workshop" email to all subscribers immediately.
                </span>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full py-3.5 bg-[#442D1C] text-[#EDD8B4] font-bold rounded-xl hover:bg-[#652810] shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                'Publish Workshop'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full py-3 text-[#8E5022] font-medium hover:bg-[#EDD8B4]/20 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}