'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { PRIORITY_CONFIG, isOverdue, isDueToday, formatDate } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const [pendingDelete, setPendingDelete] = useState(false);

  const pc = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.dueDate, task.completed);
  const dueToday = isDueToday(task.dueDate, task.completed);

  const handleDeleteClick = () => {
    if (pendingDelete) {
      onDelete(task.id);
    } else {
      setPendingDelete(true);
    }
  };

  return (
    <div
      className={`group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-l-4 ${pc.borderClass} shadow-sm hover:shadow-md transition-all duration-200 animate-slide-up ${
        task.completed ? 'opacity-60' : ''
      }`}
      onMouseLeave={() => setPendingDelete(false)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">

          {/* Completion toggle */}
          <button
            onClick={() => onToggle(task.id)}
            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all duration-150 ${
              task.completed
                ? 'bg-violet-500 border-violet-500 scale-110'
                : 'border-slate-300 dark:border-slate-600 hover:border-violet-400 hover:scale-110'
            }`}
            aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.completed && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* Body */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">

              {/* Title */}
              <h3
                className={`text-sm font-semibold leading-snug transition-colors ${
                  task.completed
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {task.title}
              </h3>

              {/* Action buttons — visible on hover */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
                <button
                  onClick={() => onEdit(task)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
                  aria-label="Edit task"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                <button
                  onClick={handleDeleteClick}
                  title={pendingDelete ? 'Click again to confirm' : 'Delete task'}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    pendingDelete
                      ? 'text-white bg-rose-500 hover:bg-rose-600'
                      : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30'
                  }`}
                  aria-label={pendingDelete ? 'Confirm delete' : 'Delete task'}
                >
                  {pendingDelete ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p
                className={`text-xs mt-1 leading-relaxed line-clamp-2 ${
                  task.completed
                    ? 'text-slate-400 dark:text-slate-600'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Badge row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">

              {/* Priority */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${pc.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pc.dotClass}`} />
                {pc.label}
              </span>

              {/* Category */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {task.category}
              </span>

              {/* Due date */}
              {task.dueDate && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    overdue
                      ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:ring-rose-800'
                      : dueToday
                      ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {overdue && 'Overdue · '}
                  {dueToday && 'Today · '}
                  {formatDate(task.dueDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
