-- FlowTask — full schema + Row-Level Security
-- Idempotent: safe to run on an existing database (tables/policies are guarded).
--
-- ROOT CAUSE THIS FIXES:
-- The `tasks` table had RLS enabled but no (or broken) policies, so every
-- INSERT/SELECT from an authenticated browser user was silently denied, while
-- the service-role edge function (which bypasses RLS) worked fine.

-- ─── tasks ──────────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  title            text not null,
  description      text not null default '',
  priority         text not null default 'medium',
  due_date         date,
  due_time         time,
  category         text not null default 'Personal',
  completed        boolean not null default false,
  reminder_minutes integer,
  remind_at        timestamptz,
  reminder_sent    boolean not null default false,
  created_at       timestamptz not null default now()
);

-- Index used by the send-reminders cron query
create index if not exists tasks_remind_at_idx
  on public.tasks (remind_at)
  where reminder_sent = false and completed = false;

alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
drop policy if exists "tasks_insert_own" on public.tasks;
drop policy if exists "tasks_update_own" on public.tasks;
drop policy if exists "tasks_delete_own" on public.tasks;

create policy "tasks_select_own" on public.tasks
  for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = user_id);

-- ─── push_subscriptions ─────────────────────────────────────────────────────
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth_key   text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_select_own" on public.push_subscriptions;
drop policy if exists "push_insert_own" on public.push_subscriptions;
drop policy if exists "push_update_own" on public.push_subscriptions;
drop policy if exists "push_delete_own" on public.push_subscriptions;

create policy "push_select_own" on public.push_subscriptions
  for select using (auth.uid() = user_id);
create policy "push_insert_own" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);
create policy "push_update_own" on public.push_subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "push_delete_own" on public.push_subscriptions
  for delete using (auth.uid() = user_id);
