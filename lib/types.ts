export type Priority = 'low' | 'medium' | 'high';
export type FilterStatus = 'all' | 'active' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  /** ISO date string YYYY-MM-DD, or null if no due date */
  dueDate: string | null;
  category: string;
  completed: boolean;
  createdAt: string;
}

export interface TaskFilters {
  search: string;
  status: FilterStatus;
  priority: Priority | 'all';
  category: string;
}
