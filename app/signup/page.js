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
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  // ... means spread so you can get all the value in the form of object
  // with e.target.name as the key and e.target.value

  const handleSubmit = async (e) => {
    e.preventDefault();
    //     What you are preventing
    // ❌ Page refresh
    // ❌ Browser-controlled request
    // ❌ Losing React state

    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" },
      //res.status     // 200, 400, 500
      // res.headers
      // res.body       // ReadableStream
      // res.ok         // true if 2xx
    });
    if (res.ok) {
      router.refresh();
      router.push("/"); // Redirect to Home/Profile
    } else {
      const data = await res.json();
      alert(data.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-[#FDFBF7]">
      {/* Left: Brand / Aesthetic Section */}
      <div className="hidden lg:flex w-1/2 bg-[#442D1C] items-center justify-center p-12 text-[#EDD8B4]">
        <div className="max-w-lg">
          <h1 className="text-5xl font-serif mb-6 leading-tight">
            Join the Circle of <br />
            Artisans & Admirers.
          </h1>
          <p className="text-lg opacity-80">
            Create an account to track orders, save shipping details, and curate
            your collection.
          </p>
        </div>
      </div>

      {/* Right: Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-serif text-[#442D1C]">
              Create Account
            </h2>
            <p className="mt-2 text-[#8E5022]">
              Already a member?{" "}
              <Link href="/login" className="font-bold underline">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <input
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                required
                className="w-full p-4 bg-transparent border-b border-[#EDD8B4] focus:border-[#442D1C] outline-none placeholder-[#8E5022]/60 transition-colors"
              />

              <input
                name="phone"
                placeholder="Phone Number"
                onChange={handleChange}
                required
                className="w-full p-4 bg-transparent border-b border-[#EDD8B4] focus:border-[#442D1C] outline-none placeholder-[#8E5022]/60 transition-colors"
              />

              <input
                name="email"
                type="email"
                placeholder="Email Address"
                onChange={handleChange}
                required
                className="w-full p-4 bg-transparent border-b border-[#EDD8B4] focus:border-[#442D1C] outline-none placeholder-[#8E5022]/60 transition-colors"
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="w-full p-4 bg-transparent border-b border-[#EDD8B4] focus:border-[#442D1C] outline-none placeholder-[#8E5022]/60 transition-colors"
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-[#442D1C] text-white py-4 rounded-full hover:bg-[#C85428] transition-all transform hover:scale-[1.01] font-medium disabled:opacity-50"
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
