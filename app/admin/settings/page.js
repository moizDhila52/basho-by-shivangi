'use client'

import { useState } from 'react'
import { Save, Lock, Globe, AlertTriangle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner' // or alert()

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  
  // Mock State (In a real app, you'd fetch this from DB)
  const [settings, setSettings] = useState({
    storeName: 'Basho.',
    supportEmail: 'hello@basho.com',
    currency: 'INR',
    maintenanceMode: false
  })

  const handleSave = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    toast.success("Settings updated successfully")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-800">Settings</h1>
          <p className="text-stone-500 text-sm mt-1">Manage your store preferences and configurations.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 bg-basho-earth text-white px-6 py-2 rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
          <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* GENERAL SETTINGS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <h3 className="font-serif font-bold text-lg text-stone-800 mb-6 flex items-center gap-2">
          <Globe size={20} className="text-basho-clay" />
          General Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-500 uppercase">Store Name</label>
            <input 
              value={settings.storeName}
              onChange={(e) => setSettings({...settings, storeName: e.target.value})}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:border-basho-clay outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-500 uppercase">Support Email</label>
            <input 
              value={settings.supportEmail}
              onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:border-basho-clay outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-500 uppercase">Currency</label>
            <select 
              value={settings.currency}
              onChange={(e) => setSettings({...settings, currency: e.target.value})}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:border-basho-clay outline-none transition-colors"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECURITY / MAINTENANCE */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <h3 className="font-serif font-bold text-lg text-stone-800 mb-6 flex items-center gap-2">
          <Lock size={20} className="text-basho-clay" />
          Access Control
        </h3>
        
        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
          <div>
            <h4 className="font-medium text-stone-900">Maintenance Mode</h4>
            <p className="text-xs text-stone-500 mt-1">Disable the public store temporarily.</p>
          </div>
          <button 
            onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
              settings.maintenanceMode ? 'bg-basho-earth' : 'bg-stone-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
              settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* DANGER ZONE */}
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
        <h3 className="font-serif font-bold text-lg text-red-800 mb-4 flex items-center gap-2">
          <AlertTriangle size={20} />
          Danger Zone
        </h3>
        <p className="text-sm text-red-600 mb-6">
          Irreversible actions. Please be careful.
        </p>
        
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
            Reset Database
          </button>
          <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
            Delete Project
          </button>
        </div>
      </div>

    </div>
  )
}