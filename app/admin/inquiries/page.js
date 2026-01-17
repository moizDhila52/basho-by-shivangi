'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  Mail,
  Phone,
  Briefcase,
  MessageSquare,
  Clock,
  ArrowUpRight,
  Trash2,
  FileText,
  Send,
  User,
  Calendar,
  RefreshCw,
  Loader2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useToast } from '@/components/ToastProvider';
import { useNotification } from '@/context/NotificationContext';

const INQUIRY_STATUSES = [
  'PENDING',
  'CONTACTED',
  'QUOTED',
  'CONVERTED',
  'ARCHIVED',
];

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState('CUSTOMER'); // "CUSTOMER" or "CORPORATE"
  const [replyMessage, setReplyMessage] = useState(''); // For the email composer
  const [isReplying, setIsReplying] = useState(false);
  const { addToast } = useToast();

  // Modal State
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const { refreshTrigger, markAsRead } = useNotification();

  useEffect(() => {
    markAsRead('inquiries');
  }, []);

  // 2. Real-time refresh
  useEffect(() => {
    if (refreshTrigger.inquiries > 0) {
      fetchInquiries();
    }
  }, [refreshTrigger.inquiries]);

  // --- Fetch Data ---
  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inquiries');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setInquiries(data);
    } catch (error) {
      addToast('Failed to load inquiries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // --- Filtering ---
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const isCorporate = item.companyName !== 'Individual';
      const typeMatches = viewType === 'CORPORATE' ? isCorporate : !isCorporate;

      const statusMatches =
        selectedStatus === 'ALL' || item.status === selectedStatus;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item.contactName?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower);

      return typeMatches && statusMatches && matchesSearch;
    });
  }, [inquiries, viewType, selectedStatus, searchQuery]);

  // --- Actions ---

  const handleStatusChange = async (id, newStatus) => {
    const oldInquiries = [...inquiries];
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i)),
    );
    if (selectedInquiry?.id === id)
      setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));

    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      addToast(`Status updated to ${newStatus}`, 'success');
    } catch (e) {
      setInquiries(oldInquiries);
      addToast('Failed to update status', 'error');
    }
  };

  const saveAdminNote = async () => {
    if (!selectedInquiry) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: adminNote }),
      });

      if (!res.ok) throw new Error();

      const updated = await res.json();
      setInquiries((prev) =>
        prev.map((i) => (i.id === updated.id ? updated : i)),
      );
      setSelectedInquiry(updated);
      addToast('Note saved successfully', 'success');
    } catch (e) {
      addToast('Failed to save note', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? This will delete the inquiry permanently.'))
      return;
    try {
      await fetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      if (selectedInquiry?.id === id) setIsModalOpen(false);
      addToast('Inquiry deleted', 'success');
    } catch (e) {
      addToast('Failed to delete', 'error');
    }
  };

  const openModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setAdminNote(inquiry.notes || '');
    setIsModalOpen(true);
  };

  // --- Stats ---
  const stats = useMemo(
    () => ({
      total: inquiries.length,
      pending: inquiries.filter((i) => i.status === 'PENDING').length,
      quoted: inquiries.filter((i) => i.status === 'QUOTED').length,
      converted: inquiries.filter((i) => i.status === 'CONVERTED').length,
    }),
    [inquiries],
  );

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    setIsReplying(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage }),
      });
      if (!res.ok) throw new Error();

      const updated = await res.json();
      setInquiries((prev) =>
        prev.map((i) => (i.id === updated.id ? updated : i)),
      );
      setSelectedInquiry(updated);
      setAdminNote(updated.notes);
      setReplyMessage('');
      addToast('Reply sent via email!', 'success');
    } catch (e) {
      addToast('Failed to send reply', 'error');
    } finally {
      setIsReplying(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C85428] animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#442D1C]">
            Inquiries
          </h1>
          <p className="text-[#8E5022] mt-1 text-sm">
            Manage customer messages and business partnerships.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* VIEW TOGGLE */}
          <div className="flex bg-[#EDD8B4]/20 p-1 rounded-xl border border-[#EDD8B4] flex-1 md:flex-none">
            <button
              onClick={() => setViewType('CUSTOMER')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                viewType === 'CUSTOMER'
                  ? 'bg-[#442D1C] text-white shadow-md'
                  : 'text-[#8E5022]'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => setViewType('CORPORATE')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                viewType === 'CORPORATE'
                  ? 'bg-[#442D1C] text-white shadow-md'
                  : 'text-[#8E5022]'
              }`}
            >
              Corporate
            </button>
          </div>

          <button
            onClick={fetchInquiries}
            className="p-2.5 border border-[#EDD8B4] rounded-lg hover:bg-[#FDFBF7] text-[#8E5022] transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats - Grid 2x2 on mobile, 4x1 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<Clock />}
          color="bg-yellow-100 text-yellow-700"
        />
        <StatCard
          label="Quoted"
          value={stats.quoted}
          icon={<FileText />}
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          label="Converted"
          value={stats.converted}
          icon={<CheckCircle />}
          color="bg-green-100 text-green-700"
        />
        <StatCard
          label="Total"
          value={stats.total}
          icon={<Briefcase />}
          color="bg-[#EDD8B4]/50 text-[#652810]"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#EDD8B4] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E5022]" />
          <input
            type="text"
            placeholder="Search company, contact person..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg text-sm text-[#442D1C] focus:ring-1 focus:ring-[#C85428] outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {['ALL', ...INQUIRY_STATUSES].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                selectedStatus === status
                  ? 'bg-[#442D1C] text-[#EDD8B4]'
                  : 'bg-[#FDFBF7] text-[#8E5022] border border-[#EDD8B4] hover:border-[#C85428]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* List Content */}
      <div className="bg-transparent md:bg-white md:rounded-xl md:border md:border-[#EDD8B4] md:overflow-hidden md:shadow-sm">
        {filteredInquiries.length === 0 ? (
          <div className="p-12 text-center text-[#8E5022] bg-white rounded-xl border border-[#EDD8B4] md:border-0">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No inquiries found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FDFBF7] border-b border-[#EDD8B4]">
                  <tr className="text-xs font-bold text-[#8E5022] uppercase">
                    <th className="p-4">Contact</th>
                    {viewType === 'CORPORATE' && <th className="p-4">Company</th>}
                    <th className="p-4">Interests</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDD8B4]/30 text-sm text-[#442D1C]">
                  {filteredInquiries.map((inquiry) => (
                    <tr
                      key={inquiry.id}
                      onClick={() => openModal(inquiry)}
                      className="hover:bg-[#FDFBF7]/50 cursor-pointer transition-colors group"
                    >
                      <td className="p-4">
                        <div className="font-bold">{inquiry.contactName}</div>
                        <div className="text-xs text-[#8E5022]">
                          {inquiry.email}
                        </div>
                      </td>
                      {viewType === 'CORPORATE' && (
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-3 h-3 text-[#8E5022]" />
                            {inquiry.companyName}
                          </div>
                          <div className="text-xs text-[#8E5022] pl-5">
                            {inquiry.companySize || 'N/A'}
                          </div>
                        </td>
                      )}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {inquiry.interest?.slice(0, 2).map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-[#EDD8B4]/30 rounded text-xs text-[#652810] border border-[#EDD8B4]/50"
                            >
                              {tag}
                            </span>
                          ))}
                          {(inquiry.interest?.length || 0) > 2 && (
                            <span className="text-xs text-[#8E5022]">...</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={inquiry.status} />
                      </td>
                      <td className="p-4 text-right text-[#8E5022]">
                        {format(new Date(inquiry.createdAt), 'MMM dd')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  onClick={() => openModal(inquiry)}
                  className="bg-white p-4 rounded-xl border border-[#EDD8B4] shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-[#442D1C]">{inquiry.contactName}</h3>
                      <p className="text-xs text-[#8E5022]">{inquiry.email}</p>
                    </div>
                    <StatusBadge status={inquiry.status} />
                  </div>

                  {viewType === 'CORPORATE' && (
                    <div className="flex items-center gap-2 text-sm text-[#652810] mb-2 bg-[#FDFBF7] p-2 rounded-lg">
                      <Briefcase className="w-3 h-3 text-[#8E5022]" />
                      <span className="font-medium">{inquiry.companyName}</span>
                      <span className="text-xs text-[#8E5022] ml-auto">
                        {inquiry.companySize || 'N/A'}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#EDD8B4]/30">
                    <div className="flex flex-wrap gap-1">
                      {inquiry.interest?.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-[#EDD8B4]/20 rounded text-[10px] font-medium text-[#652810]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-[#8E5022] whitespace-nowrap ml-2">
                      {format(new Date(inquiry.createdAt), 'MMM dd')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- Detail Modal --- */}
      <AnimatePresence>
        {isModalOpen && selectedInquiry && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-[#442D1C]/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full h-[95vh] md:h-auto md:max-h-[90vh] md:w-full md:max-w-4xl md:rounded-xl shadow-2xl flex flex-col overflow-hidden border-t md:border border-[#EDD8B4] mt-auto md:mt-0 rounded-t-2xl"
            >
              {/* Modal Header */}
              <div className="p-4 md:p-6 bg-[#FDFBF7] border-b border-[#EDD8B4] flex justify-between items-start shrink-0">
                <div>
                  <h2 className="font-serif text-xl md:text-2xl font-bold text-[#442D1C]">
                    {selectedInquiry.companyName === 'Individual'
                      ? 'Customer Inquiry'
                      : selectedInquiry.companyName}
                  </h2>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-[#8E5022] mt-1">
                    <User className="w-3 h-3" /> {selectedInquiry.contactName}
                    <span className="w-1 h-1 rounded-full bg-[#EDD8B4]" />
                    <Calendar className="w-3 h-3" />{' '}
                    {format(
                      new Date(selectedInquiry.createdAt),
                      'MMM dd, yyyy',
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 -mr-2 text-[#8E5022] hover:text-[#442D1C]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Left Side: Message Details & Admin Notes */}
                <div className="space-y-6">
                  <div className="bg-[#FDFBF7] p-4 rounded-lg border border-[#EDD8B4] space-y-2">
                    <p className="text-sm font-bold">
                      From: {selectedInquiry.contactName}
                    </p>
                    <p className="text-xs text-[#8E5022] flex items-center gap-1">
                      <Mail size={12} /> {selectedInquiry.email}
                    </p>
                    {selectedInquiry.phone && (
                      <p className="text-xs text-[#8E5022] flex items-center gap-1">
                        <Phone size={12} /> {selectedInquiry.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-[#8E5022] uppercase mb-2">
                      Message
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap border border-gray-100 max-h-60 overflow-y-auto">
                      {selectedInquiry.message}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-[#8E5022] uppercase mb-2">
                      Internal Admin Notes
                    </h3>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      className="w-full h-24 md:h-32 p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg text-sm outline-none resize-none"
                    />
                    <div className="mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs font-bold text-[#8E5022] uppercase">
                          Status:
                        </span>
                        <select
                          value={selectedInquiry.status}
                          onChange={(e) =>
                            handleStatusChange(
                              selectedInquiry.id,
                              e.target.value,
                            )
                          }
                          className="bg-white border border-[#EDD8B4] rounded px-2 py-1 text-sm outline-none flex-1 sm:flex-none"
                        >
                          {INQUIRY_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={saveAdminNote}
                        className="text-xs font-bold text-[#C85428] hover:underline w-full sm:w-auto text-right sm:text-left"
                      >
                        {savingNote ? 'Saving...' : 'Save Notes'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side: Email Composer */}
                <div className="bg-[#FDFBF7] p-4 md:p-6 rounded-xl border border-[#EDD8B4] flex flex-col">
                  <div className="flex items-center gap-2 mb-4 text-[#442D1C]">
                    <Send size={18} />
                    <h3 className="font-serif font-bold text-lg">
                      Send Email Reply
                    </h3>
                  </div>

                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 min-h-[150px] md:min-h-[250px] p-4 bg-white border border-[#EDD8B4] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#C85428]/20 resize-none"
                    placeholder="Write your professional response to the customer here..."
                  />

                  <button
                    onClick={handleSendReply}
                    disabled={isReplying || !replyMessage.trim()}
                    className="mt-4 w-full bg-[#442D1C] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#652810] disabled:opacity-50 transition-colors"
                  >
                    {isReplying ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <Send size={18} /> Send Official Reply
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-[#FDFBF7] border-t border-[#EDD8B4] flex justify-between items-center shrink-0 safe-area-pb">
                <button
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors flex items-center gap-2 text-sm"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="md:hidden">Delete</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-sm font-medium text-[#8E5022] hover:text-[#442D1C] px-4 py-2 border border-[#EDD8B4] rounded-lg bg-white"
                >
                  Close Detail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helpers
function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-3 md:p-4 rounded-xl border border-[#EDD8B4] shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[10px] md:text-xs text-[#8E5022] font-bold uppercase">{label}</p>
        <p className="text-xl md:text-2xl font-bold text-[#442D1C] mt-1">{value}</p>
      </div>
      <div className={`p-2 md:p-3 rounded-lg ${color}`}>
        {React.cloneElement(icon, { size: 18, className: "md:w-5 md:h-5" })}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONTACTED: 'bg-blue-100 text-blue-800 border-blue-200',
    QUOTED: 'bg-purple-100 text-purple-800 border-purple-200',
    CONVERTED: 'bg-green-100 text-green-800 border-green-200',
    ARCHIVED: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] md:text-xs font-bold border whitespace-nowrap ${
        styles[status] || 'bg-gray-100'
      }`}
    >
      {status}
    </span>
  );
}