"use client";

import { useEffect, useState, useMemo } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useToast } from "@/components/ToastProvider";

const INQUIRY_STATUSES = [
  "PENDING",
  "CONTACTED",
  "QUOTED",
  "CONVERTED",
  "ARCHIVED",
];

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState(""); // Local state for note editing
  const [savingNote, setSavingNote] = useState(false);

  // --- Fetch Data ---
  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inquiries");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setInquiries(data);
    } catch (error) {
      addToast("Failed to load inquiries", "error");
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
      const matchesStatus =
        selectedStatus === "ALL" || item.status === selectedStatus;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item.companyName?.toLowerCase().includes(searchLower) ||
        item.contactName?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
    });
  }, [inquiries, selectedStatus, searchQuery]);

  // --- Actions ---

  const handleStatusChange = async (id, newStatus) => {
    // Optimistic Update
    const oldInquiries = [...inquiries];
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
    if (selectedInquiry?.id === id)
      setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));

    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      addToast(`Status updated to ${newStatus}`, "success");
    } catch (e) {
      setInquiries(oldInquiries);
      addToast("Failed to update status", "error");
    }
  };

  const saveAdminNote = async () => {
    if (!selectedInquiry) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: adminNote }),
      });

      if (!res.ok) throw new Error();

      // Update local state
      const updated = await res.json();
      setInquiries((prev) =>
        prev.map((i) => (i.id === updated.id ? updated : i))
      );
      setSelectedInquiry(updated);
      addToast("Note saved successfully", "success");
    } catch (e) {
      addToast("Failed to save note", "error");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This will delete the inquiry permanently."))
      return;
    try {
      await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      if (selectedInquiry?.id === id) setIsModalOpen(false);
      addToast("Inquiry deleted", "success");
    } catch (e) {
      addToast("Failed to delete", "error");
    }
  };

  const openModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setAdminNote(inquiry.notes || "");
    setIsModalOpen(true);
  };

  // --- Stats ---
  const stats = useMemo(
    () => ({
      total: inquiries.length,
      pending: inquiries.filter((i) => i.status === "PENDING").length,
      quoted: inquiries.filter((i) => i.status === "QUOTED").length,
      converted: inquiries.filter((i) => i.status === "CONVERTED").length,
    }),
    [inquiries]
  );

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C85428] animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#442D1C]">
            Corporate Inquiries
          </h1>
          <p className="text-[#8E5022] mt-1 text-sm">
            Manage B2B requests, bulk orders, and partnerships.
          </p>
        </div>
        <button
          onClick={fetchInquiries}
          className="p-2 border border-[#EDD8B4] rounded-lg hover:bg-[#FDFBF7] text-[#8E5022] transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            className="w-full pl-9 pr-4 py-2 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg text-sm text-[#442D1C] focus:ring-1 focus:ring-[#C85428] outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {["ALL", ...INQUIRY_STATUSES].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === status
                  ? "bg-[#442D1C] text-[#EDD8B4]"
                  : "bg-[#FDFBF7] text-[#8E5022] border border-[#EDD8B4] hover:border-[#C85428]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-[#EDD8B4] overflow-hidden shadow-sm">
        {filteredInquiries.length === 0 ? (
          <div className="p-12 text-center text-[#8E5022]">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No inquiries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FDFBF7] border-b border-[#EDD8B4]">
                <tr className="text-xs font-bold text-[#8E5022] uppercase">
                  <th className="p-4">Contact</th>
                  <th className="p-4">Company</th>
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
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3 h-3 text-[#8E5022]" />
                        {inquiry.companyName}
                      </div>
                      <div className="text-xs text-[#8E5022] pl-5">
                        {inquiry.companySize || "N/A"}
                      </div>
                    </td>
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
                      {format(new Date(inquiry.createdAt), "MMM dd")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Detail Modal --- */}
      <AnimatePresence>
        {isModalOpen && selectedInquiry && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#442D1C]/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-[#EDD8B4]"
            >
              {/* Modal Header */}
              <div className="p-6 bg-[#FDFBF7] border-b border-[#EDD8B4] flex justify-between items-start">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#442D1C]">
                    {selectedInquiry.companyName}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-[#8E5022] mt-1">
                    <User className="w-3 h-3" /> {selectedInquiry.contactName}
                    <span className="w-1 h-1 rounded-full bg-[#EDD8B4]" />
                    <Calendar className="w-3 h-3" />{" "}
                    {format(
                      new Date(selectedInquiry.createdAt),
                      "MMM dd, yyyy"
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#8E5022] hover:text-[#442D1C]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Contact & Status Bar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between bg-[#FDFBF7] p-4 rounded-lg border border-[#EDD8B4]">
                  <div className="space-y-1">
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="flex items-center gap-2 text-[#442D1C] hover:text-[#C85428] transition-colors text-sm font-medium"
                    >
                      <Mail className="w-4 h-4" /> {selectedInquiry.email}{" "}
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                    {selectedInquiry.phone && (
                      <div className="flex items-center gap-2 text-[#442D1C] text-sm">
                        <Phone className="w-4 h-4" /> {selectedInquiry.phone}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#8E5022] uppercase">
                      Status:
                    </span>
                    <select
                      value={selectedInquiry.status}
                      onChange={(e) =>
                        handleStatusChange(selectedInquiry.id, e.target.value)
                      }
                      className="bg-white border border-[#EDD8B4] rounded px-2 py-1 text-sm text-[#442D1C] focus:ring-1 focus:ring-[#C85428] outline-none"
                    >
                      {INQUIRY_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <h3 className="font-serif font-bold text-[#442D1C] mb-2">
                    Inquiry Message
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-[#442D1C] leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </div>
                </div>

                {/* Interests */}
                {selectedInquiry.interest?.length > 0 && (
                  <div>
                    <h3 className="font-serif font-bold text-[#442D1C] mb-2">
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedInquiry.interest.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-[#EDD8B4]/20 border border-[#EDD8B4] rounded-full text-sm text-[#652810]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Internal Notes */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-serif font-bold text-[#442D1C] flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Admin Notes
                    </h3>
                    {savingNote && (
                      <span className="text-xs text-[#8E5022] animate-pulse">
                        Saving...
                      </span>
                    )}
                  </div>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Write internal notes here (e.g. 'Sent catalog on 12th', 'Follow up next week')..."
                    className="w-full h-24 p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none text-sm text-[#442D1C]"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={saveAdminNote}
                      disabled={
                        savingNote || adminNote === selectedInquiry.notes
                      }
                      className="text-xs font-bold text-[#C85428] hover:text-[#8E5022] disabled:opacity-50"
                    >
                      {adminNote === selectedInquiry.notes
                        ? "Saved"
                        : "Save Note"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-[#FDFBF7] border-t border-[#EDD8B4] flex justify-between items-center">
                <button
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <a
                  href={`mailto:${selectedInquiry.email}?subject=Regarding your inquiry to Bashō&body=Hi ${selectedInquiry.contactName},%0D%0A%0D%0AThank you for reaching out to us regarding ${selectedInquiry.companyName}.%0D%0A%0D%0A`}
                  className="flex items-center gap-2 bg-[#442D1C] text-[#EDD8B4] px-6 py-2.5 rounded-lg font-bold hover:bg-[#652810] transition-colors"
                >
                  <Send className="w-4 h-4" /> Reply via Email
                </a>
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
    <div className="bg-white p-4 rounded-xl border border-[#EDD8B4] shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs text-[#8E5022] font-bold uppercase">{label}</p>
        <p className="text-2xl font-bold text-[#442D1C] mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONTACTED: "bg-blue-100 text-blue-800 border-blue-200",
    QUOTED: "bg-purple-100 text-purple-800 border-purple-200",
    CONVERTED: "bg-green-100 text-green-800 border-green-200",
    ARCHIVED: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-bold border ${
        styles[status] || "bg-gray-100"
      }`}
    >
      {status}
    </span>
  );
}

import React from "react";
