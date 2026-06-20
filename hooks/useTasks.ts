'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { Task, TaskFilters, Priority } from '@/lib/types';

// ─── DB row shape (snake_case) ────────────────────────────────────────────────
interface DbTask {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: string;
  due_date: string | null;
  due_time: string | null;
  category: string;
  completed: boolean;
  reminder_minutes: number | null;
  remind_at: string | null;
  reminder_sent: boolean;
  created_at: string;
}

function fromDb(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority as Priority,
    dueDate: row.due_date,
    dueTime: row.due_time,
    category: row.category,
    completed: row.completed,
    reminderMinutes: row.reminder_minutes,
    remindAt: row.remind_at,
    reminderSent: row.reminder_sent,
    createdAt: row.created_at,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'completed' | 'reminderSent'>;

const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  category: 'all',
  sortBy: 'created',
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);

  const supabase = createClient();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('[fetchTasks] error:', error);
    if (!error && data) setTasks((data as DbTask[]).map(fromDb));
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Re-fetch whenever auth state changes (e.g. session resolves after mount)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchTasks();
      } else {
        setTasks([]);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchTasks]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const addTask = useCallback(
    async (data: TaskFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[addTask] not authenticated — task not saved');
        return;
      }

      const { data: row, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          priority: data.priority,
          due_date: data.dueDate,
          due_time: data.dueTime,
          category: data.category,
          reminder_minutes: data.reminderMinutes,
          remind_at: data.remindAt,
          reminder_sent: false,
          completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error('[addTask] insert error:', error);
        return;
      }
      if (row) setTasks((prev) => [fromDb(row as DbTask), ...prev]);
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updateTask = useCallback(
    async (id: string, data: Partial<TaskFormData>) => {
      const patch: Record<string, unknown> = {};
      if (data.title !== undefined) patch.title = data.title;
      if (data.description !== undefined) patch.description = data.description;
      if (data.priority !== undefined) patch.priority = data.priority;
      if (data.dueDate !== undefined) patch.due_date = data.dueDate;
      if (data.dueTime !== undefined) patch.due_time = data.dueTime;
      if (data.category !== undefined) patch.category = data.category;
      if (data.reminderMinutes !== undefined) patch.reminder_minutes = data.reminderMinutes;
      if (data.remindAt !== undefined) {
        patch.remind_at = data.remindAt;
        patch.reminder_sent = false; // reset so the new reminder fires
      }

      const { data: row, error } = await supabase
        .from('tasks')
        .update(patch)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[updateTask] error:', error);
        return;
      }
      if (row) setTasks((prev) => prev.map((t) => (t.id === id ? fromDb(row as DbTask) : t)));
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { console.error('[deleteTask] error:', error); return; }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleComplete = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const { data: row, error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[toggleComplete] error:', error);
        return;
      }
      if (row) setTasks((prev) => prev.map((t) => (t.id === id ? fromDb(row as DbTask) : t)));
    },
    [tasks] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      const q = filters.search.toLowerCase();
      if (
        q &&
        !task.title.toLowerCase().includes(q) &&
        !task.description.toLowerCase().includes(q) &&
        !task.category.toLowerCase().includes(q)
      )
        return false;
      if (filters.status === 'active' && task.completed) return false;
      if (filters.status === 'completed' && !task.completed) return false;
      if (filters.priority !== 'all' && task.priority !== (filters.priority as Priority))
        return false;
      if (filters.category !== 'all' && task.category !== filters.category) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (filters.sortBy) {
        case 'due': {
          const ts = (t: Task) =>
            t.dueDate
              ? new Date(
                  t.dueTime ? `${t.dueDate}T${t.dueTime}` : `${t.dueDate}T23:59:59`
                ).getTime()
              : Infinity;
          return ts(a) - ts(b);
        }
        case 'priority': {
          const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
          return order[a.priority] - order[b.priority];
        }
        default: // 'created'
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [tasks, filters]);

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

  const clearFilters = useCallback(
    () => setFilters({ ...DEFAULT_FILTERS, sortBy: filters.sortBy }),
    [filters.sortBy]
  );

  return {
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
  };
}
