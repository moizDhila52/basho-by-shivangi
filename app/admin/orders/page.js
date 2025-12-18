'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, ChevronDown, CheckCircle, Truck, Clock } from 'lucide-react'
import { toast } from 'sonner' // Ensure you have sonner or use alert()

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  // 1. Fetch Orders
  const fetchOrders = async () => {
    const res = await fetch('/api/admin/orders')
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // 2. Handle Status Update
  const updateStatus = async (orderId, newStatus) => {
    // Optimistic UI Update (Update screen immediately)
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      })
      if (!res.ok) throw new Error()
      toast.success(`Order updated to ${newStatus}`)
    } catch (error) {
      toast.error("Failed to update status")
      fetchOrders() // Revert changes if API fails
    }
  }

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === filter)

  if (loading) return <div className="p-8">Loading orders...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-basho-earth">Order Management</h1>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'PROCESSING', 'DELIVERED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-medium rounded-full transition-colors ${
                filter === f 
                  ? 'bg-basho-earth text-white' 
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 border-b border-stone-100 text-stone-500">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer Details</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Current Status</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50/50">
                  <td className="px-6 py-4 font-mono text-xs text-stone-400">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-stone-900">{order.customerName}</p>
                    <p className="text-xs text-stone-500">{order.customerEmail}</p>
                    <p className="text-xs text-stone-500 mt-1">{order.address?.city}</p>
                  </td>
                  <td className="px-6 py-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="text-stone-600 flex justify-between w-full max-w-[200px]">
                        <span>{item.product?.name}</span>
                        <span className="text-stone-400 ml-2">x{item.quantity}</span>
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 font-medium text-basho-earth">
                    ₹{Number(order.total).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className="bg-white border border-stone-200 text-stone-700 text-xs rounded p-2 outline-none focus:border-basho-clay cursor-pointer"
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && (
            <div className="p-12 text-center text-stone-400">
              No orders found in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
    SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
    DELIVERED: 'bg-green-50 text-green-700 border-green-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  }

  const icons = {
    PENDING: <Clock size={12} className="mr-1" />,
    PROCESSING: <Clock size={12} className="mr-1" />,
    SHIPPED: <Truck size={12} className="mr-1" />,
    DELIVERED: <CheckCircle size={12} className="mr-1" />,
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.PENDING}`}>
      {icons[status]} {status}
    </span>
  )
}