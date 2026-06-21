'use client';

import { useState, useEffect } from 'react';
import { Task, Priority } from '@/lib/types';
import { CATEGORIES, REMINDER_OPTIONS, PRIORITY_CONFIG, computeRemindAt, formatDate, formatTime } from '@/lib/utils';
import { TaskFormData } from '@/hooks/useTasks';

interface TaskFormProps {
  /** null → add mode, Task → edit mode */
  task: Task | null;
  onSave: (data: TaskFormData) => Promise<void> | void;
  onClose: () => void;
  /** Called after save when the task has a reminder and push isn't set up yet */
  onNeedsNotification?: () => void;
}

type FormState = {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  dueTime: string;
  category: string;
  reminderMinutes: number | null;
};

const DEFAULT: FormState = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  dueTime: '',
  category: 'Personal',
  reminderMinutes: null,
};

const today = new Date().toISOString().split('T')[0];

export default function TaskForm({ task, onSave, onClose, onNeedsNotification }: TaskFormProps) {
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [titleError, setTitleError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate ?? '',
        dueTime: task.dueTime ?? '',
        category: task.category,
        reminderMinutes: task.reminderMinutes,
      });
    } else {
      setForm(DEFAULT);
    }
  }, [task]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!form.title.trim()) { setTitleError('Title is required.'); return; }

    // Compute remindAt only when we have a due date + a reminder setting
    let remindAt: string | null = null;
    if (form.dueDate && form.reminderMinutes !== null) {
      remindAt = computeRemindAt(form.dueDate, form.dueTime || null, form.reminderMinutes);
    }

    setSaving(true);
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueDate: form.dueDate || null,
        dueTime: form.dueTime || null,
        category: form.category,
        reminderMinutes: form.dueDate ? form.reminderMinutes : null,
        remindAt,
      });
    } catch (err) {
      setSaving(false);
      setSubmitError(
        err instanceof Error ? err.message : 'Could not save the task. Please try again.'
      );
      return; // keep the modal open so the user doesn't lose their input
    }
    setSaving(false);

    // Prompt for push permission if a reminder was set
    if (remindAt && onNeedsNotification) {
      if (typeof window !== 'undefined' && Notification.permission === 'default') {
        onNeedsNotification();
      }
    }

    onClose();
  };

  const f =
    'w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-colors';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Title <span className="text-rose-500 normal-case tracking-normal font-normal">*</span>
            </label>
            <input type="text" placeholder="What needs to be done?" autoFocus
              value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setTitleError(''); }}
              className={f + (titleError ? ' border-rose-400 focus:ring-rose-500/40' : '')}
            />
            {titleError && <p className="text-xs text-rose-500 mt-1">{titleError}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Description <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea placeholder="Add details or notes…" rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={f + ' resize-none'}
            />
          </div>

          {/* Priority + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className={f}>
                {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                  <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={f}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date + time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Due Date <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <input type="date" min={today}
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value, reminderMinutes: null })}
                className={f}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Due Time <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <input type="time"
                value={form.dueTime}
                disabled={!form.dueDate}
                onChange={(e) => setForm({ ...form, dueTime: e.target.value })}
                className={f + (!form.dueDate ? ' opacity-40 cursor-not-allowed' : '')}
              />
            </div>
          </div>

          {/* Reminder — only shown when a due date is set */}
          {form.dueDate && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Reminder
              </label>
              <select
                value={form.reminderMinutes ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    reminderMinutes: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                className={f}
              >
                {REMINDER_OPTIONS.map((o) => (
                  <option key={String(o.value)} value={o.value ?? ''}>
                    {o.label}
                  </option>
                ))}
              </select>
              {form.reminderMinutes !== null && (() => {
                const fireAt = computeRemindAt(form.dueDate, form.dueTime || null, form.reminderMinutes!);
                const fireDate = new Date(fireAt);
                return (
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Notification fires: {formatDate(fireDate.toISOString().split('T')[0])} at {formatTime(
                      `${String(fireDate.getHours()).padStart(2,'0')}:${String(fireDate.getMinutes()).padStart(2,'0')}`
                    )}
                  </p>
                );
              })()}
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800">
              <svg className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs text-rose-700 dark:text-rose-400">{submitError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={saving}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 text-white text-sm font-semibold shadow-sm transition-all active:scale-95"
            >
              {saving ? 'Saving…' : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
