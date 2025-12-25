import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/api/auth/send-otp",
  "/api/auth/verify-otp",
  "/api/auth/signup",
];
const adminRoutes = ["/admin", "/admin/(.*)"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname) || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Check session
  const session = await getSession();

  // If no session, redirect to login
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin routes
  if (
    adminRoutes.some((route) => pathname.startsWith(route.replace("/(.*)", "")))
  ) {
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
