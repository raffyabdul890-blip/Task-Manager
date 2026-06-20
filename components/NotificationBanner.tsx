'use client';

interface NotificationBannerProps {
  onEnable: () => void;
  onDismiss: () => void;
}

export default function NotificationBanner({ onEnable, onDismiss }: NotificationBannerProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 animate-slide-up">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
        <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">
          Enable reminders
        </p>
        <p className="text-xs text-violet-700 dark:text-violet-300 mt-0.5 leading-relaxed">
          You have tasks with reminders set. Enable push notifications to get alerted
          even when the app is closed.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onDismiss}
          className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
        >
          Later
        </button>
        <button
          onClick={onEnable}
          className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors"
        >
          Enable
        </button>
      </div>
    </div>
  );
}
