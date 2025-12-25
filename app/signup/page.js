"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: { street: "", city: "", state: "", pincode: "" },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["street", "city", "state", "pincode"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/"); // Success -> Home
    } else if (res.status === 409) {
      alert("Email already exists! Redirecting to login...");
      router.push("/login");
    } else {
      alert(data.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-[#FDFBF7] px-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg border border-[#EDD8B4]">
        <h1 className="text-3xl font-serif text-[#442D1C] mb-6 text-center">
          Join Bashō
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
              className="p-3 border rounded-lg bg-[#FDFBF7]"
            />
            <input
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
              required
              className="p-3 border rounded-lg bg-[#FDFBF7]"
            />
          </div>

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg bg-[#FDFBF7]"
          />
          <input
            name="password"
            type="password"
            placeholder="Create Password"
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg bg-[#FDFBF7]"
          />

          {/* Address Section */}
          <div className="pt-4 border-t border-[#EDD8B4]/30">
            <h3 className="text-[#8E5022] text-sm font-medium mb-3 uppercase tracking-wider">
              Shipping Address
            </h3>
            <div className="space-y-4">
              <input
                name="street"
                placeholder="Street Address / Flat No"
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg bg-[#FDFBF7]"
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  name="city"
                  placeholder="City"
                  onChange={handleChange}
                  required
                  className="p-3 border rounded-lg bg-[#FDFBF7]"
                />
                <input
                  name="state"
                  placeholder="State"
                  onChange={handleChange}
                  required
                  className="p-3 border rounded-lg bg-[#FDFBF7]"
                />
                <input
                  name="pincode"
                  placeholder="Zip Code"
                  onChange={handleChange}
                  required
                  className="p-3 border rounded-lg bg-[#FDFBF7]"
                />
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#442D1C] text-white py-4 rounded-lg hover:bg-[#C85428] transition-colors font-medium"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-[#8E5022]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
