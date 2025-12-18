'use client'

import { useEffect, useState } from 'react'
import { Search, Mail, Calendar, Award } from 'lucide-react'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetch('/api/admin/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(data)
        setLoading(false)
      })
  }, [])

  // Filter Logic
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="p-8 text-stone-400">Loading customers...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-800">Customers</h1>
          <p className="text-stone-500 text-sm mt-1">People who have purchased from Basho.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            placeholder="Search name or email..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-basho-clay transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Total Orders</th>
                <th className="px-6 py-4 font-semibold">Total Spent</th>
                <th className="px-6 py-4 font-semibold">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.email} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar with Initials */}
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-xs group-hover:bg-basho-earth group-hover:text-white transition-colors">
                        {customer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-stone-900">{customer.name}</div>
                        <div className="text-xs text-stone-400 flex items-center gap-1">
                          <Mail size={10} /> {customer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {customer.status === 'VIP' ? (
                       <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                         <Award size={10} /> VIP
                       </span>
                    ) : customer.status === 'Returning' ? (
                       <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                         Returning
                       </span>
                    ) : (
                       <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                         New
                       </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-stone-600 font-medium">
                    {customer.totalOrders} order{customer.totalOrders > 1 && 's'}
                  </td>
                  <td className="px-6 py-4 font-bold text-stone-800">
                    ₹{customer.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-stone-500 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(customer.lastOrderDate).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCustomers.length === 0 && (
            <div className="p-12 text-center text-stone-400">
              No customers found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}