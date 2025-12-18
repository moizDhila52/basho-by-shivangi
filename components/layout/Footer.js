'use client'

import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  // Hide on Admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="...">
      {/* ... existing footer code ... */}
    </footer>
  )
}