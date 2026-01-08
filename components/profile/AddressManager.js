'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, MapPin, Loader2, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddressManager({ initialAddresses }) {
  // --- STATE ---
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 1. Open Modal for NEW Address
  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({
      street: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
    setIsModalOpen(true);
  };

  // 2. Open Modal for EDIT Address
  const openEditModal = (addr) => {
    setEditingAddress(addr);
    setFormData({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setIsModalOpen(true);
  };

  // 3. Handle Submit (Create OR Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const method = editingAddress ? 'PUT' : 'POST';
    const payload = { ...formData };
    if (editingAddress) payload.id = editingAddress.id;

    try {
      const res = await fetch('/api/address', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      toast.success(editingAddress ? 'Address updated' : 'Address added');
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Delete Logic (With Toast Confirmation)
  const executeDelete = async (id) => {
    try {
      const res = await fetch(`/api/address?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Address removed');
        router.refresh();
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting address');
    }
  };

  const confirmDelete = (id) => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium text-stone-600">
          Delete address?
        </div>
        <div className="flex items-center gap-2 border-l border-stone-200 pl-3">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-xs text-stone-400 hover:text-stone-600 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              executeDelete(id);
            }}
            className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {/* List Addresses */}
        {initialAddresses?.map((addr) => (
          <div
            key={addr.id}
            className="relative p-5 border border-[#EDD8B4] rounded-2xl bg-white hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FDFBF7] rounded-full">
                  <MapPin className="w-5 h-5 text-[#8E5022]" />
                </div>
                {addr.isDefault && (
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-[#442D1C] text-white px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>

              {/* EDIT & DELETE BUTTONS */}
              <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(addr)}
                  className="p-2 text-stone-400 hover:text-[#8E5022] hover:bg-[#EDD8B4]/20 rounded-full transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => confirmDelete(addr.id)}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="font-serif text-[#442D1C] text-lg mb-1">
              {addr.street}
            </p>
            <p className="text-stone-600 text-sm">
              {addr.city}, {addr.state} - {addr.pincode}
            </p>
          </div>
        ))}

        {/* Add Button (Only if < 2) */}
        {initialAddresses?.length < 2 ? (
          <button
            onClick={openAddModal}
            className="min-h-[160px] flex flex-col gap-3 items-center justify-center p-4 border-2 border-dashed border-[#EDD8B4] rounded-2xl text-[#8E5022] hover:bg-[#FDFBF7] hover:border-[#8E5022] transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[#EDD8B4]/20 flex items-center justify-center group-hover:bg-[#EDD8B4]/40 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-medium">Add New Address</span>
          </button>
        ) : (
          /* Limit Message (Only if >= 2) */
          <div className="min-h-[160px] flex flex-col items-center justify-center p-6 bg-stone-50 rounded-2xl border border-stone-200 text-center">
            <p className="text-stone-500 text-sm font-medium">
              Maximum of 2 addresses allowed.
            </p>
            <p className="text-stone-400 text-xs mt-1">
              Edit or delete an existing address to add a new one.
            </p>
          </div>
        )}
      </div>

      {/* Modal / Popup Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#FDFBF7] w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Dynamic Title */}
            <h3 className="font-serif text-2xl text-[#442D1C] mb-6">
              {editingAddress ? 'Edit Address' : 'New Address'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8E5022] mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-[#EDD8B4] bg-white focus:outline-none focus:border-[#8E5022] focus:ring-1 focus:ring-[#8E5022] transition-all"
                  placeholder="123 Zen Garden Lane"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8E5022] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-[#EDD8B4] bg-white focus:outline-none focus:border-[#8E5022]"
                    placeholder="Kyoto"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8E5022] mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-[#EDD8B4] bg-white focus:outline-none focus:border-[#8E5022]"
                    placeholder="Osaka"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8E5022] mb-1">
                  Pincode / ZIP
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-[#EDD8B4] bg-white focus:outline-none focus:border-[#8E5022]"
                  placeholder="550001"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#8E5022] cursor-pointer"
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm text-[#442D1C] cursor-pointer"
                >
                  Set as default address
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-[#8E5022] text-white py-4 rounded-xl font-medium hover:bg-[#652810] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : editingAddress ? (
                  'Update Address'
                ) : (
                  'Save Address'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
