'use client';

// This page requires auth state — skip static prerendering
export const dynamic = 'force-dynamic';

import { useState, useCallback, useEffect } from 'react';
import { Task } from '@/lib/types';
import { loadTheme, saveTheme } from '@/lib/storage';
import { isPushSupported, getPermission, setupPush } from '@/lib/push';
import { useTasks, TaskFormData } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import NotificationBanner from '@/components/NotificationBanner';

type ModalState = Task | null | undefined; // undefined=closed, null=add, Task=edit

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [modal, setModal] = useState<ModalState>(undefined);
  const [showNotifBanner, setShowNotifBanner] = useState(false);
  const [pushStatus, setPushStatus] = useState<NotificationPermission>('default');

  const { user, signOut } = useAuth();
  const {
    tasks,
    filteredTasks,
    filters,
    setFilters,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    stats,
    usedCategories,
    hasActiveFilters,
    clearFilters,
  } = useTasks();

  // Dark mode init
  useEffect(() => {
    const saved = loadTheme();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(saved === 'dark' || (!saved && prefersDark));
  }, []);

  // Track push permission state
  useEffect(() => {
    if (isPushSupported()) setPushStatus(getPermission());
  }, []);

  // Show the notification banner when there are reminders pending and we haven't asked
  useEffect(() => {
    if (!isPushSupported()) return;
    if (pushStatus !== 'default') return;
    const hasPendingReminders = tasks.some(
      (t) => t.remindAt && !t.reminderSent && !t.completed
    );
    setShowNotifBanner(hasPendingReminders);
  }, [tasks, pushStatus]);

  const toggleDark = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      saveTheme(next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  }, []);

  const handleSave = useCallback(
    async (data: TaskFormData) => {
      if (modal && typeof modal === 'object' && 'id' in modal) {
        await updateTask(modal.id, data);
      } else {
        await addTask(data);
      }
    },
    [modal, addTask, updateTask]
  );

  const handleEnableNotifications = useCallback(async () => {
    setShowNotifBanner(false);
    const ok = await setupPush();
    setPushStatus(ok ? 'granted' : getPermission());
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading tasks…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header
        stats={stats}
        darkMode={darkMode}
        userEmail={user?.email}
        onToggleDark={toggleDark}
        onAddTask={() => setModal(null)}
        onSignOut={signOut}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Push notification banner */}
        {showNotifBanner && (
          <NotificationBanner
            onEnable={handleEnableNotifications}
            onDismiss={() => setShowNotifBanner(false)}
          />
        )}

        {/* Push denied — show in-app reminder note */}
        {pushStatus === 'denied' && tasks.some(t => t.remindAt && !t.completed) && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              Push notifications are blocked. Enable them in your browser settings to receive reminders when the app is closed.
            </span>
          </div>
        )}

        {/* Filters */}
        {tasks.length > 0 && (
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            usedCategories={usedCategories}
            filteredCount={filteredTasks.length}
            totalCount={tasks.length}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        )}

        <TaskList
          tasks={filteredTasks}
          allTasksEmpty={tasks.length === 0}
          hasFilters={hasActiveFilters}
          onToggle={toggleComplete}
          onEdit={(task) => setModal(task)}
          onDelete={deleteTask}
          onClearFilters={clearFilters}
          onAddTask={() => setModal(null)}
        />
      </main>

      {/* Mobile FAB */}
      <button
        onClick={() => setModal(null)}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all active:scale-95 z-30"
        aria-label="Add task"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Task form modal */}
      {modal !== undefined && (
        <TaskForm
          task={modal}
          onSave={handleSave}
          onClose={() => setModal(undefined)}
          onNeedsNotification={() => setShowNotifBanner(true)}
        />
      )}
    </div>
  );
}
