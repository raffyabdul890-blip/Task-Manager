import { NextRequest, NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Supabase redirects here after the user clicks the confirmation link in their email.
 * Two link shapes exist depending on the project's email template / auth flow:
 *   • PKCE / magic-link:  ?code=...            → exchangeCodeForSession
 *   • Token-hash confirm: ?token_hash=&type=   → verifyOtp
 * We handle both so confirmation works regardless of how the template is set up.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  // Where to land after a successful confirmation (defaults to the app home).
  const next = searchParams.get('next') ?? '/';

  const supabase = createServerSupabaseClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Session cookie is set → open the user straight into the app.
      return NextResponse.redirect(new URL(next, origin));
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // No code/token, or the exchange failed/expired → send back to login with a hint.
  return NextResponse.redirect(new URL('/auth?confirmed=error', origin));
}
