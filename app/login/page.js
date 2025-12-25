"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin/dashboard";

  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStep("otp");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        // Force a hard navigation to ensure session is loaded
        window.location.href = redirectUrl;
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
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
          {step === "email"
            ? "Enter your email to continue"
            : `Code sent to ${email}`}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="email"
              placeholder="name@example.com"
              required
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
              maxLength={6}
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
              onClick={() => {
                setStep("email");
                setError("");
              }}
              className="w-full text-sm text-[#8E5022] hover:underline"
            >
              Change Email
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-[#EDD8B4]/30">
          <p className="text-center text-sm text-[#8E5022]">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-medium text-[#442D1C] hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-[#442D1C]">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
