import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();

    // If no session exists (not logged in), return null user
    if (!session) {
      return NextResponse.json({ user: null });
    }

    // Return the user data stored in the cookie
    return NextResponse.json({ 
      user: {
        userId: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
        image: session.image
      } 
    });
  } catch (error) {
    console.error("Session API Error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}