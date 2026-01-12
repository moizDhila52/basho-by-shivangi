"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/components/ToastProvider";

// Password Strength Logic
const getPasswordStrength = (pass) => {
  let score = 0;
  if (!pass) return 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score;
};

export default function SignupPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- Session Sync (FIXED SIGNATURE HERE) ---
  // 👇 Ensure (user, nameOverride, phoneOverride) are all present
  const createSession = async (user, nameOverride, phoneOverride) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: nameOverride || user.displayName || "User",
          image: user.photoURL || null,
          phone: phoneOverride || null, // This caused your error
        }),
      });

      if (!res.ok) throw new Error("Session creation failed");

      addToast("Account created successfully!", "success");

      // Force Hard Reload to update UI
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      addToast("Failed to sync session", "error");
    }
  };

  // --- Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create User in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // 2. Update Firebase Profile with Name
      if (formData.name) {
        await updateProfile(user, { displayName: formData.name });
      }

      // 3. Create Backend Session (Pass Phone here)
      await createSession(user, formData.name, formData.phone); 
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        addToast("Email already exists. Try logging in.", "error");
      } else {
        addToast(error.message, "error");
      }
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Google usually doesn't provide phone, so we pass null/undefined
      await createSession(result.user);
    } catch (error) {
      addToast(error.message, "error");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFBF7]">
      {/* Left: Brand Section */}
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-serif text-[#442D1C]">
              Create Account
            </h2>
            <p className="mt-2 text-[#8E5022] text-sm">
              Already a member?{" "}
              <Link
                href="/login"
                className="font-bold underline hover:text-[#442D1C]"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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

              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-transparent border-b border-[#EDD8B4] focus:border-[#442D1C] outline-none placeholder-[#8E5022]/60 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-[#8E5022] hover:text-[#442D1C]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {formData.password.length > 0 && (
                <div className="flex gap-1 h-1 mt-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`flex-1 rounded-full transition-colors duration-300 ${
                        strength >= level
                          ? strength <= 2
                            ? "bg-red-400"
                            : strength === 3
                            ? "bg-yellow-400"
                            : "bg-green-500"
                          : "bg-[#EDD8B4]/30"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              disabled={loading}
              className="w-full bg-[#442D1C] text-white py-4 rounded-full hover:bg-[#652810] transition-all transform hover:scale-[1.01] font-medium disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                "Sign Up"
              )}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EDD8B4]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="px-4 bg-[#FDFBF7] text-[#8E5022]">
                Or sign up with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full bg-white border border-[#EDD8B4] text-[#442D1C] py-4 rounded-full hover:bg-[#FDFBF7] hover:border-[#C85428] transition-all font-bold flex items-center justify-center gap-3 group shadow-sm hover:shadow-md"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5 group-hover:scale-110 transition-transform"
            />
            Sign up with Google
          </button>
        </div>
      </div>
    </div>
  );
}