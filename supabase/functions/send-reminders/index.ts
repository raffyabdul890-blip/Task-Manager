/**
 * Supabase Edge Function: send-reminders
 *
 * Scheduled to run every minute via Supabase cron.
 * Finds tasks whose reminder time has arrived, sends a Web Push notification
 * to every subscription stored for that user, then marks the task as sent.
 *
 * Deploy:
 *   supabase functions deploy send-reminders --no-verify-jwt
 *
 * Cron (Supabase dashboard → Edge Functions → send-reminders → Schedule):
 *   * * * * *   (every minute)
 */

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")!;

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

serve(async (_req: Request) => {
  try {
    // Use service role so RLS is bypassed — this function runs as the system
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Find all tasks whose reminder time has passed but notification not yet sent
    const { data: tasks, error: taskErr } = await supabase
      .from("tasks")
      .select("id, user_id, title, due_date, due_time")
      .eq("completed", false)
      .eq("reminder_sent", false)
      .not("remind_at", "is", null)
      .lte("remind_at", new Date().toISOString())
      .limit(100);

    if (taskErr) throw taskErr;
    if (!tasks?.length) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    let sent = 0;

    for (const task of tasks) {
      // Get all push subscriptions for this user
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth_key")
        .eq("user_id", task.user_id);

      if (subs?.length) {
        const payload = JSON.stringify({
          title: "FlowTask Reminder",
          body: task.title,
          url: "/",
        });

        for (const sub of subs) {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth_key },
              },
              payload
            );
            sent++;
          } catch (err: any) {
            // HTTP 410 Gone = subscription expired; clean it up
            if (err?.statusCode === 410) {
              await supabase
                .from("push_subscriptions")
                .delete()
                .eq("endpoint", sub.endpoint);
            }
          }
        }
      }

      // Mark reminder as sent regardless of whether we had subscriptions,
      // to avoid re-querying this task on every future cron tick.
      await supabase
        .from("tasks")
        .update({ reminder_sent: true })
        .eq("id", task.id);
    }

    return new Response(JSON.stringify({ sent, processed: tasks.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-reminders error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
