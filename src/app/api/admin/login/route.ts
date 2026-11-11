import { NextRequest, NextResponse } from 'next/server';
import { 
  getAdminCredentials, 
  signSessionToken, 
  SESSION_COOKIE_NAME, 
  AdminSessionPayload 
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, pin, authMode } = body;

    const credentials = getAdminCredentials();
    let isAuthorized = false;
    let authMethod = 'password';

    if (authMode === 'pin' || pin) {
      // 6-Digit Quick PIN verification
      authMethod = 'pin';
      const cleanPin = String(pin || '').trim();
      if (cleanPin && cleanPin === credentials.pin) {
        isAuthorized = true;
      }
    } else {
      // Email + Password verification
      authMethod = 'password';
      const cleanPassword = String(password || '').trim();
      const cleanEmail = String(email || '').trim().toLowerCase();

      // We allow matching password directly or checking both email + password
      if (cleanPassword === credentials.password) {
        if (!cleanEmail || cleanEmail === credentials.email || cleanEmail === 'admin@arubekee.com' || cleanEmail === 'admin') {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { 
          error: authMethod === 'pin' 
            ? 'Invalid 6-digit access PIN. Please verify and try again.' 
            : 'Invalid email or password. Please verify and try again.' 
        },
        { status: 401 }
      );
    }

    // Generate signed session token valid for 7 days
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysInSeconds = 7 * 24 * 60 * 60;

    const payload: AdminSessionPayload = {
      user: 'Boutique Owner',
      email: credentials.email,
      role: 'owner',
      iat: now,
      exp: now + sevenDaysInSeconds,
    };

    const token = await signSessionToken(payload);

    // Create response and set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        name: payload.user,
        email: payload.email,
        role: payload.role,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: sevenDaysInSeconds,
    });

    return response;
  } catch (error: any) {
    console.error('[API /api/admin/login] Error:', error);
    return NextResponse.json(
      { error: 'An unexpected authentication error occurred', message: error.message },
      { status: 500 }
    );
  }
}

