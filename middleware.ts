import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is an admin route (excluding login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin-login') {
    // Get the token from the cookies
    const token = request.cookies.get('adminToken')?.value;

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/admin-login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Optional: You can also validate the token here by making a request to your backend
    // For now, we'll just check if it exists
  }

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
     * - admin-login (login page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin-login).*)',
  ],
};
