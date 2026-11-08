import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Reusable floating toast notification
 */
export default function ToastNotification({ message, type = 'success' }) {
  if (!message) return null;

  return (
    <div className="toast-notification fixed bottom-6 right-6 z-50 p-3 px-4 rounded-md bg-[var(--bg-card)] border border-[var(--border-card-hover)] shadow-md flex items-center gap-2 text-xs font-medium text-[var(--text-primary)]">
      {type === 'error' ? (
        <AlertCircle className="w-4 h-4 text-[var(--status-critical)]" />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-[var(--status-online)]" />
      )}
      <span>{message}</span>
    </div>
  );
}
