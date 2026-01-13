"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/components/ToastProvider";

// Validation utilities
const validators = {
  name: (value) => {
    if (!value.trim()) return "Name is required";
    if (value.trim().length < 2) return "Name must be at least 2 characters";
    if (value.trim().length > 50) return "Name must be less than 50 characters";
    if (!/^[a-zA-Z\s'-]+$/.test(value))
      return "Name can only contain letters, spaces, hyphens and apostrophes";
    return "";
  },

  email: (value) => {
    if (!value.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    if (value.length > 100) return "Email is too long";
    return "";
  },

  phone: (value) => {
    if (!value) return ""; // Phone is optional
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length < 10) return "Phone number must be at least 10 digits";
    if (cleaned.length > 10) return "Phone number is too long";
    return "";
  },

  password: (value) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (value.length > 128) return "Password is too long";
    if (!/[A-Z]/.test(value))
      return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(value))
      return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(value))
      return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(value))
      return "Password must contain at least one special character";
    if (/\s/.test(value)) return "Password cannot contain spaces";
    return "";
  },
};

// Password Strength Logic
const getPasswordStrength = (pass) => {
  let score = 0;
  if (!pass) return 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score;
};

const getStrengthLabel = (score) => {
  if (score === 0) return "";
  if (score <= 1) return "Weak";
  if (score === 2) return "Fair";
  if (score === 3) return "Good";
  return "Strong";
};

const getStrengthColor = (score) => {
  if (score <= 1) return "text-red-600";
  if (score === 2) return "text-orange-500";
  if (score === 3) return "text-yellow-600";
  return "text-green-600";
};

// Format phone number
const formatPhoneNumber = (value) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  return cleaned;
};

export default function SignupPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const strength = getPasswordStrength(formData.password);

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const error = validators[field](formData[field]);
    setErrors({ ...errors, [field]: error });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Format phone number as user types
    if (name === "phone") {
      processedValue = value.replace(/\D/g, "").slice(0, 15);
    }

    // Trim spaces from email
    if (name === "email") {
      processedValue = value.trim();
    }

    setFormData({ ...formData, [name]: processedValue });

    // Real-time validation if field was touched
    if (touched[name]) {
      const error = validators[name](processedValue);
      setErrors({ ...errors, [name]: error });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(validators).forEach((field) => {
      const error = validators[field](formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, phone: true });

    return Object.keys(newErrors).length === 0;
  };

  // Session Sync
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
          phone: phoneOverride || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Session creation failed");
      }

      addToast("Account created successfully!", "success");

      // Small delay for better UX
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error) {
      console.error("Session creation error:", error);
      addToast("Failed to sync session. Please try logging in.", "error");
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast("Please fix the errors before submitting", "error");
      return;
    }

    setLoading(true);

    try {
      // Create User in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Update Firebase Profile with Name
      if (formData.name) {
        await updateProfile(user, { displayName: formData.name.trim() });
      }

      // Create Backend Session
      await createSession(user, formData.name.trim(), formData.phone || null);
    } catch (error) {
      console.error("Signup error:", error);

      let errorMessage = "Failed to create account. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already registered. Try logging in instead.";
      } else if (error.code === "auth/weak-password") {
        errorMessage =
          "Password is too weak. Please choose a stronger password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format.";
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage =
          "Email/password accounts are not enabled. Please contact support.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      addToast(errorMessage, "error");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      await createSession(result.user);
    } catch (error) {
      console.error("Google signup error:", error);

      let errorMessage = "Failed to sign up with Google.";

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-up cancelled. Please try again.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Pop-up blocked. Please allow pop-ups and try again.";
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        errorMessage =
          "An account already exists with this email using a different sign-in method.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      addToast(errorMessage, "error");
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      formData.password &&
      !errors.name &&
      !errors.email &&
      !errors.password &&
      (!formData.phone || !errors.phone)
    );
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
        <div className="w-full max-w-[420px] space-y-8 pt-16">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-serif text-[#442D1C]">
              Create Account
            </h2>
            <p className="mt-2 text-[#8E5022] text-sm">
              Already a member?{" "}
              <Link
                href="/login"
                className="font-bold underline hover:text-[#442D1C] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Full Name */}
            <div className="relative">
              <input
                name="name"
                placeholder="Full Name *"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur("name")}
                className={`w-full p-4 bg-transparent border-b ${
                  touched.name && errors.name
                    ? "border-red-400"
                    : touched.name && !errors.name
                    ? "border-green-500"
                    : "border-[#EDD8B4]"
                } focus:border-[#442D1C] outline-none placeholder-[#8E5022]/60 transition-colors`}
                disabled={loading}
              />
              {touched.name && errors.name && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <XCircle size={12} />
                  <span>{errors.name}</span>
                </div>
              )}
              {touched.name && !errors.name && formData.name && (
                <div className="flex items-center gap-1 mt-1 text-green-600 text-xs">
                  <CheckCircle2 size={12} />
                  <span>Looks good!</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <input
                name="email"
                type="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                className={`w-full p-4 bg-transparent border-b ${
                  touched.email && errors.email
                    ? "border-red-400"
                    : touched.email && !errors.email
                    ? "border-green-500"
                    : "border-[#EDD8B4]"
                } focus:border-[#442D1C] outline-none placeholder-[#8E5022]/60 transition-colors`}
                disabled={loading}
              />
              {touched.email && errors.email && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <XCircle size={12} />
                  <span>{errors.email}</span>
                </div>
              )}
              {touched.email && !errors.email && formData.email && (
                <div className="flex items-center gap-1 mt-1 text-green-600 text-xs">
                  <CheckCircle2 size={12} />
                  <span>Valid email</span>
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div className="relative">
              <input
                name="phone"
                type="tel"
                placeholder="Phone Number (Optional)"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur("phone")}
                className={`w-full p-4 bg-transparent border-b ${
                  touched.phone && errors.phone
                    ? "border-red-400"
                    : touched.phone && formData.phone && !errors.phone
                    ? "border-green-500"
                    : "border-[#EDD8B4]"
                } focus:border-[#442D1C] outline-none placeholder-[#8E5022]/60 transition-colors`}
                disabled={loading}
              />
              {touched.phone && errors.phone && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                  <XCircle size={12} />
                  <span>{errors.phone}</span>
                </div>
              )}
              {touched.phone && formData.phone && !errors.phone && (
                <div className="flex items-center gap-1 mt-1 text-green-600 text-xs">
                  <CheckCircle2 size={12} />
                  <span>Valid phone number</span>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password *"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("password")}
                  className={`w-full p-4 bg-transparent border-b ${
                    touched.password && errors.password
                      ? "border-red-400"
                      : touched.password &&
                        !errors.password &&
                        formData.password
                      ? "border-green-500"
                      : "border-[#EDD8B4]"
                  } focus:border-[#442D1C] outline-none placeholder-[#8E5022]/60 transition-colors pr-10`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-[#8E5022] hover:text-[#442D1C] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {formData.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          strength >= level
                            ? strength <= 1
                              ? "bg-red-500"
                              : strength === 2
                              ? "bg-orange-400"
                              : strength === 3
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-[#EDD8B4]/30"
                        }`}
                      />
                    ))}
                  </div>
                  {strength > 0 && (
                    <p
                      className={`text-xs mt-1 font-medium ${getStrengthColor(
                        strength
                      )}`}
                    >
                      Password strength: {getStrengthLabel(strength)}
                    </p>
                  )}
                </div>
              )}

              {touched.password && errors.password && (
                <div className="flex items-start gap-1 mt-2 text-red-600 text-xs">
                  <XCircle size={12} className="mt-0.5 flex-shrink-0" />
                  <span>{errors.password}</span>
                </div>
              )}

              {/* Password Requirements */}
              {formData.password.length > 0 && !errors.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 size={12} />
                    <span>Strong password!</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full bg-[#442D1C] text-white py-4 rounded-full hover:bg-[#652810] transition-all transform hover:scale-[1.01] active:scale-[0.99] font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  Sign Up
                  <ArrowRight size={20} />
                </>
              )}
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
            type="button"
            className="w-full bg-white border-2 border-[#EDD8B4] text-[#442D1C] py-4 rounded-full hover:bg-[#FDFBF7] hover:border-[#C85428] transition-all font-bold flex items-center justify-center gap-3 group shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5 group-hover:scale-110 transition-transform"
            />
            Sign up with Google
          </button>

          <p className="text-xs text-center text-[#8E5022]/70 mt-6">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[#442D1C]">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-[#442D1C]">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
