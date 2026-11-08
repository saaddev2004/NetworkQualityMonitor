import React from 'react';
import { RotateCw, Plus } from 'lucide-react';
import PageHeader from '../common/PageHeader';

/**
 * DashboardHeader component
 * Displays Network Overview title, live Engine Online status badge, immediate probe refresh, and provisioning action button
 */
export default function DashboardHeader({ isRefreshing, onRefresh, onAddTarget }) {
  const engineBadge = (
    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--status-online-bg)] text-[var(--status-online)] border border-[var(--status-online-border)]">
      <span className="status-dot" style={{ background: 'var(--status-online)' }} />
      Engine Online
    </span>
  );

  const actions = (
    <>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="btn-telemetry btn-secondary"
        title="Poll target statuses immediately"
      >
        <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[var(--brand-primary)]' : ''}`} />
        <span>{isRefreshing ? 'Auditing...' : 'Refresh'}</span>
      </button>

      <button
        onClick={onAddTarget}
        className="btn-telemetry btn-primary"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Target</span>
      </button>
    </>
  );

  return (
    <PageHeader
      title="Network Overview"
      subtitle="Real-time visibility into your infrastructure health and network performance."
      badge={engineBadge}
      actions={actions}
    />
  );
}
