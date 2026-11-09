import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Menu, Settings } from 'lucide-react';

/**
 * TopTelemetryBar component
 * Global navigation top bar providing mobile drawer toggle, observability title,
 * genuine engine status, active probe counts, quick settings access, and theme switch.
 */
export default function TopTelemetryBar({
  engineStatus = 'running', // 'running' | 'initializing' | 'stopped' | 'error' | 'offline' | 'loading'
  activeProbesCount = null,
  configuredTargetsCount = 0,
  theme = 'dark',
  onToggleTheme,
  onOpenMobileSidebar
}) {
  // Determine dot color & label based on genuine backend engine status
  let statusColor = 'var(--status-online)';
  let statusLabel = 'ONLINE';

  if (engineStatus === 'loading') {
    statusColor = 'var(--text-muted)';
    statusLabel = 'CHECKING...';
  } else if (engineStatus === 'initializing') {
    statusColor = 'var(--status-warning)';
    statusLabel = 'STARTING';
  } else if (engineStatus === 'stopped') {
    statusColor = 'var(--status-disabled)';
    statusLabel = 'STOPPED';
  } else if (engineStatus === 'error') {
    statusColor = 'var(--status-critical)';
    statusLabel = 'ERROR';
  } else if (engineStatus === 'offline') {
    statusColor = 'var(--status-critical)';
    statusLabel = 'OFFLINE';
  }

  const probesDisplay = activeProbesCount !== null && activeProbesCount !== undefined
    ? activeProbesCount
    : configuredTargetsCount;

  return (
    <header className="top-telemetry-bar">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="btn-telemetry btn-icon btn-secondary lg:hidden -ml-1 mr-1"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
          <span className="text-[var(--text-secondary)] font-medium text-[11px] uppercase tracking-wider">
            Telemetry Observability
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Clickable Engine Status Pill linking to /settings */}
        <Link
          to="/settings"
          className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition p-1 -m-1 rounded"
          title={`Engine: ${statusLabel} (${probesDisplay} active scheduler timers) — Click to inspect telemetry settings`}
        >
          <span 
            className="status-dot" 
            style={{ background: statusColor }} 
          />
          <span className="hidden sm:inline">
            ENGINE: {statusLabel}
          </span>
        </Link>

        <div className="h-4 w-px bg-[var(--border-subtle)] hidden sm:block" />

        {/* Probes Count */}
        <div 
          className="text-xs font-mono text-[var(--text-muted)]"
          title={`${probesDisplay} active scheduler timers running`}
        >
          <span className="hidden sm:inline">PROBES: </span>
          <span className="text-[var(--text-primary)] font-semibold">{probesDisplay}</span>
        </div>

        <div className="h-4 w-px bg-[var(--border-subtle)]" />

        {/* Settings Quick Link */}
        <Link
          to="/settings"
          className="btn-telemetry btn-icon btn-secondary text-xs"
          title="Telemetry Settings"
          aria-label="Settings"
        >
          <Settings className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="btn-telemetry btn-icon btn-secondary text-xs"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          )}
        </button>
      </div>
    </header>
  );
}
