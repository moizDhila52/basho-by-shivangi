import { Inter, Noto_Serif_JP } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import Header from '@/components/layout/Header'
import { Toaster } from 'sonner' 

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSerif = Noto_Serif_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-noto-serif',
  display: 'swap',
})

export const metadata = {
  title: 'Basho Pottery | Handcrafted Japanese Ceramics',
  description: 'Artisanal pottery by Shivangi.',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${notoSerif.variable}`}>
        <body className="antialiased font-sans">
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}