import { createBrowserClient } from '@supabase/ssr';

/**
 * Returns a Supabase browser client.
 * Uses placeholder values when env vars are absent (e.g. during `next build`
 * without a .env.local). The real values from Vercel env vars kick in at runtime.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
  );
}
