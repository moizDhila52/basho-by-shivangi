//import { Inter, Noto_Serif_JP } from 'next/font/google';
import { AuthProvider } from "@/components/AuthProvider";
import Header from '@/components/layout/Header';
import { Toaster } from 'sonner';
import "./globals.css";
// These appear to be custom local fonts/icons you added
import "../public/fonts/fonts.css";
import "../public/icons/material-symbols.css";

/*
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSerif = Noto_Serif_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-noto-serif',
  display: 'swap',
});
*/
export const metadata = {
  title: 'Basho Pottery | Handcrafted Japanese Ceramics',
  description: 'Artisanal pottery by Shivangi.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <AuthProvider>
          {/* Header is inside AuthProvider so it can check login state */}
          <Header />
          
          <main className="min-h-screen">
            {children}
          </main>
          
          <Toaster richColors />
        </AuthProvider>
      </body>
    </html>
  );
}