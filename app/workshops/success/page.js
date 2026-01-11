"use client";
import Link from "next/link";
import { CheckCircle, MapPin } from "lucide-react";

export default function WorkshopSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border border-[#EDD8B4] shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="font-serif text-2xl text-[#442D1C] mb-2">You're In!</h1>
        <p className="text-[#8E5022] mb-8">
          We've sent a confirmation email with all the details.
        </p>

        <div className="bg-[#FDFBF7] p-4 rounded-xl mb-8 text-left flex items-start gap-3">
          <MapPin className="text-[#C85428] w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[#442D1C] text-sm">Location</p>
            <p className="text-[#8E5022] text-sm">Studio Bashō, Surat</p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/profile/workshops"
            className="block w-full bg-[#442D1C] text-[#EDD8B4] py-3 rounded-xl font-bold hover:bg-[#2c1d12] transition-colors"
          >
            View My Ticket
          </Link>
          <Link
            href="/workshops"
            className="block w-full py-3 text-[#C85428] font-bold hover:bg-[#C85428]/5 rounded-xl transition-colors"
          >
            Book Another
          </Link>
        </div>
      </div>
    </div>
  );
}
