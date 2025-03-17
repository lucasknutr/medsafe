import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('role')?.value;

  // Restrict access to admin pages
  if (request.nextUrl.pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Restrict access to corretor pages
  if (request.nextUrl.pathname.startsWith('/corretor') && role !== 'CORRETOR') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Restrict access to advogado pages
  if (request.nextUrl.pathname.startsWith('/advogado') && role !== 'ADVOGADO') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}