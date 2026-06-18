import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Add any paths that don't require authentication here
const publicPaths = ["/login", "/icon.svg", "/apple-icon.png", "/manifest.webmanifest", "/icon-light-32x32.png", "/icon-dark-32x32.png"]

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Allow public paths and Next.js internal paths
  if (publicPaths.includes(path) || path.startsWith("/_next") || path.startsWith("/api")) {
    return NextResponse.next()
  }

  // Check for the session cookie
  const session = request.cookies.get("farm_auth_session")

  if (!session) {
    // Redirect to login if no session is found
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// Optionally, configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
