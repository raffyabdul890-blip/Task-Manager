export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** True when the due date has passed and the task is not yet done */
export function isOverdue(dueDate: string | null, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate + 'T00:00:00') < today;
}

/** True when the due date is today and the task is not yet done */
export function isDueToday(dueDate: string | null, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  const today = new Date();
  const due = new Date(dueDate + 'T00:00:00');
  return (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth() &&
    due.getDate() === today.getDate()
  );
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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

/** Visual config per priority — full class strings so Tailwind can tree-shake correctly */
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
