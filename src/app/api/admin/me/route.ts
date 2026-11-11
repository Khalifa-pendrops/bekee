import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = await verifySessionToken(sessionCookie);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      name: payload.user,
      email: payload.email,
      role: payload.role,
    },
  });
}

