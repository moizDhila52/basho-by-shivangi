"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const [step, setStep] = useState("email"); // 'email' or 'otp'
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin/dashboard";
   
  async function handleSendOtp(e) {
    e.preventDefault();

    setLoading(true);
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) setStep("otp");
    else alert("Failed to send OTP");
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
    console.log(res)
    if (res.ok) {
      console.log("Response is OK!")

      router.replace(redirectUrl);
      //BUG: Above method is not working properly.

    } else {
      alert("Invalid OTP");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-[#EDD8B4]/50">
        <h1 className="text-2xl font-serif text-[#442D1C] mb-2 text-center">
          {step === "email" ? "Sign In" : "Verify OTP"}
        </h1>
        <p className="text-[#8E5022] text-center mb-8 text-sm">
          {step === "email" ? "Enter your email to continue" : `Code sent to ${email}`}
        </p>

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="email"
              placeholder="name@example.com"
              required={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-[#EDD8B4] rounded-lg focus:outline-none focus:border-[#C85428]"
            />
            <button
              disabled={loading}
              className="w-full bg-[#442D1C] text-white py-3 rounded-lg hover:bg-[#C85428] transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              placeholder="Enter 6-digit code"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 border border-[#EDD8B4] rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:border-[#C85428]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#442D1C] text-white py-3 rounded-lg hover:bg-[#C85428] transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-sm text-[#8E5022] hover:underline"
            >
              Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}