import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isLoginPage = pathname === '/admin/login';
  const isLoginApi = pathname === '/api/admin/login';
  const isLogoutApi = pathname === '/api/admin/logout';
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  // Skip middleware for public routes
  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // Allow login and logout endpoints through without authentication
  if (isLoginPage || isLoginApi || isLogoutApi) {
    // If user is ALREADY authenticated and visits the login page, redirect them to /admin
    if (isLoginPage) {
      const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (sessionCookie) {
        const payload = await verifySessionToken(sessionCookie);
        if (payload) {
          return NextResponse.redirect(new URL('/admin', req.url));
        }
      }
    }
    return NextResponse.next();
  }

  // For all protected /admin and /api/admin paths, verify the session token
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (sessionCookie) {
    const payload = await verifySessionToken(sessionCookie);
    if (payload) {
      isAuthenticated = true;
    }
  }

  if (!isAuthenticated) {
    // Return 401 for background API calls
    if (isAdminApi) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // Redirect to login page for browser navigation, preserving the target URL
    const nextDestination = pathname + search;
    const loginUrl = new URL('/admin/login', req.url);
    if (nextDestination && nextDestination !== '/admin') {
      loginUrl.searchParams.set('next', nextDestination);
    }

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};

