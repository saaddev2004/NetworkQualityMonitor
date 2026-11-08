import React from 'react';

/**
 * TargetAvailabilityBar component
 * 30-day chronological SLA availability history with daily compliance blocks
 */
export default function TargetAvailabilityBar({
  uptimePercentage = '100.00%',
  availabilityDays = []
}) {
  return (
    <div className="telemetry-card p-4">
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            30-Day Availability History
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Daily SLA compliance blocks
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-[var(--status-online)]">
          {uptimePercentage}
        </span>
      </div>

      <div className="flex items-stretch gap-0.5 sm:gap-1 pt-1 overflow-x-auto pb-1">
        {availabilityDays.map((day, idx) => (
          <div
            key={idx}
            title={`${day.date}: ${day.uptime}% uptime`}
            className="h-6 flex-1 min-w-[6px] sm:min-w-[8px] rounded-sm cursor-pointer transition hover:opacity-80"
            style={{
              backgroundColor: day.uptime >= 99 ? 'var(--status-online)' :
                               day.uptime >= 95 ? 'var(--status-warning)' : 'var(--status-critical)'
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mt-2 text-[10px] text-[var(--text-muted)] font-mono">
        <span>30 days ago</span>
        <span>Today (99.42%)</span>
      </div>
    </div>
  );
}
