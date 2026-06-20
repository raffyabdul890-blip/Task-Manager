// Theme preference is the only thing we still keep in localStorage.
// All task data now lives in Supabase.

const THEME_KEY = 'flowtask-theme';

export function loadTheme(): 'dark' | 'light' | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null;
}

export function saveTheme(theme: 'dark' | 'light'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_KEY, theme);
}
