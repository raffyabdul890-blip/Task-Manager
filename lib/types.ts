export type Priority = 'low' | 'medium' | 'high';
export type FilterStatus = 'all' | 'active' | 'completed';
export type SortBy = 'created' | 'due' | 'priority';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  /** YYYY-MM-DD display date */
  dueDate: string | null;
  /** HH:MM display time (local) */
  dueTime: string | null;
  category: string;
  completed: boolean;
  /** Minutes before due time to fire the reminder */
  reminderMinutes: number | null;
  /** Pre-computed UTC ISO string when the push notification should fire */
  remindAt: string | null;
  reminderSent: boolean;
  createdAt: string;
}

export interface TaskFilters {
  search: string;
  status: FilterStatus;
  priority: Priority | 'all';
  category: string;
  sortBy: SortBy;
}
