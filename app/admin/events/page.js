// app/admin/events/page.js
"use client";

import React, { useState, useEffect } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import {
  Plus, Edit, Trash2, Search, Calendar, MapPin, 
  XCircle, CheckCircle, Clock, ChevronDown, Loader2, AlertCircle, Heart
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

// ... (Keep EVENT_STATUS constant same as before) ...
const EVENT_STATUS = {
  UPCOMING: { label: "Upcoming", color: "text-emerald-700 bg-emerald-50 border-emerald-100", icon: Clock },
  ONGOING: { label: "Ongoing", color: "text-blue-700 bg-blue-50 border-blue-100", icon: CheckCircle },
  COMPLETED: { label: "Completed", color: "text-stone-500 bg-stone-100 border-stone-200", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "text-red-700 bg-red-50 border-red-100", icon: XCircle },
};

export default function AdminEventsPage() {
  // ... (Keep existing state and fetch logic same as before) ...
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      const response = await fetch(`/api/events?${params.toString()}`);
      const data = await response.json();
      if (data.success) setEvents(data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    const toastId = toast.loading("Deleting event...");
    try {
      const response = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast.success("Event deleted successfully", { id: toastId });
        fetchEvents();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Failed to delete event", { id: toastId });
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    setUpdatingStatus(eventId);
    const toastId = toast.loading("Updating status...");
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        toast.success(`Status updated to ${newStatus}`, { id: toastId });
        setEvents(events.map(ev => ev.id === eventId ? { ...ev, status: newStatus } : ev));
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      toast.error("Failed to update status", { id: toastId });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 bg-[#FDFBF7] min-h-screen font-sans text-stone-800">
      <Toaster position="bottom-right" />
      <div className="max-w-7xl mx-auto">
        
        {/* ... (Header Section same as before) ... */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-[#8E5022] font-semibold tracking-wider text-xs uppercase mb-2 block">Dashboards</span>
            <h1 className="text-4xl font-serif text-[#442D1C]">Curate Events</h1>
            <p className="text-stone-500 font-light mt-2">Manage your exhibitions, pop-ups, and studio gatherings.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#8E5022] hover:bg-[#652810] text-white px-8 py-3 rounded-full font-medium transition-all shadow-xl shadow-[#8E5022]/20 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Event
          </button>
        </div>

        {/* ... (Search Section same as before) ... */}
         <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-[#8E5022]/20 text-stone-800 placeholder:text-stone-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-6 py-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-[#8E5022]/20 text-stone-700 font-medium cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center text-stone-500 flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin mb-4" />
                Loading calendar...
            </div>
          ) : filteredEvents.length > 0 ? (
            <table className="w-full">
              <thead className="bg-[#FAF9F6] border-b border-stone-100">
                <tr>
                  <th className="py-5 px-6 text-left text-xs font-bold uppercase tracking-wider text-stone-400 font-serif">Event</th>
                  <th className="py-5 px-6 text-left text-xs font-bold uppercase tracking-wider text-stone-400 font-serif">Schedule</th>
                  {/* ADDED HEADER */}
                  <th className="py-5 px-6 text-center text-xs font-bold uppercase tracking-wider text-stone-400 font-serif">Interest</th>
                  <th className="py-5 px-6 text-left text-xs font-bold uppercase tracking-wider text-stone-400 font-serif">Quick Status</th>
                  <th className="py-5 px-6 text-right text-xs font-bold uppercase tracking-wider text-stone-400 font-serif">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredEvents.map((event) => {
                  return (
                    <tr key={event.id} className="group hover:bg-stone-50/50 transition-colors">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                            {event.image && <img src={event.image} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <h3 className="font-serif text-lg text-stone-800 group-hover:text-[#8E5022] transition-colors">{event.title}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 uppercase tracking-wider border border-stone-200 mt-1 inline-block">
                                {event.type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-[#8E5022]" />
                            {new Date(event.startDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-stone-500">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.location}
                          </div>
                        </div>
                      </td>
                      
                      {/* ADDED INTEREST COUNT CELL */}
                      <td className="py-5 px-6 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm font-bold border border-red-100">
                            <Heart className="w-3.5 h-3.5 fill-current" />
                            {event.interestedCount || 0}
                        </div>
                      </td>

                      <td className="py-5 px-6">
                        <div className="relative inline-block">
                            {updatingStatus === event.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-[#8E5022]" />
                            ) : (
                                <select
                                    value={event.status}
                                    onChange={(e) => handleStatusChange(event.id, e.target.value)}
                                    className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border cursor-pointer outline-none focus:ring-2 focus:ring-[#8E5022]/20 transition-all ${EVENT_STATUS[event.status].color}`}
                                >
                                    <option value="UPCOMING">Upcoming</option>
                                    <option value="ONGOING">Ongoing</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            )}
                            {!updatingStatus && <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setSelectedEvent(event)} className="p-2 rounded-full text-stone-400 hover:text-[#8E5022] hover:bg-[#8E5022]/10 transition-all"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(event.id)} className="p-2 rounded-full text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-stone-400">
              <AlertCircle className="w-10 h-10 mb-2 opacity-20" />
              <p className="font-serif text-lg text-stone-500">No events found.</p>
            </div>
          )}
        </div>
      </div>

      {(showCreateModal || selectedEvent) && (
        <EventModal
          event={selectedEvent}
          onClose={() => { setShowCreateModal(false); setSelectedEvent(null); }}
          onSuccess={() => { fetchEvents(); setShowCreateModal(false); setSelectedEvent(null); }}
        />
      )}
    </div>
  );
}

// ... (EventModal remains the same as your previous code) ...
// Make sure EventModal import React and constants are handled if split in files.
function EventModal({ event, onClose, onSuccess }) {
    // ... Copy your exact modal code here ...
    // Just ensuring the file structure is valid for the response
    const [formData, setFormData] = useState({
        title: event?.title || "",
        description: event?.description || "",
        shortDescription: event?.shortDescription || "",
        type: event?.type || "EXHIBITION",
        location: event?.location || "",
        address: event?.address || "",
        startDate: event?.startDate ? new Date(event.startDate).toISOString().split("T")[0] : "",
        endDate: event?.endDate ? new Date(event.endDate).toISOString().split("T")[0] : "",
        image: event?.image || "",
        gallery: event?.gallery || [],
        status: event?.status || "UPCOMING",
        featured: event?.featured || false,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Saving event...");
        try {
            const url = event ? `/api/events/${event.id}` : "/api/events";
            const method = event ? "PUT" : "POST";
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (data.success) {
                toast.success(event ? "Event updated!" : "Event created!", { id: toastId });
                onSuccess();
            } else {
                throw new Error(data.error);
            }
        } catch(err) { 
            console.error(err); 
            toast.error("Failed to save event", { id: toastId });
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 p-6 border-b border-stone-100 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-serif text-[#442D1C]">{event ? "Edit Event" : "New Exhibition"}</h2>
                <p className="text-sm text-stone-500">Fill in the details below</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100 transition-colors"><XCircle className="w-6 h-6 text-stone-400" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ImageUpload label="Cover Image *" value={formData.image} onChange={(url) => setFormData({...formData, image: url})} />
                <ImageUpload label="Event Gallery (Optional)" multiple={true} value={formData.gallery} onChange={(urls) => setFormData({...formData, gallery: urls})} />
            </div>

            <div className="border-t border-stone-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-stone-700 mb-2 font-serif">Event Title</label>
                    <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-[#8E5022]/20" />
                </div>
                
                <div className="col-span-1">
                    <label className="block text-sm font-semibold text-stone-700 mb-2 font-serif">Type</label>
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-[#8E5022]/20">
                        <option value="EXHIBITION">Exhibition</option>
                        <option value="POPUP">Pop-up</option>
                        <option value="WORKSHOP">Workshop</option>
                        <option value="STUDIO_OPEN">Studio Opening</option>
                    </select>
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-semibold text-stone-700 mb-2 font-serif">Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-[#8E5022]/20">
                        <option value="UPCOMING">Upcoming</option>
                        <option value="ONGOING">Ongoing</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-semibold text-stone-700 mb-2 font-serif">Start Date</label>
                    <input required type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200" />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-semibold text-stone-700 mb-2 font-serif">End Date</label>
                    <input required type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200" />
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-semibold text-stone-700 mb-2 font-serif">Location Name</label>
                    <input required type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200" />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-semibold text-stone-700 mb-2 font-serif">Full Address</label>
                    <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200" />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-stone-700 mb-2 font-serif">Short Description</label>
                    <textarea rows={2} value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200" />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-stone-700 mb-2 font-serif">Full Details</label>
                    <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200" />
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <button type="button" onClick={onClose} className="flex-1 px-6 py-4 border border-stone-200 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition-colors" disabled={loading}>Cancel</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-[#8E5022] text-white rounded-xl font-medium hover:bg-[#652810] transition-colors shadow-xl shadow-[#8E5022]/20" disabled={loading}>{loading ? "Saving..." : event ? "Update Event" : "Create Event"}</button>
            </div>
            </form>
        </div>
        </div>
    );
}