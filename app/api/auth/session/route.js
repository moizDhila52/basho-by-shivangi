import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  // If no session, return null user
  if (!session) {
    return NextResponse.json({ user: null });
  }

  // Return the user data stored in the cookie
  return NextResponse.json({ user: session });
}
