'use client'

import { useEffect, useState } from 'react'
import { DollarSign, ShoppingBag, Package, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react'

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data)
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-96 text-stone-400 animate-pulse">
      Loading analytics...
    </div>
  )

  const totalRevenue = orders.reduce((acc, order) => acc + Number(order.total), 0)
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status !== 'DELIVERED').length
  const recentOrders = orders.slice(0, 5)

  return (
    <div className="space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-800">Overview</h1>
          <p className="text-stone-500 mt-1">Welcome back, here is what's happening with your store today.</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-white border border-stone-200 text-sm px-4 py-2 rounded-lg outline-none hover:border-basho-earth transition-colors cursor-pointer">
            <option>Last 30 Days</option>
            <option>This Week</option>
            <option>Today</option>
          </select>
          <button className="bg-basho-earth text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors shadow-lg shadow-stone-200">
            Download Report
          </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString()}`} 
          trend="+12.5%" 
          isPositive={true}
          icon={<DollarSign size={24} className="text-white" />}
          color="bg-gradient-to-br from-basho-earth to-stone-700"
        />
        <StatCard 
          title="Total Orders" 
          value={totalOrders} 
          trend="+5.2%" 
          isPositive={true}
          icon={<ShoppingBag size={24} className="text-white" />}
          color="bg-gradient-to-br from-basho-clay to-orange-600"
        />
        <StatCard 
          title="Pending Shipments" 
          value={pendingOrders} 
          trend="-2 orders" 
          isPositive={false} // Just an example of visual logic
          icon={<Package size={24} className="text-white" />}
          color="bg-gradient-to-br from-stone-600 to-stone-800"
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Revenue Chart Placeholder */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-serif font-bold text-lg text-stone-800">Revenue Analytics</h3>
            <div className="flex gap-2 text-xs font-medium bg-stone-100 p-1 rounded-lg">
              <button className="px-3 py-1 bg-white rounded shadow-sm text-stone-800">Daily</button>
              <button className="px-3 py-1 text-stone-500 hover:text-stone-800">Monthly</button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-3 px-2 pb-2">
            {[35, 55, 40, 70, 50, 85, 60, 90, 65, 80, 45, 75].map((h, i) => (
              <div key={i} className="w-full relative group">
                <div 
                  className="w-full bg-basho-clay/20 rounded-t-lg transition-all duration-500 group-hover:bg-basho-earth"
                  style={{ height: `${h}%` }}
                ></div>
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  ₹{h * 100}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Donut */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow flex flex-col items-center justify-center relative">
          <h3 className="font-serif font-bold text-lg text-stone-800 absolute top-6 left-6">Audience</h3>
          <div className="w-56 h-56 rounded-full border-[24px] border-stone-100 border-t-basho-earth border-r-basho-clay flex items-center justify-center transform rotate-45 hover:rotate-90 transition-transform duration-700 ease-out">
            <div className="text-center transform -rotate-45">
              <span className="block text-4xl font-bold text-stone-800">85%</span>
              <span className="text-xs text-stone-500 uppercase tracking-wide">New Users</span>
            </div>
          </div>
          <div className="w-full flex justify-between px-8 mt-8">
            <div className="text-center">
              <p className="text-xs text-stone-400 mb-1">Returning</p>
              <p className="font-bold text-stone-800">15%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-stone-400 mb-1">New</p>
              <p className="font-bold text-stone-800">85%</p>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <h3 className="font-serif font-bold text-lg text-stone-800">Recent Transactions</h3>
          <button className="text-stone-400 hover:text-stone-600 p-2 hover:bg-stone-100 rounded-full transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Customer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="group hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-stone-100 flex items-center justify-center text-stone-400">
                        <Package size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-stone-900 group-hover:text-basho-earth transition-colors">
                          {order.items[0]?.product?.name || 'Bundle Order'}
                        </div>
                        {order.items.length > 1 && (
                          <div className="text-xs text-stone-400">+{order.items.length - 1} more items</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-stone-600">
                    ₹{Number(order.total).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                      order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      order.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-stone-100 text-stone-600 border-stone-200'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-600">
                        {order.customerName.charAt(0)}
                      </div>
                      <span className="text-stone-500">{order.customerName}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ✨ Animated Stats Card Component
function StatCard({ title, value, trend, isPositive, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-stone-500 font-medium mb-1">{title}</p>
          <h2 className="text-3xl font-bold text-stone-800 group-hover:text-basho-earth transition-colors">{value}</h2>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
          isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isPositive ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
          {trend}
        </span>
        <span className="text-xs text-stone-400">vs last month</span>
      </div>
    </div>
  )
}