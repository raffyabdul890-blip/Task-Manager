'use client';

import { Task } from '@/lib/types';
import TaskCard from './TaskCard';
import EmptyState from './EmptyState';

interface TaskListProps {
  tasks: Task[];
  allTasksEmpty: boolean;
  hasFilters: boolean;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onClearFilters: () => void;
  onAddTask: () => void;
}

export default function TaskList({
  tasks,
  allTasksEmpty,
  hasFilters,
  onToggle,
  onEdit,
  onDelete,
  onClearFilters,
  onAddTask,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        hasFilters={hasFilters && !allTasksEmpty}
        onClearFilters={onClearFilters}
        onAddTask={onAddTask}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
