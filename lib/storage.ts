import { Task } from './types';

const TASKS_KEY = 'taskflow-tasks';
const THEME_KEY = 'taskflow-theme';

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // Quota exceeded — silently fail
  }
}

export function loadTheme(): 'dark' | 'light' | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null;
}

export function saveTheme(theme: 'dark' | 'light'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_KEY, theme);
}
