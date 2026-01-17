'use client';

// 👇 Added 'React' to imports to fix the error
import React, { useEffect, useState } from 'react'; 
import { useParams, useRouter } from 'next/navigation';
import {
  Users,
  Calendar,
  ArrowLeft,
  Download,
  Clock,
  MapPin,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Trash2,
  Edit2,
  Save,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';

const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export default function AdminWorkshopDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  
  // Data States
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState(null);

  // Modal States
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 

  // Form States
  const [newSession, setNewSession] = useState({ date: '', time: '10:00 AM', spots: '' });
  const [submittingSession, setSubmittingSession] = useState(false);
  
  // Edit Workshop Form
  const [editFormData, setEditFormData] = useState({});
  const [savingWorkshop, setSavingWorkshop] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchWorkshop();
  }, [id]);

  const fetchWorkshop = () => {
    fetch(`/api/admin/workshops/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setWorkshop(data);
        // Auto-expand first upcoming
        const firstUpcoming = data.WorkshopSession?.find(s => new Date(s.date) >= new Date());
        if (firstUpcoming) setExpandedSession(firstUpcoming.id);
        setLoading(false);
      })
      .catch(() => addToast('Failed to load workshop', 'error'));
  };

  // --- HANDLERS ---

  const handleExportCSV = (session) => {
    if (!session.WorkshopRegistration?.length)
      return addToast('No attendees to export', 'error');

    const headers = ['Name', 'Email', 'Phone', 'Status', 'Amount', 'Date'];
    const rows = session.WorkshopRegistration.map((reg) => [
      reg.customerName,
      reg.customerEmail,
      reg.customerPhone || '',
      reg.paymentStatus,
      reg.amountPaid,
      new Date(reg.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees-${session.date.split('T')[0]}.csv`;
    a.click();
  };

  // ADD SESSION
  const handleAddSession = async (e) => {
    e.preventDefault();
    setSubmittingSession(true);
    try {
      const res = await fetch(`/api/admin/workshops/${id}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      });
      if (!res.ok) throw new Error('Failed');
      
      addToast('Session added', 'success');
      setIsSessionModalOpen(false);
      setNewSession({ date: '', time: '10:00 AM', spots: workshop.maxStudents || 10 });
      fetchWorkshop(); // Reload data
    } catch (error) {
      addToast('Failed to add session', 'error');
    } finally {
      setSubmittingSession(false);
    }
  };

  // DELETE SESSION
  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Delete this session? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/workshops/${id}/sessions?sessionId=${sessionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      
      setWorkshop(prev => ({
        ...prev,
        WorkshopSession: prev.WorkshopSession.filter(s => s.id !== sessionId)
      }));
      addToast('Session deleted', 'success');
    } catch (error) {
      addToast('Could not delete session', 'error');
    }
  };

  // PREPARE EDIT
  const openEditModal = () => {
    setEditFormData({
      title: workshop.title,
      price: workshop.price,
      description: workshop.description,
      maxStudents: workshop.maxStudents,
      duration: workshop.duration,
      location: workshop.location,
      image: workshop.image,
      status: workshop.status
    });
    setIsEditModalOpen(true);
  };

  // UPLOAD IMAGE (Inside Edit Modal)
  const handleEditImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', CLOUDINARY_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: data });
      const json = await res.json();
      setEditFormData(prev => ({ ...prev, image: json.secure_url }));
      addToast('Image updated', 'success');
    } catch (err) {
      addToast('Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // UPDATE WORKSHOP
  const handleUpdateWorkshop = async (e) => {
    e.preventDefault();
    setSavingWorkshop(true);
    try {
      const res = await fetch(`/api/admin/workshops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (!res.ok) throw new Error('Update failed');
      
      const updated = await res.json();
      setWorkshop(prev => ({ ...prev, ...updated })); // Optimistic update of main fields
      addToast('Workshop details updated', 'success');
      setIsEditModalOpen(false);
    } catch (error) {
      addToast('Failed to update workshop', 'error');
    } finally {
      setSavingWorkshop(false);
    }
  };

  // DELETE WORKSHOP
  const handleDeleteWorkshop = async () => {
    if(!confirm("Are you sure? This deletes the entire workshop history.")) return;
    try {
        await fetch(`/api/admin/workshops/${id}`, { method: 'DELETE'});
        addToast('Workshop deleted', 'success');
        router.push('/admin/workshops');
    } catch(e) {
        addToast("Delete failed", 'error');
    }
  }

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center text-[#C85428]">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );

  if (!workshop) return <div className="p-10 text-center text-[#8E5022]">Workshop not found</div>;

  // Stats for the detail view
  const totalBookings = workshop.WorkshopSession?.reduce((acc, s) => acc + s.spotsBooked, 0) || 0;
  const totalRevenue = totalBookings * workshop.price;

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-24">
      {/* Header & Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-white border border-[#EDD8B4] rounded-xl hover:bg-[#FDFBF7] text-[#8E5022] transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#442D1C] line-clamp-1">
              {workshop.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${workshop.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <p className="text-[#8E5022] text-xs md:text-sm">{workshop.location}</p>
            </div>
          </div>
        </div>
        
        {/* EDIT BUTTON */}
        <button 
            onClick={openEditModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#EDD8B4] text-[#442D1C] rounded-xl hover:bg-[#EDD8B4]/20 transition-colors shadow-sm text-sm font-bold"
        >
            <Edit2 size={16}/> Edit Details
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <StatCard icon={<Calendar />} label="Sessions" value={workshop.WorkshopSession?.length || 0} />
        <StatCard icon={<Users />} label="Total Students" value={totalBookings} />
        <StatCard icon={<DollarSign />} label="Est. Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
      </div>

      {/* Sessions List */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between border-b border-[#EDD8B4] pb-4">
          <h3 className="font-serif text-lg md:text-xl font-bold text-[#442D1C]">
            Scheduled Sessions
          </h3>
          <button
            onClick={() => setIsSessionModalOpen(true)}
            className="flex items-center gap-1.5 text-xs md:text-sm font-bold bg-[#442D1C] text-[#EDD8B4] px-4 py-2 rounded-xl hover:bg-[#652810] transition-all shadow-md active:scale-95"
          >
            <Plus size={16} /> Add Session
          </button>
        </div>

        <div className="space-y-4">
          {workshop.WorkshopSession?.length === 0 && (
              <div className="text-center py-10 bg-[#FDFBF7] rounded-xl border border-dashed border-[#EDD8B4] text-[#8E5022]">
                  No sessions scheduled yet.
              </div>
          )}
          {workshop.WorkshopSession?.map((session) => {
            const isExpanded = expandedSession === session.id;
            const occupancy = (session.spotsBooked / session.spotsTotal) * 100;
            const isFull = session.spotsBooked >= session.spotsTotal;
            const isPast = new Date(session.date) < new Date();

            return (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white border transition-all duration-300 rounded-xl overflow-hidden ${
                  isExpanded
                    ? 'border-[#C85428] ring-1 ring-[#C85428]/20 shadow-lg'
                    : 'border-[#EDD8B4] shadow-sm hover:border-[#C85428]/50'
                } ${isPast ? 'opacity-75 grayscale-[0.5]' : ''}`}
              >
                {/* Session Header (Clickable) */}
                <div
                  onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                  className="p-4 md:p-5 cursor-pointer bg-gradient-to-r from-white to-[#FDFBF7]"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex flex-col items-center justify-center border shrink-0 ${
                        isPast ? 'bg-stone-100 border-stone-200 text-stone-500' : 'bg-[#EDD8B4]/20 border-[#EDD8B4] text-[#442D1C]'
                      }`}>
                        <span className="text-[10px] font-bold uppercase">
                          {new Date(session.date).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-lg md:text-xl font-serif font-bold">
                          {new Date(session.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#442D1C] flex items-center gap-2 text-sm md:text-base">
                          {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          {isFull && !isPast && <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Full</span>}
                          {isPast && <span className="text-[9px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full uppercase border border-stone-200">Done</span>}
                        </h4>
                        <div className="flex items-center gap-3 text-xs md:text-sm text-[#8E5022] mt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {session.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0 pl-[64px] md:pl-0">
                      <div className="flex flex-col items-end min-w-[80px]">
                        <div className="flex justify-between w-full text-[10px] font-medium mb-1">
                          <span className="text-[#8E5022]">Occupancy</span>
                          <span className="text-[#442D1C]">{session.spotsBooked}/{session.spotsTotal}</span>
                        </div>
                        <div className="w-24 h-1.5 bg-[#EDD8B4]/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : occupancy > 50 ? 'bg-[#C85428]' : 'bg-green-500'}`}
                            style={{ width: `${occupancy}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                        {isExpanded ? <ChevronUp size={20} className="text-[#C85428]" /> : <ChevronDown size={20} className="text-[#EDD8B4]" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#EDD8B4]"
                    >
                      <div className="p-4 md:p-5 bg-[#FDFBF7]">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="font-serif font-bold text-[#442D1C] text-sm">Registered Attendees</h5>
                          <button
                            onClick={() => handleExportCSV(session)}
                            className="flex items-center gap-1.5 text-xs font-bold text-[#C85428] hover:bg-[#C85428]/10 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Download size={14} /> Export
                          </button>
                        </div>

                        {session.WorkshopRegistration?.length > 0 ? (
                          <div className="bg-white rounded-xl border border-[#EDD8B4] overflow-hidden overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                              <thead className="bg-[#EDD8B4]/10 text-[#8E5022]">
                                <tr>
                                  <th className="px-4 py-3 font-medium">Name</th>
                                  <th className="px-4 py-3 font-medium">Email</th>
                                  <th className="px-4 py-3 font-medium">Status</th>
                                  <th className="px-4 py-3 font-medium text-right">Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#EDD8B4]/20">
                                {session.WorkshopRegistration.map((reg) => (
                                  <tr key={reg.id} className="hover:bg-[#FDFBF7]">
                                    <td className="px-4 py-3 font-medium text-[#442D1C]">{reg.customerName}</td>
                                    <td className="px-4 py-3 text-stone-600">{reg.customerEmail}</td>
                                    <td className="px-4 py-3">
                                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border ${
                                        reg.paymentStatus === 'PAID' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${reg.paymentStatus === 'PAID' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                        {reg.paymentStatus}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-stone-400 text-xs">
                                      {new Date(reg.createdAt).toLocaleDateString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-6 border-2 border-dashed border-[#EDD8B4] rounded-xl bg-white">
                            <Users className="w-6 h-6 text-[#EDD8B4] mx-auto mb-2" />
                            <p className="text-xs text-stone-500">No registrations yet.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* --- ADD SESSION MODAL --- */}
      <AnimatePresence>
        {isSessionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#442D1C]/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl font-bold text-[#442D1C]">Add Session</h3>
                <button onClick={() => setIsSessionModalOpen(false)}><X size={20} className="text-stone-400 hover:text-[#442D1C]" /></button>
              </div>
              <form onSubmit={handleAddSession} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#8E5022] uppercase mb-1">Date</label>
                  <input type="date" required value={newSession.date} onChange={(e) => setNewSession({ ...newSession, date: e.target.value })} className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8E5022] uppercase mb-1">Time</label>
                    <input type="time" required value={newSession.time} onChange={(e) => setNewSession({ ...newSession, time: e.target.value })} className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8E5022] uppercase mb-1">Capacity</label>
                    <input type="number" required value={newSession.spots} onChange={(e) => setNewSession({ ...newSession, spots: e.target.value })} className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg text-sm" placeholder={workshop.maxStudents} />
                  </div>
                </div>
                <button type="submit" disabled={submittingSession} className="w-full py-3 bg-[#442D1C] text-[#EDD8B4] font-bold rounded-xl hover:bg-[#652810] transition-colors">
                  {submittingSession ? 'Adding...' : 'Confirm'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EDIT WORKSHOP MODAL (NEW) --- */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#442D1C]/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-[#EDD8B4] flex justify-between items-center bg-[#FDFBF7]">
                <h3 className="font-serif text-xl font-bold text-[#442D1C]">Edit Workshop</h3>
                <button onClick={() => setIsEditModalOpen(false)}><X size={20} className="text-stone-400 hover:text-[#442D1C]" /></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {/* Image Preview & Upload */}
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-[#EDD8B4] group">
                    <img src={editFormData.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <label className="cursor-pointer text-white text-xs font-bold flex flex-col items-center">
                            {uploadingImage ? <Loader2 className="animate-spin"/> : <ImageIcon size={20}/>}
                            <span>Change Image</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleEditImageUpload} disabled={uploadingImage}/>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-[#8E5022] uppercase mb-1">Title</label>
                    <input type="text" value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} className="w-full p-2.5 border border-[#EDD8B4] rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-[#8E5022] uppercase mb-1">Price</label>
                        <input type="number" value={editFormData.price} onChange={e => setEditFormData({...editFormData, price: e.target.value})} className="w-full p-2.5 border border-[#EDD8B4] rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-[#8E5022] uppercase mb-1">Max Students</label>
                        <input type="number" value={editFormData.maxStudents} onChange={e => setEditFormData({...editFormData, maxStudents: e.target.value})} className="w-full p-2.5 border border-[#EDD8B4] rounded-lg text-sm" />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-[#8E5022] uppercase mb-1">Description</label>
                    <textarea rows={3} value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} className="w-full p-2.5 border border-[#EDD8B4] rounded-lg text-sm" />
                </div>
                
                {/* Delete Zone */}
                <div className="pt-4 mt-4 border-t border-[#EDD8B4]/30">
                    <button 
                        type="button" 
                        onClick={handleDeleteWorkshop}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                    >
                        <Trash2 size={14} /> Delete this workshop permanently
                    </button>
                </div>
              </div>

              <div className="p-4 border-t border-[#EDD8B4] bg-[#FDFBF7]">
                <button 
                    onClick={handleUpdateWorkshop} 
                    disabled={savingWorkshop || uploadingImage}
                    className="w-full py-3 bg-[#442D1C] text-[#EDD8B4] font-bold rounded-xl hover:bg-[#652810] transition-colors flex items-center justify-center gap-2"
                >
                    {savingWorkshop ? <Loader2 className="animate-spin w-4 h-4"/> : <><Save size={16}/> Save Changes</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-[#EDD8B4] shadow-sm flex items-center gap-3">
      <div className="p-2.5 bg-[#FDFBF7] rounded-lg text-[#C85428] border border-[#EDD8B4]/50">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#8E5022] uppercase tracking-wide">{label}</p>
        <p className="text-xl font-serif font-bold text-[#442D1C] mt-0.5">{value}</p>
      </div>
    </div>
  );
}