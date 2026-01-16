'use client';

import { useState, useEffect, Suspense } from "react"; // Added Suspense
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  setPersistence,            // 👈 ADD THIS
  browserLocalPersistence,   // 👈 ADD THIS
  browserSessionPersistence, // 👈 ADD THIS
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/components/ToastProvider";
import { useAuth } from "@/components/AuthProvider";

// 1. We rename the main logic component to "LoginContent"
// This component reads the URL (searchParams), so it MUST be inside Suspense.
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const { user, loading: authLoading, refreshAuth } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    }
  }, [user, authLoading, router, searchParams]);

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [view, setView] = useState("login");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createBackendSession = async (firebaseUser) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          image: firebaseUser.photoURL,
          rememberMe: rememberMe,
        }),
      });

      if (!res.ok) throw new Error('Session creation failed');

      await refreshAuth();
      addToast('Welcome back!', 'success');
      const nextUrl = searchParams.get('redirect') || '/';
      router.push(nextUrl);
    } catch (error) {
      console.error(error);
      addToast('Failed to start session', 'error');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 4. Set persistence based on "Remember Me" checkbox
      const persistenceType = rememberMe
        ? browserLocalPersistence // Keep logged in
        : browserSessionPersistence; // Clear on close

      await setPersistence(auth, persistenceType);

      // 5. Proceed with sign in
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      await createBackendSession(userCredential.user);
    } catch (error) {
      const msg =
        error.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : error.message;
      addToast(msg, 'error');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createBackendSession(result.user);
    } catch (error) {
      addToast(error.message, 'error');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      return addToast('Please enter your email address', 'error');
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      addToast(
        'Link sent! Please check your inbox and spam folder.',
        'success',
      );
      setView("login");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        addToast("No account found with this email", "error");
      } else {
        addToast(error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-[420px] border border-[#EDD8B4]">
      {/* --- VIEW 1: FORGOT PASSWORD FORM --- */}
      {view === "forgot" ? (
        <div className="animate-in fade-in slide-in-from-right duration-300">
          <button
            onClick={() => setView("login")}
            className="flex items-center gap-1 text-sm text-[#8E5022] hover:text-[#442D1C] mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Login
          </button>

          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-[#442D1C] mb-2">
              Reset Password
            </h1>
            <p className="text-[#8E5022] text-sm">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8E5022] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#EDD8B4] focus:border-[#C85428] focus:ring-1 focus:ring-[#C85428] outline-none bg-[#FDFBF7] transition-all"
                placeholder="basho-user@gmail.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#442D1C] text-white py-3.5 rounded-xl hover:bg-[#652810] transition-all font-medium text-lg flex justify-center items-center gap-2 shadow-md hover:shadow-xl"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        </div>
      ) : (
        /* --- VIEW 2: LOGIN FORM (Standard) --- */
        <div className="animate-in fade-in slide-in-from-left duration-300">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-[#442D1C] mb-2">
              Welcome Back
            </h1>
            <p className="text-[#8E5022] text-sm">
              Sign in to continue your journey
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8E5022] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#EDD8B4] focus:border-[#C85428] focus:ring-1 focus:ring-[#C85428] outline-none bg-[#FDFBF7] transition-all"
                placeholder="basho-user@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8E5022] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-[#EDD8B4] focus:border-[#C85428] focus:ring-1 focus:ring-[#C85428] outline-none bg-[#FDFBF7] transition-all pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-[#8E5022] hover:text-[#442D1C] transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-[#EDD8B4] checked:border-[#C85428] checked:bg-[#C85428] transition-all"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <span className="text-stone-600 group-hover:text-[#442D1C] transition-colors">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={() => setView("forgot")}
                className="text-[#C85428] font-medium hover:text-[#A0401C] transition-colors text-sm"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#442D1C] text-white py-3.5 rounded-xl hover:bg-[#652810] transition-all font-medium text-lg flex justify-center items-center gap-2 shadow-md hover:shadow-xl translate-y-0 hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EDD8B4]/60"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="px-4 bg-white text-[#8E5022]">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border border-[#EDD8B4] text-[#442D1C] py-3 rounded-xl hover:bg-[#FDFBF7] hover:border-[#C85428] transition-all font-bold flex items-center justify-center gap-3 group shadow-sm hover:shadow-md"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5 group-hover:scale-110 transition-transform"
            />
            Sign in with Google
          </button>

          <div className="text-center mt-8 text-sm text-stone-500">
            New to Basho?{" "}
            <Link
              href="/signup"
              className="text-[#C85428] font-bold hover:underline"
            >
              Create an Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// 2. This is the New Main Component that wraps everything in Suspense
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4 py-10">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#8E5022]" />
            <p className="text-[#8E5022] font-serif">Loading Login...</p>
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}