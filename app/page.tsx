'use client';

import { useState, useCallback, useEffect } from 'react';
import { Task } from '@/lib/types';
import { loadTheme, saveTheme } from '@/lib/storage';
import { useTasks } from '@/hooks/useTasks';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';

/**
 * modalState:
 *   undefined → modal closed
 *   null      → add mode
 *   Task      → edit mode
 */
type ModalState = Task | null | undefined;

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [modal, setModal] = useState<ModalState>(undefined);

  const {
    tasks,
    filteredTasks,
    filters,
    setFilters,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    stats,
    usedCategories,
    hasActiveFilters,
    clearFilters,
  } = useTasks();

  // Sync dark mode state with what the inline script already applied
  useEffect(() => {
    const saved = loadTheme();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(saved === 'dark' || (!saved && prefersDark));
  }, []);

  const toggleDark = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      saveTheme(next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  }, []);

  const handleSave = useCallback(
    (data: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
      if (modal) {
        // modal is a Task in edit mode
        updateTask((modal as Task).id, data);
      } else {
        addTask(data);
      }
    },
    [modal, addTask, updateTask]
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header
        stats={stats}
        darkMode={darkMode}
        onToggleDark={toggleDark}
        onAddTask={() => setModal(null)}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Only show filter bar when there are tasks */}
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

      {/* Floating add button on mobile */}
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
        />
      )}
    </div>
  );
}
