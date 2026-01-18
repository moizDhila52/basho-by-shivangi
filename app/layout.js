// import { Inter, Noto_Serif_JP } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import OfflineWrapper from '@/components/OfflineWrapper';
import { ToastProvider } from '@/components/ToastProvider';
import './globals.css';
import '../public/fonts/fonts.css';
import '../public/icons/material-symbols.css';
import { SocketProvider } from '@/context/SocketContext';
import SessionSync from '@/components/SessionSync';

export const metadata = {
  // 1. Set the Base URL (Important for SEO/Social Sharing)
  metadataBase: new URL('https://basho-by-shivangi.vercel.app'),

  // 2. Dynamic Title Configuration
  title: {
    default: 'Basho Pottery | Handcrafted Japanese Ceramics', // Shows on Home Page
    template: '%s | Basho Pottery', // Shows on other pages (e.g., "Shop | Basho Pottery")
  },

  description: 'Artisanal pottery by Shivangi. Handcrafted ceramics made in Surat.',

  // 3. Add Logo to Browser Tab (Favicon)
  icons: {
    icon: '/images/Basho - logotm-03.jpg',
    shortcut: '/images/Basho - logotm-03.jpg',
    apple: '/images/Basho - logotm-03.jpg', // Icon for iPhone home screen
  },

  // 4. Google Verification (From previous steps)
  verification: {
    google: 'google6cf62926745e2122',
  },

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Basho Pottery',
    title: 'Basho Pottery | Handcrafted Japanese Ceramics',
    description: 'Artisanal pottery by Shivangi.',
    images: [
      {
        url: '/images/Basho - logotm-03.jpg',
        width: 800,
        height: 600,
        alt: 'Basho Pottery Logo',
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <ToastProvider>
          <AuthProvider>
            <SessionSync />
            <SocketProvider>
              <CartProvider>
                <WishlistProvider>
                  <Header />

                  <main className="flex-grow flex flex-col">
                    <OfflineWrapper>
                      <AuthProvider>{children}</AuthProvider>
                    </OfflineWrapper>
                  </main>

                  <Footer />
                </WishlistProvider>
              </CartProvider>
            </SocketProvider>
          </AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#442D1C',
                color: '#EDD8B4',
                borderRadius: '12px',
                padding: '16px 24px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#EDD8B4',
                  secondary: '#10B981',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EDD8B4',
                  secondary: '#EF4444',
                },
              },
            }}
          />
        </ToastProvider>
      </body>
    </html>
  );
}