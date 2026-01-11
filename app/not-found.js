import Link from "next/link";
import { MoveLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    // CHANGED: Added 'min-h-[70vh]' to force height even if content is small
    <div className="relative flex-1 flex flex-col items-center justify-center w-full min-h-[70vh] bg-[#FAF7F2] text-[#442D1C] overflow-hidden">
      
      {/* Background Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <h1 className="font-serif text-[12rem] md:text-[20rem] opacity-[0.03] leading-none whitespace-nowrap">
          404
        </h1>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center px-6 animate-in fade-in zoom-in duration-500">
        
        <div className="w-16 h-16 bg-[#442D1C]/5 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-[#442D1C]/10">
          <Search className="w-8 h-8 text-[#442D1C]" />
        </div>

        <h2 className="font-serif text-3xl md:text-5xl mb-4 text-[#442D1C]">
          Fragment Missing
        </h2>

        <p className="text-[#442D1C]/70 text-sm md:text-lg max-w-md text-center leading-relaxed mb-8">
          The piece you are looking for has either been moved or hasn't been fired in the kiln yet.
        </p>

        <Link 
          href="/"
          className="group flex items-center gap-2 px-8 py-3 bg-[#442D1C] text-[#FAF7F2] rounded-full font-medium text-sm md:text-base transition-all hover:scale-105 hover:bg-black shadow-lg"
        >
          <MoveLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Return to Studio
        </Link>
      </div>
    </div>
  );
}