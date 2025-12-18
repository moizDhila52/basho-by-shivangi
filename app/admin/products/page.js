'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner' // or use alert() if you don't have sonner

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [categories, setCategories] = useState([])

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    categoryId: '', // You might need to fetch categories too, but let's hardcode IDs for now or fetch them
    imageUrl: ''
  })

  // Fetch Data
 const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch Products AND Categories at the same time
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories')
      ])
      
      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      
      setProducts(productsData)
      setCategories(categoriesData) // <--- Save categories
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handle Create
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // NOTE: In a real app, you would fetch categories to get the real ID. 
      // For this demo, we will use a "Tableware" ID or similar from your database.
      // You might need to check your database for a valid category ID to use here!
      
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) throw new Error('Failed')
      
      toast.success('Product Created!')
      setIsFormOpen(false)
      fetchProducts() // Refresh list
      setFormData({ name: '', price: '', description: '', categoryId: '', imageUrl: '' })
    } catch (error) {
      toast.error('Error creating product')
    }
  }

  // Handle Delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      toast.success('Product deleted')
      fetchProducts()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  if (loading) return <div className="p-8">Loading products...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-basho-earth">Products</h1>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="bg-basho-earth text-white hover:bg-basho-clay">
          <Plus size={16} className="mr-2" /> Add Product
        </Button>
      </div>

      {/* Add Product Form (Collapsible) */}
      {isFormOpen && (
        <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 mb-8">
          <h3 className="font-medium text-basho-earth mb-4">New Product Details</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input 
                required placeholder="Product Name" 
                className="p-3 rounded border border-stone-200 w-full"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <input 
                required type="number" placeholder="Price (₹)" 
                className="p-3 rounded border border-stone-200 w-full"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <input 
              required placeholder="Image URL (e.g. /products/vase.jpg)" 
              className="p-3 rounded border border-stone-200 w-full"
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
            />
            <textarea 
              required placeholder="Description" 
              className="p-3 rounded border border-stone-200 w-full"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
            
            {/* ⚠️ IMPORTANT: You need a valid Category ID here. 
                For now, enter one manually from your DB or we can fetch them. */}
           <div className="flex flex-col gap-1">
              <label className="text-xs text-stone-500 font-medium">Category</label>
              <select 
                required 
                className="p-3 rounded border border-stone-200 w-full bg-white outline-none focus:border-basho-clay"
                value={formData.categoryId}
                onChange={e => setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="">Select a Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-basho-earth text-white">Save Product</Button>
            </div>
          </form>
        </div>
      )}

      {/* Product List */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 border-b border-stone-100 text-stone-500">
            <tr>
              <th className="px-6 py-4 font-medium">Image</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-stone-50/50">
                <td className="px-6 py-4">
                  <div className="w-12 h-12 bg-stone-100 rounded flex items-center justify-center overflow-hidden">
                     {/* Try to show image, fallback to icon */}
                     {product.images && product.images[0] ? (
                       <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                     ) : (
                       <ImageIcon className="text-stone-300" size={20} />
                     )}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-stone-900">{product.name}</td>
                <td className="px-6 py-4 text-stone-500">{product.category?.name || 'Uncategorized'}</td>
                <td className="px-6 py-4 font-medium text-basho-earth">₹{product.price}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}