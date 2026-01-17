'use client';
import Link from 'next/link';
import { CheckCircle, MapPin } from 'lucide-react';

export default function WorkshopSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 pb-24 md:pb-4">
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#EDD8B4] shadow-lg max-w-sm md:max-w-md w-full text-center">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 md:mb-6">
          <CheckCircle className="w-7 h-7 md:w-8 md:h-8 text-green-600" />
        </div>

        <h1 className="font-serif text-xl md:text-2xl text-[#442D1C] mb-2">
          You're In!
        </h1>
        <p className="text-[#8E5022] text-sm md:text-base mb-6 md:mb-8">
          We've sent a confirmation email with all the details.
        </p>

        <div className="bg-[#FDFBF7] p-4 rounded-xl mb-6 md:mb-8 text-left flex items-start gap-3 border border-[#EDD8B4]/30">
          <MapPin className="text-[#C85428] w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[#442D1C] text-sm">Location</p>
            <p className="text-[#8E5022] text-sm">Studio Bashō, Surat</p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/profile/workshops"
            className="block w-full bg-[#442D1C] text-[#EDD8B4] py-3 rounded-xl font-bold text-sm md:text-base hover:bg-[#2c1d12] transition-colors shadow-md hover:shadow-lg"
          >
            View My Ticket
          </Link>
          <Link
            href="/workshops"
            className="block w-full py-3 text-[#C85428] font-bold text-sm md:text-base hover:bg-[#C85428]/5 rounded-xl transition-colors border border-transparent hover:border-[#C85428]/10"
          >
            Book Another
          </Link>
        </div>
      </div>
    </div>
  );
}
      