"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ className = "" }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className={`px-4 py-2 border border-[#EDD8B4] text-[#442D1C] rounded-lg hover:bg-[#FDFBF7] transition-colors ${className}`}
    >
      Logout
    </button>
  );
}
