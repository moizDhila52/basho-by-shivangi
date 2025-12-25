// middleware.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = ["/login", "/signup"].includes(path);
  const isAdminRoute = path.startsWith("/admin");

  // 1. Decrypt the session
  const session = await getSession();

  // --- DEBUGGING LOGS (Check your VS Code Terminal when you refresh) ---
  console.log(`[Middleware] Path: ${path}`);
  console.log(`[Middleware] User Role: ${session?.role}`);
  console.log(`[Middleware] Is Admin Route? ${isAdminRoute}`);
  // --------------------------------------------------------------------

  // 2. Redirect Logged-in Users AWAY from Login
  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // 3. Protect Admin Routes (The likely cause of your loop)
  if (isAdminRoute && (!session || session.role !== "ADMIN")) {
    console.log("[Middleware] ACCESS DENIED: Redirecting to Login");
    return NextResponse.redirect(
      new URL("/login?redirect=" + path, req.nextUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
