'use client';

import { TaskFilters, Priority, FilterStatus } from '@/lib/types';

interface FilterBarProps {
  filters: TaskFilters;
  setFilters: (f: TaskFilters) => void;
  usedCategories: string[];
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const STATUS_TABS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Done', value: 'completed' },
];

export default function FilterBar({
  filters,
  setFilters,
  usedCategories,
  filteredCount,
  totalCount,
  hasActiveFilters,
  onClearFilters,
}: FilterBarProps) {
  const patch = (update: Partial<TaskFilters>) => setFilters({ ...filters, ...update });

  const selectClass =
    'px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-colors cursor-pointer';

  return (
    <div className="space-y-3">

      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search tasks…"
          value={filters.search}
          onChange={(e) => patch({ search: e.target.value })}
          className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-colors"
        />
        {filters.search && (
          <button
            onClick={() => patch({ search: '' })}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter controls row */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Status tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => patch({ status: tab.value })}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filters.status === tab.value
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority filter */}
        <select
          value={filters.priority}
          onChange={(e) => patch({ priority: e.target.value as Priority | 'all' })}
          className={selectClass}
        >
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Category filter */}
        {usedCategories.length > 0 && (
          <select
            value={filters.category}
            onChange={(e) => patch({ category: e.target.value })}
            className={selectClass}
          >
            <option value="all">All categories</option>
            {usedCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
          >
            Clear all
          </button>
        )}

        {/* Result count */}
        <span className="ml-auto text-sm text-slate-500 dark:text-slate-400 tabular-nums">
          {hasActiveFilters
            ? `${filteredCount} of ${totalCount}`
            : `${totalCount}`}{' '}
          task{totalCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
