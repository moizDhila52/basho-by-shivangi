'use client';

import { useEffect, useState } from 'react';
import { Truck, Receipt, Save, Calculator, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function ShippingAndGSTPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  // State matches Database Schema perfectly now
  const [settings, setSettings] = useState({
    shippingBaseRate: '',
    shippingPerKgRate: '',
    gstPercent: '',
    gstin: '',
    address: '',
  });

  // Simulator State
  const [simulatedOrder, setSimulatedOrder] = useState({
    amount: '',
    weight: '',
  });

  // 1. Fetch Saved Data on Load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/setting/shipping');
        if (res.ok) {
          const data = await res.json();
          setSettings({
            shippingBaseRate: data.shippingBaseRate || '0',
            shippingPerKgRate: data.shippingPerKgRate || '0',
            gstPercent: data.gstPercent || '0',
            gstin: data.gstin || '',
            address: data.address || '',
          });
        }
      } catch (error) {
        addToast('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 2. Save Data
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/setting/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        addToast('Settings saved successfully!', 'success');
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 3. Calculator Logic
  const calculateCost = () => {
    const subtotal = parseFloat(simulatedOrder.amount) || 0;
    const totalWeight = parseFloat(simulatedOrder.weight) || 0;
    const base = parseFloat(settings.shippingBaseRate || 0);
    const ratePerKg = parseFloat(settings.shippingPerKgRate || 0);
    const gstPct = parseFloat(settings.gstPercent || 0);

    const gstAmount = (subtotal * gstPct) / 100;

    let shippingCost = 0;
    if (totalWeight > 0) {
      if (totalWeight <= 1) {
        shippingCost = base;
      } else {
        const extraWeight = Math.ceil(totalWeight - 1);
        shippingCost = base + extraWeight * ratePerKg;
      }
    }

    return {
      subtotal,
      gstAmount,
      shippingCost,
      total: subtotal + gstAmount + shippingCost,
    };
  };

  const result = calculateCost();

  if (loading)
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C85428] animate-spin" />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT: Configuration Form */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Shipping Card */}
          <div className="bg-white p-6 rounded-xl border border-[#EDD8B4] shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[#442D1C] mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" /> Shipping Logic
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Base Rate (For 1st Kg)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-stone-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={settings.shippingBaseRate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        shippingBaseRate: e.target.value,
                      })
                    }
                    className="w-full pl-7 p-2 border border-[#EDD8B4] rounded bg-[#FDFBF7] focus:ring-1 focus:ring-[#C85428] outline-none remove-arrow"
                    placeholder="100"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Minimum charge for any order
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Extra Rate (Per Kg)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-stone-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={settings.shippingPerKgRate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        shippingPerKgRate: e.target.value,
                      })
                    }
                    className="w-full pl-7 p-2 border border-[#EDD8B4] rounded bg-[#FDFBF7] focus:ring-1 focus:ring-[#C85428] outline-none remove-arrow"
                    placeholder="80"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Added for every kg above 1kg
                </p>
              </div>
            </div>
          </div>

          {/* Tax Card */}
          <div className="bg-white p-6 rounded-xl border border-[#EDD8B4] shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[#442D1C] mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5" /> Tax (GST)
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  GST Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.gstPercent}
                    onChange={(e) =>
                      setSettings({ ...settings, gstPercent: e.target.value })
                    }
                    className="w-full p-2 border border-[#EDD8B4] rounded bg-[#FDFBF7] focus:ring-1 focus:ring-[#C85428] outline-none remove-arrow"
                    placeholder="12"
                  />
                  <span className="absolute right-3 top-2 text-stone-400">
                    %
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  My GSTIN
                </label>
                <input
                  type="text"
                  value={settings.gstin}
                  onChange={(e) =>
                    setSettings({ ...settings, gstin: e.target.value })
                  }
                  className="w-full p-2 border border-[#EDD8B4] rounded bg-[#FDFBF7] focus:ring-1 focus:ring-[#C85428] outline-none uppercase"
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Business Address (For Invoice)
                </label>
                <textarea
                  rows={2}
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                  className="w-full p-2 border border-[#EDD8B4] rounded bg-[#FDFBF7] focus:ring-1 focus:ring-[#C85428] outline-none"
                  placeholder="123, Pottery Lane, Jaipur..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#442D1C] text-[#EDD8B4] px-8 py-3 rounded-xl font-bold hover:bg-[#652810] transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT: Simulator */}
      <div className="bg-[#442D1C] text-[#EDD8B4] p-6 rounded-xl h-fit sticky top-6 shadow-xl">
        <h2 className="font-serif text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Calculator className="w-5 h-5" /> Cost Simulator
        </h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold mb-1 opacity-70 uppercase tracking-wider">
              Cart Subtotal (₹)
            </label>
            <input
              type="number"
              value={simulatedOrder.amount}
              onChange={(e) =>
                setSimulatedOrder({ ...simulatedOrder, amount: e.target.value })
              }
              className="w-full p-3 rounded-lg bg-[#652810] border border-transparent focus:border-[#C85428] text-white focus:outline-none placeholder:text-white/20 remove-arrow"
              placeholder="2000"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 opacity-70 uppercase tracking-wider">
              Total Weight (Kg)
            </label>
            <input
              type="number"
              value={simulatedOrder.weight}
              onChange={(e) =>
                setSimulatedOrder({ ...simulatedOrder, weight: e.target.value })
              }
              className="w-full p-3 rounded-lg bg-[#652810] border border-transparent focus:border-[#C85428] text-white focus:outline-none placeholder:text-white/20 remove-arrow"
              placeholder="1.5"
            />
          </div>
        </div>

        <div className="space-y-3 text-sm border-t border-white/10 pt-6">
          <div className="flex justify-between">
            <span className="opacity-70">Subtotal</span>
            <span>₹{result.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">GST ({settings.gstPercent}%)</span>
            <span>₹{result.gstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#EDD8B4] font-medium">
            <span>Shipping</span>
            <span>₹{result.shippingCost.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-xl font-bold text-white border-t border-white/20 pt-4 mt-2">
            <span>Total</span>
            <span>₹{result.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 👇 THIS CSS REMOVES THE ARROWS FROM NUMBER INPUTS 👇 */}
      <style jsx global>{`
        .remove-arrow::-webkit-inner-spin-button,
        .remove-arrow::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .remove-arrow {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
