import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge, COOKIE_NAME } from "./lib/auth-edge";

/**
 * Next.js Edge Middleware — runs BEFORE any page or API route renders.
 * Handles:
 *   1. Route protection  — unauthenticated users are redirected to /login
 *   2. Role enforcement  — students can't access /admin/* and vice-versa
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute   = pathname.startsWith("/admin");
  const isStudentRoute = pathname.startsWith("/student");

  // Only protect /admin/* and /student/* routes
  if (!isAdminRoute && !isStudentRoute) {
    return NextResponse.next();
  }

  const token  = req.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET ?? "";
  const user   = token ? await verifyTokenEdge(token, secret) : null;

  // Not logged in → redirect to login
  if (!user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Logged-in student trying to access /admin/* → redirect to their dashboard
  if (isAdminRoute && user.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/student/dashboard";
    return NextResponse.redirect(url);
  }

  // Logged-in admin trying to access /student/* → redirect to admin dashboard
  if (isStudentRoute && user.role !== "student") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on these route prefixes
  matcher: ["/admin/:path*", "/student/:path*"],
};