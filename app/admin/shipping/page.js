"use client";

import { useEffect, useState } from "react";
import { Truck, Receipt, Save, Calculator, Loader2 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

export default function ShippingAndGSTPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Updated Settings State
  const [settings, setSettings] = useState({
    shippingBaseRate: "0",
    shippingPerKgRate: "0",
    freeShippingThreshold: "0",
    gstPercent: "0",
    gstin: "",
    address: "",
  });

  // Updated Calculator State
  const [simulatedOrder, setSimulatedOrder] = useState({
    amount: "",
    weight: "", // New input for weight
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings/shipping");
        if (res.ok) {
          const data = await res.json();
          setSettings({
            shippingBaseRate: data.shippingBaseRate,
            shippingPerKgRate: data.shippingPerKgRate,
            freeShippingThreshold: data.freeShippingThreshold,
            gstPercent: data.gstPercent,
            gstin: data.gstin || "",
            address: data.address || "",
          });
        }
      } catch (error) {
        addToast("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) addToast("Settings saved", "success");
    } catch (error) {
      addToast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  // --- NEW: Weight-Based Calculation Logic ---
  const calculateCost = () => {
    const subtotal = parseFloat(simulatedOrder.amount) || 0;
    const totalWeight = parseFloat(simulatedOrder.weight) || 0;

    // GST Logic
    const gstAmount = (subtotal * parseFloat(settings.gstPercent)) / 100;

    // Shipping Logic (Base + (Weight * Rate))
    let shippingCost = 0;
    const isFreeShipping =
      subtotal >= parseFloat(settings.freeShippingThreshold);

    if (!isFreeShipping) {
      const base = parseFloat(settings.shippingBaseRate);
      const weightCost = totalWeight * parseFloat(settings.shippingPerKgRate);
      shippingCost = base + weightCost;
    }

    return {
      subtotal,
      gstAmount,
      shippingCost,
      total: subtotal + gstAmount + shippingCost,
      isFreeShipping,
    };
  };

  const result = calculateCost();

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT: Configuration Form */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Shipping Logic Card */}
          <div className="bg-white p-6 rounded-xl border border-[#EDD8B4] shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[#442D1C] mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" /> Shipping Logic
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Base Rate (₹)
                </label>
                <input
                  type="number"
                  value={settings.shippingBaseRate}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shippingBaseRate: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-[#EDD8B4] rounded bg-[#FDFBF7]"
                />
                <p className="text-[10px] text-[#8E5022] mt-1">
                  Fixed handling fee per order
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Rate per Kg (₹)
                </label>
                <input
                  type="number"
                  value={settings.shippingPerKgRate}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shippingPerKgRate: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-[#EDD8B4] rounded bg-[#FDFBF7]"
                />
                <p className="text-[10px] text-[#8E5022] mt-1">
                  Multiplied by total order weight
                </p>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  Free Shipping Above (₹)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      freeShippingThreshold: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-[#EDD8B4] rounded bg-[#FDFBF7]"
                />
              </div>
            </div>
          </div>

          {/* Tax Logic Card */}
          <div className="bg-white p-6 rounded-xl border border-[#EDD8B4] shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[#442D1C] mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5" /> Tax (GST)
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8E5022] uppercase mb-1">
                  GST %
                </label>
                <input
                  type="number"
                  value={settings.gstPercent}
                  onChange={(e) =>
                    setSettings({ ...settings, gstPercent: e.target.value })
                  }
                  className="w-full p-2 border border-[#EDD8B4] rounded bg-[#FDFBF7]"
                />
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
                  className="w-full p-2 border border-[#EDD8B4] rounded bg-[#FDFBF7] uppercase"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              disabled={saving}
              className="bg-[#442D1C] text-[#EDD8B4] px-6 py-2 rounded-lg font-bold hover:bg-[#652810]"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT: Simulator */}
      <div className="bg-[#442D1C] text-[#EDD8B4] p-6 rounded-xl h-fit sticky top-6 shadow-xl">
        <h2 className="font-serif text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" /> Cost Simulator
        </h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold mb-1 opacity-70">
              Cart Subtotal (₹)
            </label>
            <input
              type="number"
              value={simulatedOrder.amount}
              onChange={(e) =>
                setSimulatedOrder({ ...simulatedOrder, amount: e.target.value })
              }
              className="w-full p-2 rounded bg-[#652810] border-none text-white focus:ring-1 focus:ring-[#C85428]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 opacity-70">
              Total Weight (Kg)
            </label>
            <input
              type="number"
              value={simulatedOrder.weight}
              onChange={(e) =>
                setSimulatedOrder({ ...simulatedOrder, weight: e.target.value })
              }
              className="w-full p-2 rounded bg-[#652810] border-none text-white focus:ring-1 focus:ring-[#C85428]"
            />
          </div>
        </div>

        <div className="space-y-2 text-sm border-t border-white/10 pt-4">
          <div className="flex justify-between">
            <span className="opacity-70">Subtotal:</span>
            <span>₹{result.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">GST ({settings.gstPercent}%):</span>
            <span>₹{result.gstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#C85428]">
            <span className="font-bold">Shipping:</span>
            <span>
              {result.isFreeShipping
                ? "FREE"
                : `₹${result.shippingCost.toFixed(2)}`}
            </span>
          </div>
          {!result.isFreeShipping && (
            <div className="text-[10px] opacity-50 text-right">
              (Base: ₹{settings.shippingBaseRate} + Weight: ₹
              {(
                parseFloat(simulatedOrder.weight || 0) *
                parseFloat(settings.shippingPerKgRate)
              ).toFixed(2)}
              )
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-white border-t border-white/20 pt-2 mt-2">
            <span>Total:</span>
            <span>₹{result.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
