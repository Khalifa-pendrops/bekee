// Web Crypto API HMAC-SHA256 Token Signing & Verification (Edge & Node compatible)

const SESSION_COOKIE_NAME = 'arubekee_admin_session';
const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || 'arubekee_super_secret_session_key_aba_2026_secured';

export function getAdminCredentials() {
  return {
    email: (process.env.ADMIN_EMAIL || 'owner@arubekee.com').toLowerCase().trim(),
    password: process.env.ADMIN_PASSWORD || 'Arubekee@Aba2026',
    pin: process.env.ADMIN_PIN || '202688',
  };
}

// Convert secret string to CryptoKey
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Base64Url encode/decode helpers
function base64UrlEncode(str: string): string {
  const b64 = typeof btoa === 'function' ? btoa(str) : Buffer.from(str).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('utf-8');
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
}

export interface AdminSessionPayload {
  user: string;
  email: string;
  role: 'owner' | 'manager';
  iat: number;
  exp: number;
}

/**
 * Signs a session payload and returns a compact token string (header.payload.signature)
 */
export async function signSessionToken(payload: AdminSessionPayload): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey();
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign));
  const encodedSignature = arrayBufferToBase64Url(signatureBuffer);

  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verifies a token and returns the payload, or null if invalid or expired
 */
export async function verifySessionToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;

    const key = await getCryptoKey();
    const enc = new TextEncoder();

    // Decode signature
    const sigBinary = base64UrlDecode(encodedSignature);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      enc.encode(dataToVerify)
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(payloadJson) as AdminSessionPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export { SESSION_COOKIE_NAME };

