'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Shield, Mail, User as UserIcon, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [admins, setAdmins] = useState([])
  
  // Form State (No Password)
  const [formData, setFormData] = useState({ name: '', email: '' })

  // 1. Fetch Admins on Load
  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/team')
      if (res.ok) {
        const data = await res.json()
        setAdmins(data)
      }
    } catch (error) {
      toast.error("Failed to load team members")
    }
  }

  // 2. Handle Add Admin
  const handleAddAdmin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed")

      // Success Feedback
      if (data.type === 'UPDATED') {
        toast.success(`Access granted to existing user: ${formData.email}`)
      } else {
        toast.success(`New admin account created: ${formData.email}`)
      }

      setFormData({ name: '', email: '' })
      setShowAddForm(false)
      fetchAdmins() // Refresh list
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // 3. Handle Revoke Access
  const handleRemoveAdmin = async (id) => {
    if (!confirm('Are you sure? This user will be downgraded to a Customer.')) return;

    try {
      const res = await fetch(`/api/admin/team?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error("Failed")

      toast.success("Admin access revoked")
      // Optimistic update
      setAdmins(admins.filter(admin => admin.id !== id))
    } catch (error) {
      toast.error("Could not revoke access")
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#442D1C]">Team Management</h1>
          <p className="text-[#8E5022] mt-1">Control who has access to the admin dashboard.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 bg-[#442D1C] text-white px-6 py-3 rounded-lg hover:bg-[#2E1F14] transition-all shadow-sm active:scale-95"
        >
          <Plus size={20} />
          <span>Add New Admin</span>
        </button>
      </div>

      {/* ADMIN TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EDD8B4]/50 overflow-hidden">
        
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 text-xs font-bold text-[#8E5022] uppercase tracking-wider border-b border-[#F3F0EB] bg-[#FDFBF7]">
          <div className="col-span-5 pl-4">User</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-3 text-right pr-4">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[#F3F0EB]">
          {admins.length === 0 ? (
            <div className="p-12 text-center text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              Loading team...
            </div>
          ) : (
            admins.map((admin) => (
              <div key={admin.id} className="group p-4 hover:bg-[#FDFBF7] transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  
                  {/* Name Column */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EDD8B4] text-[#442D1C] flex items-center justify-center font-serif font-bold text-lg uppercase shrink-0">
                      {admin.name ? admin.name.charAt(0) : 'U'}
                    </div>
                    <div>
                      <div className="font-medium text-[#442D1C]">{admin.name || 'Unknown'}</div>
                      <div className="text-xs text-[#C85428] font-medium tracking-wide">ADMINISTRATOR</div>
                    </div>
                  </div>

                  {/* Email Column */}
                  <div className="col-span-4 flex items-center text-sm text-stone-600 break-all">
                    <Mail size={14} className="mr-2 text-[#8E5022] shrink-0" />
                    {admin.email}
                  </div>

                  {/* Actions Column */}
                  <div className="col-span-3 flex justify-end">
                    <button 
                      onClick={() => handleRemoveAdmin(admin.id)}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Revoke Admin Access"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ADD ADMIN MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-[#FDFBF7] px-6 py-4 border-b border-[#EDD8B4]/30 flex justify-between items-center">
              <h3 className="font-serif font-bold text-xl text-[#442D1C]">New Administrator</h3>
              <button onClick={() => setShowAddForm(false)} className="text-[#8E5022] hover:text-[#442D1C]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="p-6 space-y-5">
              
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8E5022] uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Shivangi"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-lg focus:border-[#C85428] focus:ring-1 focus:ring-[#C85428] outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8E5022] uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="admin@basho.com"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-lg focus:border-[#C85428] focus:ring-1 focus:ring-[#C85428] outline-none transition-all text-sm"
                  />
                </div>
                <p className="text-xs text-stone-500">
                  If this user already exists, they will be upgraded to Admin status immediately.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-50 rounded-lg border border-transparent hover:border-stone-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-[#442D1C] text-white text-sm font-semibold rounded-lg hover:bg-[#2E1F14] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Grant Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}