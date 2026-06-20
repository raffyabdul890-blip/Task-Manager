export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** True when the due datetime has passed and the task is not yet complete. */
export function isOverdue(
  dueDate: string | null,
  dueTime: string | null,
  completed: boolean
): boolean {
  if (!dueDate || completed) return false;
  const dt = dueTime
    ? new Date(`${dueDate}T${dueTime}`)
    : new Date(`${dueDate}T23:59:59`);
  return dt < new Date();
}

/** True when due today (not overdue) and task is not complete. */
export function isDueToday(
  dueDate: string | null,
  dueTime: string | null,
  completed: boolean
): boolean {
  if (!dueDate || completed) return false;
  const dt = dueTime
    ? new Date(`${dueDate}T${dueTime}`)
    : new Date(`${dueDate}T23:59:59`);
  const today = new Date();
  return (
    dt >= today &&
    dt.getFullYear() === today.getFullYear() &&
    dt.getMonth() === today.getMonth() &&
    dt.getDate() === today.getDate()
  );
}

/** Human-readable due time — e.g. "Due in 2h 30m" or "Overdue 45m". */
export function getDueInText(
  dueDate: string,
  dueTime: string | null,
  completed: boolean
): string {
  if (completed) return '';
  const dt = dueTime
    ? new Date(`${dueDate}T${dueTime}`)
    : new Date(`${dueDate}T23:59:59`);

  const diffMs = dt.getTime() - Date.now();
  const isPast = diffMs < 0;
  const abs = Math.abs(diffMs);

  const mins = Math.floor(abs / 60_000);
  const hours = Math.floor(abs / 3_600_000);
  const days = Math.floor(abs / 86_400_000);

  let text: string;
  if (mins < 1) text = 'now';
  else if (mins < 60) text = `${mins}m`;
  else if (hours < 24) {
    const rem = mins % 60;
    text = rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
  } else text = `${days}d`;

  return isPast ? `Overdue ${text}` : `Due in ${text}`;
}

/** Format YYYY-MM-DD → "Jan 15, 2025". */
export function formatDate(dateString: string): string {
  const d = new Date(dateString + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format HH:MM → "2:30 PM". */
export function formatTime(timeString: string): string {
  const [h, m] = timeString.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/**
 * Compute the UTC ISO timestamp when the push notification should fire.
 * dueTime defaults to 23:59 when not provided.
 */
export function computeRemindAt(
  dueDate: string,
  dueTime: string | null,
  reminderMinutes: number
): string {
  const base = dueTime
    ? new Date(`${dueDate}T${dueTime}:00`)
    : new Date(`${dueDate}T23:59:00`);
  return new Date(base.getTime() - reminderMinutes * 60_000).toISOString();
}

export const CATEGORIES = [
  'Work',
  'Personal',
  'Health',
  'Finance',
  'Learning',
  'Home',
  'Other',
] as const;

export const REMINDER_OPTIONS = [
  { label: 'No reminder', value: null },
  { label: 'At due time', value: 0 },
  { label: '5 minutes before', value: 5 },
  { label: '10 minutes before', value: 10 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '2 hours before', value: 120 },
  { label: '1 day before', value: 1440 },
] as const;

/** Visual config per priority — full class strings so Tailwind includes them. */
export const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    borderClass: 'border-l-emerald-400',
    badgeClass:
      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-800',
    dotClass: 'bg-emerald-400',
  },
  medium: {
    label: 'Medium',
    borderClass: 'border-l-amber-400',
    badgeClass:
      'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800',
    dotClass: 'bg-amber-400',
  },
  high: {
    label: 'High',
    borderClass: 'border-l-rose-400',
    badgeClass:
      'bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:ring-rose-800',
    dotClass: 'bg-rose-400',
  },
} as const;
