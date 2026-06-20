'use client';

import { createClient } from './supabase';

/** Convert the URL-safe base64 VAPID public key to a Uint8Array for the browser push API. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(b64);
  const result = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) result[i] = raw.charCodeAt(i);
  return result;
}

/** True when the browser supports the full Web Push stack. */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/** Current notification permission state. */
export function getPermission(): NotificationPermission {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Ask for permission, subscribe to push, and save the subscription to Supabase.
 * Returns true on success, false if the user denied or an error occurred.
 */
export async function setupPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      /* eslint-disable-next-line */
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) as unknown as string,
    });

    const raw = subscription.toJSON() as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error('[setupPush] no authenticated user — subscription not saved');
      return false;
    }

    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: user.id,
        endpoint: raw.endpoint,
        p256dh: raw.keys.p256dh,
        auth_key: raw.keys.auth,
      },
      { onConflict: 'endpoint' }
    );
    if (error) console.error('[setupPush] upsert error:', error);

    return !error;
  } catch (err) {
    console.error('[setupPush] error:', err);
    return false;
  }
}

/** Register the service worker at /sw.js. Call once on app mount. */
export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch {
    // Non-fatal — push just won't work
  }
}
