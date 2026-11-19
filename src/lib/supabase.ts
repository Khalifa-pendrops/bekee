import { createClient, SupabaseClient } from '@supabase/supabase-js';

function sanitizeEnv(val?: string): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
}

const supabaseUrl = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
const supabaseAnonKey = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('your-supabase')
);

// Client-side Supabase client (Row-Level Security enforced)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Dynamic resolver for server-side Admin client (bypasses RLS)
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
  const serviceKey = sanitizeEnv(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE
  );

  if (url && serviceKey && !serviceKey.includes('your-supabase') && serviceKey !== supabaseAnonKey) {
    return createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return null;
}

// Server-side Admin client singleton (strictly null if no valid service role key)
export const supabaseAdmin = getSupabaseAdmin();


