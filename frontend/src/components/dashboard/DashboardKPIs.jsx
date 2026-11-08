import React from 'react';
import { Radio, PowerOff } from 'lucide-react';
import KpiCard from '../common/KpiCard';

/**
 * DashboardKPIs component
 * Renders the 6 core infrastructure health metric cards
 */
export default function DashboardKPIs({ targets = [] }) {
  const total = targets.length;
  const online = targets.filter(t => t.current_status === 'online').length;
  const offline = targets.filter(t => t.current_status === 'offline').length;
  const warning = targets.filter(t => t.current_status === 'warning').length;
  const critical = targets.filter(t => t.current_status === 'critical').length;
  const disabled = targets.filter(t => !t.is_enabled || t.current_status === 'disabled').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Total Targets */}
      <KpiCard
        title="Total Targets"
        value={total}
        subtext="Configured endpoints"
        icon={Radio}
      />

      {/* 2. Online */}
      <KpiCard
        title="Online"
        value={online}
        subtext="Passing SLA probes"
        accentColor="var(--status-online)"
        statusDotColor="var(--status-online)"
        valueColor="var(--status-online)"
      />

      {/* 3. Offline */}
      <KpiCard
        title="Offline"
        value={offline}
        subtext="Unreachable / timeout"
        accentColor="var(--status-offline)"
        statusDotColor="var(--status-offline)"
        valueColor="var(--status-offline)"
      />

      {/* 4. Warning */}
      <KpiCard
        title="Warning"
        value={warning}
        subtext="Latency SLA elevated"
        accentColor="var(--status-warning)"
        statusDotColor="var(--status-warning)"
        valueColor="var(--status-warning)"
      />

      {/* 5. Critical */}
      <KpiCard
        title="Critical"
        value={critical}
        subtext="Threshold breached"
        accentColor="var(--status-critical)"
        statusDotColor="var(--status-critical)"
        valueColor="var(--status-critical)"
      />

      {/* 6. Disabled */}
      <KpiCard
        title="Disabled"
        value={disabled}
        subtext="Monitoring paused"
        accentColor="var(--status-disabled)"
        valueColor="var(--status-disabled)"
        icon={PowerOff}
      />
    </div>
  );
}
