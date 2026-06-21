'use client';

import Image from 'next/image';

interface Stats {
  total: number;
  completed: number;
  active: number;
}

interface HeaderProps {
  stats: Stats;
  darkMode: boolean;
  userEmail: string | undefined;
  onToggleDark: () => void;
  onAddTask: () => void;
  onSignOut: () => void;
}

export default function Header({
  stats,
  darkMode,
  userEmail,
  onToggleDark,
  onAddTask,
  onSignOut,
}: HeaderProps) {
  const progress =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-700/70">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">

          {/* Logo + title */}
          <div className="flex items-center gap-3 min-w-0">
            <Image
              src="/flowtask-mark.png"
              alt="FlowTask"
              width={36}
              height={36}
              className="rounded-xl shadow-md flex-shrink-0"
              priority
            />
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">
                FlowTask
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[160px]">
                {stats.total === 0
                  ? 'No tasks yet'
                  : `${stats.completed} of ${stats.total} completed`}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {stats.total > 0 && (
            <div className="hidden sm:flex items-center gap-3 flex-1 max-w-xs">
              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums w-8 text-right">
                {progress}%
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Dark mode */}
            <button
              onClick={onToggleDark}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* User menu */}
            {userEmail && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg">
                <span className="text-xs text-slate-500 dark:text-slate-400 max-w-[120px] truncate">
                  {userEmail}
                </span>
                <button
                  onClick={onSignOut}
                  className="text-xs text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
                  title="Sign out"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}

            {/* Add task */}
            <button
              onClick={onAddTask}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-sm transition-all active:scale-95"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
