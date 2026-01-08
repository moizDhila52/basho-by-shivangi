"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileForm({ user }) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/user/update", {
      method: "PUT",
      body: JSON.stringify(formData),
    });
    setSaving(false);
    if (res.ok) {
      alert("Profile updated!");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-wide text-[#8E5022] mb-1">
          Full Name
        </label>
        <input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-3 border border-[#EDD8B4] rounded-lg"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-[#8E5022] mb-1">
          Email
        </label>
        <input
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-3 border border-[#EDD8B4] rounded-lg"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-[#8E5022] mb-1">
          Phone
        </label>
        <input
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full p-3 border border-[#EDD8B4] rounded-lg"
        />
      </div>
      <button
        disabled={saving}
        className="bg-[#442D1C] text-white px-6 py-3 rounded-lg hover:bg-[#C85428] transition-colors"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
