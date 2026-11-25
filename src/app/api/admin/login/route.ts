import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { 
  getAdminCredentials, 
  signSessionToken, 
  SESSION_COOKIE_NAME, 
  AdminSessionPayload 
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

function safeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// In-memory rate limiting map for admin authentication attempts
interface RateLimitRecord {
  failedAttempts: number;
  lockoutUntil: number;
}
const loginRateLimitMap = new Map<string, RateLimitRecord>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return 'unknown-ip';
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const nowMs = Date.now();
    const rateRecord = loginRateLimitMap.get(ip);

    // Check if IP is currently locked out
    if (rateRecord && rateRecord.lockoutUntil > nowMs) {
      const waitMinutes = Math.ceil((rateRecord.lockoutUntil - nowMs) / 60000);
      return NextResponse.json(
        { 
          error: `Too many failed login attempts. For security, please wait ${waitMinutes} minute(s) before trying again.` 
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password, pin, authMode } = body;

    const credentials = getAdminCredentials();
    let isAuthorized = false;
    let authMethod = 'password';

    if (authMode === 'pin' || pin) {
      // 6-Digit Quick PIN verification
      authMethod = 'pin';
      const cleanPin = String(pin || '').trim();
      if (cleanPin && safeCompare(cleanPin, credentials.pin)) {
        isAuthorized = true;
      }
    } else {
      // Email + Password verification
      authMethod = 'password';
      const cleanPassword = String(password || '').trim();
      const cleanEmail = String(email || '').trim().toLowerCase();

      // We allow matching password directly or checking both email + password
      if (cleanPassword && safeCompare(cleanPassword, credentials.password)) {
        if (!cleanEmail || safeCompare(cleanEmail, credentials.email) || cleanEmail === 'admin@arubekee.com' || cleanEmail === 'admin') {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      // Increment failed attempts and introduce delay to stop high-speed brute force
      const currentFailures = (rateRecord?.failedAttempts || 0) + 1;
      const MAX_ATTEMPTS = 5;
      const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

      if (currentFailures >= MAX_ATTEMPTS) {
        loginRateLimitMap.set(ip, {
          failedAttempts: currentFailures,
          lockoutUntil: nowMs + LOCKOUT_DURATION_MS,
        });
      } else {
        loginRateLimitMap.set(ip, {
          failedAttempts: currentFailures,
          lockoutUntil: 0,
        });
      }

      // 600ms artificial delay to slow down automated enumeration
      await new Promise((resolve) => setTimeout(resolve, 600));

      const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - currentFailures);
      const attemptWarning = attemptsRemaining > 0 
        ? ` (${attemptsRemaining} attempt(s) remaining before temporary lockout)`
        : ' (Account temporarily locked for 15 minutes)';

      return NextResponse.json(
        { 
          error: authMethod === 'pin' 
            ? `Invalid 6-digit access PIN.${attemptWarning}` 
            : `Invalid email or password.${attemptWarning}` 
        },
        { status: 401 }
      );
    }

    // Authentication succeeded: clear rate limiting record for this IP
    loginRateLimitMap.delete(ip);

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

