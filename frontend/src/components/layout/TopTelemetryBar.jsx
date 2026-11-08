import React from 'react';
import { Sun, Moon, Menu } from 'lucide-react';

/**
 * TopTelemetryBar component
 * Global navigation top bar providing mobile drawer toggle, observability title, engine status, probe counts, and theme switch
 */
export default function TopTelemetryBar({
  probesCount = 0,
  isEngineOnline = true,
  theme = 'dark',
  onToggleTheme,
  onOpenMobileSidebar
}) {
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
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono text-[var(--text-muted)]">
          <span 
            className="status-dot" 
            style={{ background: isEngineOnline ? 'var(--status-online)' : 'var(--status-critical)' }} 
          />
          <span className="hidden sm:inline">
            ENGINE: {isEngineOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
        <div className="h-4 w-px bg-[var(--border-subtle)] hidden sm:block" />
        <div className="text-xs font-mono text-[var(--text-muted)]">
          <span className="hidden sm:inline">PROBES: </span>
          <span className="text-[var(--text-primary)] font-semibold">{probesCount}</span>
        </div>
        <div className="h-4 w-px bg-[var(--border-subtle)]" />
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
