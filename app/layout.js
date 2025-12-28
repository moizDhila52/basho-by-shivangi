//import { Inter, Noto_Serif_JP } from 'next/font/google';
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/layout/Header";
import { Toaster } from "react-hot-toast";
import "./globals.css";
// These appear to be custom local fonts/icons you added
import "../public/fonts/fonts.css";
import "../public/icons/material-symbols.css";
import { Car } from "lucide-react";

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
  title: "Basho Pottery | Handcrafted Japanese Ceramics",
  description: "Artisanal pottery by Shivangi.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <AuthProvider>
          {/* Header is inside AuthProvider so it can check login state */}
          <CartProvider>
            <Header />

            <main className="min-h-screen">
              <AuthProvider>{children}</AuthProvider>
            </main>
          </CartProvider>
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#442D1C",
              color: "#EDD8B4",
              borderRadius: "12px",
              padding: "16px 24px",
              fontSize: "14px",
              fontWeight: "500",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#EDD8B4",
                secondary: "#10B981",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#EDD8B4",
                secondary: "#EF4444",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
