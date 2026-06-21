import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Supabase redirects here after the user clicks the confirmation link in their email.
 * We exchange the one-time code for a session, then send them to the app.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Where to land after a successful confirmation (defaults to the app home).
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Session cookie is set → open the user straight into the app.
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // No code, or the exchange failed/expired → send back to login with a hint.
  return NextResponse.redirect(new URL('/auth?confirmed=error', origin));
}
