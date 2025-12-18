import { NextResponse } from 'next/server'

export function middleware(request) {
  // 1. Check if user is trying to access an /admin page
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // 2. Exception: Allow access to the Login page itself
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // 3. Check for the "admin_token" cookie
    const token = request.cookies.get('admin_token')

    // 4. If no token, redirect to Login
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return NextResponse.next()
}

// Optimization: Only run on admin routes
export const config = {
  matcher: '/admin/:path*',
}