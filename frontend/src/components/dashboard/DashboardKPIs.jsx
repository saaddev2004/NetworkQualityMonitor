import React from 'react';
import { Radio, PowerOff } from 'lucide-react';
import KpiCard from '../common/KpiCard';

/**
 * DashboardKPIs component
 * Renders the 6 core infrastructure health metric cards
 */
export default function DashboardKPIs({ summary = null, isLoading = false }) {
  // Use real backend summary metrics exclusively. Show placeholder on loading or absence.
  const displayVal = (val) => {
    if (isLoading && !summary) return '...';
    if (!summary || val === undefined || val === null) return '—';
    return val;
  };

  const total = summary?.totalTargets;
  const online = summary?.onlineTargets;
  const offline = summary?.offlineTargets;
  const warning = summary?.warningTargets;
  const critical = summary?.criticalTargets;
  const disabled = summary?.disabledTargets;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Total Targets */}
      <KpiCard
        title="Total Targets"
        value={displayVal(total)}
        subtext="Configured endpoints"
        icon={Radio}
      />

      {/* 2. Online */}
      <KpiCard
        title="Online"
        value={displayVal(online)}
        subtext="Passing SLA probes"
        accentColor="var(--status-online)"
        statusDotColor="var(--status-online)"
        valueColor="var(--status-online)"
      />

      {/* 3. Offline */}
      <KpiCard
        title="Offline"
        value={displayVal(offline)}
        subtext="Unreachable / timeout"
        accentColor="var(--status-offline)"
        statusDotColor="var(--status-offline)"
        valueColor="var(--status-offline)"
      />

      {/* 4. Warning */}
      <KpiCard
        title="Warning"
        value={displayVal(warning)}
        subtext="Latency SLA elevated"
        accentColor="var(--status-warning)"
        statusDotColor="var(--status-warning)"
        valueColor="var(--status-warning)"
      />

      {/* 5. Critical */}
      <KpiCard
        title="Critical"
        value={displayVal(critical)}
        subtext="Threshold breached"
        accentColor="var(--status-critical)"
        statusDotColor="var(--status-critical)"
        valueColor="var(--status-critical)"
      />

      {/* 6. Disabled */}
      <KpiCard
        title="Disabled"
        value={displayVal(disabled)}
        subtext="Monitoring paused"
        accentColor="var(--status-disabled)"
        valueColor="var(--status-disabled)"
        icon={PowerOff}
      />
    </div>
  );
}
