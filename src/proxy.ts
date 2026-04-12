import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configuration for routes that SHOULD NOT be protected
const PUBLIC_FILE_REGEX = /\.(.*)$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public files/assets (images, fonts, favicon, etc)
  if (PUBLIC_FILE_REGEX.test(pathname)) {
    return NextResponse.next();
  }

  // 2. Allow Next.js internals and API routes
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 3. Allow the login page itself to prevent redirect loops
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // 4. Check for Kestopur Authentication Token
  const token = request.cookies.get('kp_authToken')?.value;

  // 5. If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    // Store the original path to redirect back after login
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 6. Token exists, allow the request
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
