/**
 * Canonical origin for building absolute links that must point at the *deployed*
 * app — most importantly the email-confirmation redirect.
 *
 * Why this exists: using `window.location.origin` for `emailRedirectTo` bakes
 * whatever host the form was submitted from into the confirmation link. Sign up
 * while the dev server is running and the email points at http://localhost:3000,
 * which is dead on any other device. Resolving an explicit production URL first
 * keeps confirmation links pointed at the real app.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL    — set this to your deployed URL (recommended)
 *   2. NEXT_PUBLIC_VERCEL_URL  — per-deployment host Vercel injects automatically
 *   3. window.location.origin  — browser fallback for plain local dev
 *   4. http://localhost:3000   — last-resort server-side fallback
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : '') ||
    (typeof window !== 'undefined' ? window.location.origin : '') ||
    'http://localhost:3000';

  // Ensure a scheme is present, then drop any trailing slash so callers can
  // safely append paths like `/auth/callback`.
  const withScheme = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  return withScheme.replace(/\/+$/, '');
}
