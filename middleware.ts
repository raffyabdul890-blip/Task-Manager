import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(request: NextRequest) {
  // Skip auth middleware if Supabase isn't configured yet (e.g. local build without .env.local)
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOnAuth = request.nextUrl.pathname.startsWith('/auth');

  if (!user && !isOnAuth) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (user && isOnAuth) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Run on all routes EXCEPT Next.js internals and any static file
    // (anything containing a "." — e.g. icon.png, flowtask-mark.png, manifest.json, sw.js).
    // Pages never contain a dot, so auth protection still applies to them.
    '/((?!_next/static|_next/image|.*\\..*).*)',
  ],
};
