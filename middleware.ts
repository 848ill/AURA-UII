import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Allow auth pages and API routes to pass through
  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  // Check for auth cookie/session
  // If no session found, redirect to login
  // Note: This is a basic check. Full auth validation happens in components/API routes
  const authToken = request.cookies.get("sb-access-token")?.value ||
                    request.cookies.get("supabase-auth-token")?.value ||
                    request.headers.get("authorization")

  // For now, let pages handle their own auth checks
  // Middleware just passes through - auth is handled at component level
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

