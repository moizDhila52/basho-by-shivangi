'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  Package,
  AlertTriangle 
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete Warning State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form State (Newsletter removed)
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '' 
  });

  // 1. Fetch Data
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) setCategories(await res.json());
    } catch (error) {
      addToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}` 
        : '/api/admin/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed');

      addToast(editingCategory ? 'Category updated' : 'Category created', 'success');
      
      fetchCategories();
      closeModal();
    } catch (error) {
      addToast('Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const promptDelete = (category) => {
    setDeleteTarget(category);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
        addToast('Category and associated products deleted', 'success');
      } else {
        throw new Error('Failed');
      }
    } catch (error) {
      addToast('Delete failed', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ 
        name: category.name, 
        description: category.description || '' 
      });
    } else {
      setEditingCategory(null);
      setFormData({ 
        name: '', 
        description: '' 
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  // 3. Filter
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#C85428] animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#442D1C]">Categories</h1>
          <p className="text-[#8E5022] mt-1 text-sm">Organize your product catalog</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#442D1C] text-[#EDD8B4] px-5 py-2.5 rounded-lg font-medium hover:bg-[#652810] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-xl border border-[#EDD8B4] shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-[#EDD8B4]/30 bg-[#FDFBF7]/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E5022]" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#EDD8B4] rounded-lg text-sm text-[#442D1C] focus:ring-1 focus:ring-[#C85428] outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FDFBF7] text-[#8E5022] font-semibold border-b border-[#EDD8B4]">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Products</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDD8B4]/20">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-[#8E5022]/60">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-[#FDFBF7]/50 transition-colors group">
                    <td className="p-4 font-medium text-[#442D1C]">
                      {category.name}
                      {category.description && (
                        <p className="text-xs text-[#8E5022] font-normal mt-0.5 truncate max-w-xs">
                          {category.description}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-stone-500 font-mono text-xs">
                      {category.slug}
                    </td>
                    
                    {/* PRODUCT COUNT BADGE */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        (category._count?.Product || 0) > 0 
                          ? 'bg-[#EDD8B4]/30 text-[#8E5022]' 
                          : 'bg-stone-100 text-stone-400'
                      }`}>
                        <Package size={12} />
                        {category._count?.Product || 0} Products
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(category)}
                          className="p-1.5 text-[#8E5022] hover:bg-[#EDD8B4]/20 rounded transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        
                        <button 
                          onClick={() => promptDelete(category)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#442D1C]/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-[#EDD8B4]"
            >
              <div className="p-5 border-b border-[#EDD8B4] flex items-center justify-between bg-[#FDFBF7] rounded-t-xl">
                <h2 className="font-serif text-xl font-bold text-[#442D1C]">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h2>
                <button onClick={closeModal} className="text-[#8E5022] hover:text-[#442D1C]">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">Category Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none"
                    placeholder="e.g. Tableware"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-[#FDFBF7] border border-[#EDD8B4] rounded-lg focus:ring-1 focus:ring-[#C85428] outline-none resize-none"
                    placeholder="Brief description of this collection..."
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 text-[#8E5022] hover:bg-[#EDD8B4]/20 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-[#442D1C] text-[#EDD8B4] rounded-lg font-bold hover:bg-[#652810] shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : (editingCategory ? 'Save Changes' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#442D1C]/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-red-200 overflow-hidden"
            >
              <div className="bg-red-50 p-6 text-center border-b border-red-100">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-red-800">Delete Category?</h3>
                <p className="text-red-600/80 text-sm mt-2">
                  You are about to delete <strong>"{deleteTarget.name}"</strong>.
                </p>
              </div>
              
              <div className="p-6">
                <div className="bg-red-50 rounded-lg p-4 border border-red-100 mb-6">
                  <p className="text-sm text-red-800 font-medium flex flex-col gap-1 text-center">
                    <span>⚠️ Warning</span>
                    <span className="font-normal text-red-700">
                        This action will permanently delete this category AND <strong>ALL {deleteTarget._count?.Product || 0} associated products</strong>.
                    </span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 border border-stone-200 text-stone-600 rounded-lg font-medium hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isDeleting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}