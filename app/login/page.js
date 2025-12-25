"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const [useOtp, setUseOtp] = useState(false);
  const [step, setStep] = useState("input"); // 'input' or 'verify'
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/profile";

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // 1. Handle Password Login
  async function handlePasswordLogin(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });
    if (res.ok) {
      router.refresh();
      router.replace(redirectUrl);
    } else {
      alert("Invalid credentials");
      setLoading(false);
    }
  }

  // 2. Handle OTP Flow
  async function handleSendOtp(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email: formData.email }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) setStep("verify");
    else alert(data.error || "Failed to send OTP");
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email: formData.email, otp: formData.otp }),
    });
    if (res.ok) {
      router.refresh();
      router.replace(redirectUrl);
    } else {
      alert("Invalid Code");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-[#EDD8B4]">
        <h1 className="text-3xl font-serif text-[#442D1C] mb-2 text-center">
          Welcome Back
        </h1>

        {step === "input" ? (
          <form
            onSubmit={useOtp ? handleSendOtp : handlePasswordLogin}
            className="space-y-5 mt-6"
          >
            {/* Email Input */}
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              required
              onChange={handleChange}
              className="w-full p-3 border border-[#EDD8B4] rounded-lg bg-[#FDFBF7]"
            />

            {/* Conditional Input: Password OR Checkbox */}
            {!useOtp && (
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                onChange={handleChange}
                className="w-full p-3 border border-[#EDD8B4] rounded-lg bg-[#FDFBF7]"
              />
            )}

            {/* The Checkbox Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="otpToggle"
                checked={useOtp}
                onChange={() => setUseOtp(!useOtp)}
                className="w-4 h-4 accent-[#442D1C]"
              />
              <label
                htmlFor="otpToggle"
                className="text-sm text-[#8E5022] cursor-pointer"
              >
                Log in with OTP code instead
              </label>
            </div>

            <button
              disabled={loading}
              className="w-full bg-[#442D1C] text-white py-3 rounded-lg hover:bg-[#C85428] transition-colors"
            >
              {loading
                ? "Processing..."
                : useOtp
                ? "Get Verification Code"
                : "Sign In"}
            </button>
          </form>
        ) : (
          /* OTP Verification View */
          <form onSubmit={handleVerifyOtp} className="space-y-5 mt-6">
            <p className="text-center text-[#8E5022]">
              Code sent to {formData.email}
            </p>
            <input
              name="otp"
              placeholder="Enter 6-digit Code"
              required
              onChange={handleChange}
              className="w-full p-3 text-center text-xl tracking-widest border border-[#EDD8B4] rounded-lg"
            />
            <button
              disabled={loading}
              className="w-full bg-[#442D1C] text-white py-3 rounded-lg"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              type="button"
              onClick={() => setStep("input")}
              className="w-full text-sm text-[#8E5022]"
            >
              Back to Login
            </button>
          </form>
        )}

        <div className="mt-6 text-center border-t border-[#EDD8B4]/30 pt-4">
          <p className="text-[#8E5022]">
            New here?{" "}
            <Link href="/signup" className="font-bold underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
