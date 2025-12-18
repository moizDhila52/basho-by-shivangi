import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req) {
  try {
    const { password } = await req.json()

    // Check against the password in your .env file
    if (password === process.env.ADMIN_PASSWORD) {
      
      // 👇 FIX: We must "await" the cookies() function now
      const cookieStore = await cookies()

      // Set the cookie
      cookieStore.set('admin_token', 'authenticated', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      })

      return NextResponse.json({ success: true })
    }

    // ❌ Password Wrong
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })

  } catch (error) {
    console.error("Login Error:", error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}