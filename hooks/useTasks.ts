'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskFilters, Priority } from '@/lib/types';
import { loadTasks, saveTasks } from '@/lib/storage';
import { generateId } from '@/lib/utils';

type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'completed'>;

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
  });

  // Hydrate from localStorage after first render
  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  const persist = useCallback((updated: Task[]) => {
    setTasks(updated);
    saveTasks(updated);
  }, []);

  const addTask = useCallback(
    (data: TaskFormData) => {
      const task: Task = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
        completed: false,
      };
      persist([task, ...tasks]);
    },
    [tasks, persist]
  );

  const updateTask = useCallback(
    (id: string, data: Partial<TaskFormData>) => {
      persist(tasks.map((t) => (t.id === id ? { ...t, ...data } : t)));
    },
    [tasks, persist]
  );

  const deleteTask = useCallback(
    (id: string) => {
      persist(tasks.filter((t) => t.id !== id));
    },
    [tasks, persist]
  );

  const toggleComplete = useCallback(
    (id: string) => {
      persist(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    },
    [tasks, persist]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const q = filters.search.toLowerCase();
      if (
        q &&
        !task.title.toLowerCase().includes(q) &&
        !task.description.toLowerCase().includes(q) &&
        !task.category.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (filters.status === 'active' && task.completed) return false;
      if (filters.status === 'completed' && !task.completed) return false;
      if (filters.priority !== 'all' && task.priority !== (filters.priority as Priority))
        return false;
      if (filters.category !== 'all' && task.category !== filters.category) return false;
      return true;
    });
  }, [tasks, filters]);

  // Unique categories that actually appear in the task list
  const usedCategories = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.category))).sort(),
    [tasks]
  );

  const stats = useMemo(
    () => ({
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      active: tasks.filter((t) => !t.completed).length,
    }),
    [tasks]
  );

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category !== 'all';

  const clearFilters = useCallback(() => {
    setFilters({ search: '', status: 'all', priority: 'all', category: 'all' });
  }, []);

  return {
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
  };
}
