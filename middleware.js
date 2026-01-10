import { NextResponse } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

// 1. Specify protected and public routes
const protectedRoutes = ["/profile", "/checkout"];
const publicRoutes = ["/login", "/signup", "/cart"];
const adminRoutes = ["/admin"];

export default async function middleware(req) {
  // 2. Check for current path
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(path);
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));

  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get("basho_session")?.value;
  const session = await decrypt(cookie);

  // 4. Redirect Logic

  // A. Authenticated user trying to access Login/Signup -> Send to Home
  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // B. Unauthenticated user trying to access Protected Routes -> Send to Login
  if ((isProtectedRoute || isAdminRoute) && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // C. Non-Admin trying to access Admin Routes -> Send to Home (or 403 page)
  if (isAdminRoute && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

// Configuration to prevent middleware from running on static files/images
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
