import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Check if the path starts with /admin
  if (path.startsWith('/admin')) {
    // Get the user's role from the session
    const userRole = request.cookies.get('role')?.value;

    // If no role or not ADMIN, redirect to home
    if (!userRole || userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}; 