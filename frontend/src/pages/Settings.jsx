import React from 'react';
import { 
  Settings as SettingsIcon, 
  RotateCw, 
  Cpu, 
  Database, 
  Sliders, 
  Server, 
  ShieldCheck, 
  Calendar, 
  Sun, 
  Moon, 
  AlertCircle,
  Clock,
  Radio
} from 'lucide-react';

/**
 * Format uptime seconds into human-readable duration
 */
function formatUptime(seconds) {
  if (!seconds || isNaN(seconds)) return '0s';
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

/**
 * Settings Page
 * Platform observability, engine scheduler telemetry, default baseline parameters,
 * and user display preferences.
 */
export default function Settings({
  healthData = null,
  isLoadingHealth = false,
  healthError = null,
  onRefreshHealth,
  lastSynchronized = null,
  theme = 'dark',
  onToggleTheme
}) {
  const engine = healthData?.engine;
  const db = healthData?.database;
  const system = healthData?.system;

  // Derive engine status and badge color
  const engineStatus = healthError 
    ? 'offline' 
    : (engine?.status || (isLoadingHealth ? 'loading' : 'unknown'));

  const statusColorMap = {
    running: 'var(--status-online)',
    initializing: 'var(--status-warning)',
    stopped: 'var(--status-disabled)',
    error: 'var(--status-critical)',
    offline: 'var(--status-critical)',
    loading: 'var(--text-muted)',
    unknown: 'var(--text-muted)'
  };

  const statusLabelMap = {
    running: 'OPERATIONAL / RUNNING',
    initializing: 'INITIALIZING',
    stopped: 'ENGINE STOPPED',
    error: 'RUNTIME ERROR',
    offline: 'SERVER UNREACHABLE',
    loading: 'CHECKING STATUS...',
    unknown: 'UNKNOWN'
  };

  const statusColor = statusColorMap[engineStatus] || 'var(--text-muted)';
  const statusLabel = statusLabelMap[engineStatus] || 'UNKNOWN';

  return (
    <div className="content-body space-y-5">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[var(--brand-primary)]" />
            <h1 className="text-lg font-bold text-[var(--text-primary)]">
              System & Telemetry Settings
            </h1>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Platform observability, engine scheduler runtime telemetry, and baseline configuration
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastSynchronized && (
            <span className="text-[11px] font-mono text-[var(--text-muted)] hidden md:inline">
              Sync: {new Date(lastSynchronized).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={onRefreshHealth}
            disabled={isLoadingHealth}
            className="btn-telemetry btn-secondary text-xs inline-flex items-center gap-1.5"
            title="Refresh engine telemetry"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoadingHealth ? 'animate-spin' : ''}`} />
            <span>{isLoadingHealth ? 'Syncing...' : 'Refresh Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {healthError && (
        <div className="p-3.5 rounded-lg border border-[var(--status-critical-border)] bg-[var(--status-critical-bg)] text-[var(--status-critical)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span><strong>Backend Connection Error:</strong> {healthError}</span>
          </div>
          {onRefreshHealth && (
            <button
              onClick={onRefreshHealth}
              className="btn-telemetry btn-secondary text-xs self-start sm:self-auto flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* 2. Grid Layout for Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Section A: Monitoring Engine Runtime Status */}
        <div className="telemetry-card p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--brand-primary)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Monitoring Engine Telemetry
              </h2>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
              Runtime Telemetry
            </span>
          </div>

          <div className="space-y-3">
            {/* Operational State Pill */}
            <div className="p-3 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">
                  Engine Scheduler State
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="status-dot" style={{ background: statusColor }} />
                  <span className="text-xs font-mono font-bold" style={{ color: statusColor }}>
                    {statusLabel}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                Node.js Interval Engine
              </span>
            </div>

            {/* Metric Row 1: Active Probe Jobs & Uptime */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">
                  Active Probe Jobs
                </span>
                <span className="text-xl font-mono font-bold text-[var(--text-primary)] mt-1 block">
                  {engine?.activeJobsCount !== undefined ? engine.activeJobsCount : '—'}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  Scheduled target timers
                </span>
              </div>

              <div className="p-3 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">
                  Process Uptime
                </span>
                <span className="text-xl font-mono font-bold text-[var(--text-primary)] mt-1 block">
                  {engine?.uptimeSeconds !== undefined ? formatUptime(engine.uptimeSeconds) : '—'}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  Continuous uptime
                </span>
              </div>
            </div>

            {/* Metric Row 2: Database & Data Retention */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">
                  MySQL Connection
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="status-dot" style={{ background: db?.status === 'connected' ? 'var(--status-online)' : 'var(--status-critical)' }} />
                  <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                    {db?.status === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono block mt-0.5 truncate">
                  {db?.name || 'network_monitor_db'}
                </span>
              </div>

              <div className="p-3 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">
                  Retention Worker
                </span>
                <span className="text-xs font-mono font-bold text-[var(--text-primary)] mt-1 block">
                  {engine?.retentionJob === 'active' ? 'Active (03:00 UTC)' : 'Inactive'}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  Purges logs older than {engine?.retentionDays || 30}d
                </span>
              </div>
            </div>

            {/* Scheduled Targets Pill List */}
            {engine?.scheduledTargetIds && engine.scheduledTargetIds.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block mb-1.5">
                  Currently Scheduled Target IDs:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {engine.scheduledTargetIds.map(id => (
                    <span 
                      key={id}
                      className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                    >
                      Target #{id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section B: Default Monitoring Parameters (New Target Blueprint) */}
        <div className="telemetry-card p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--brand-primary)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Default Monitoring Baseline
              </h2>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
              Read-Only Presets
            </span>
          </div>

          <p className="text-[11px] text-[var(--text-muted)]">
            These parameters represent the baseline preset thresholds applied when creating new monitored targets in NetPulse. Existing endpoints retain their individually customized SLA thresholds.
          </p>

          <div className="space-y-2.5">
            <div className="p-2.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--text-primary)] block">
                  Default Polling Cadence
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  Probe interval for newly created targets
                </span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                60 seconds
              </span>
            </div>

            <div className="p-2.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--text-primary)] block">
                  Default Request Timeout
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  Maximum roundtrip deadline before aborting
                </span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                5 seconds
              </span>
            </div>

            <div className="p-2.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--text-primary)] block">
                  Default Warning Threshold
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  Latency SLA elevated condition trigger
                </span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--status-warning)]">
                500 ms
              </span>
            </div>

            <div className="p-2.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--text-primary)] block">
                  Default Critical Threshold
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  High-severity threshold breach condition trigger
                </span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--status-critical)]">
                1000 ms
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[11px] text-[var(--text-muted)] flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[var(--brand-primary)] flex-shrink-0" />
            <span>
              Target-specific thresholds can be customized at any time from <strong>Monitored Targets → Target Details → Configure</strong>.
            </span>
          </div>
        </div>

        {/* Section C: System Architecture & Runtime */}
        <div className="telemetry-card p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[var(--brand-primary)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                System Architecture
              </h2>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
              Environment
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">Platform Runtime</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">
                Node.js {system?.nodeVersion || 'v20+'} ({system?.platform || 'win32'})
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">REST API Base URL</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">
                http://localhost:5000/api/v1
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">Database Engine</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">
                MySQL 8.0 (mysql2 connection pool)
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">Supported Protocols</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">
                ICMP Ping, HTTP, HTTPS
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[var(--text-secondary)]">CSV Export Engine</span>
              <span className="font-mono font-semibold text-[var(--status-online)]">
                Active (Streaming CSV)
              </span>
            </div>
          </div>
        </div>

        {/* Section D: User Preferences (Editable & Persisted) */}
        <div className="telemetry-card p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Display & User Preferences
              </h2>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--status-online-bg)] text-[var(--status-online)] border-[var(--status-online-border)]">
              Persisted
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-[var(--text-primary)] block">
                Workspace Theme Mode
              </span>
              <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                Persisted in local browser storage across sessions
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'dark') onToggleTheme();
                }}
                className={`p-3 rounded border text-left flex flex-col justify-between transition ${
                  theme === 'dark'
                    ? 'border-[var(--brand-primary)] bg-[var(--bg-elevated)] ring-1 ring-[var(--brand-primary)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-hover)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Moon className="w-4 h-4 text-[var(--brand-primary)]" />
                  {theme === 'dark' && (
                    <span className="status-dot" style={{ background: 'var(--status-online)' }} />
                  )}
                </div>
                <span className="text-xs font-bold text-[var(--text-primary)]">Dark Theme</span>
                <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  High-contrast obsidian telemetry palette
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (theme !== 'light') onToggleTheme();
                }}
                className={`p-3 rounded border text-left flex flex-col justify-between transition ${
                  theme === 'light'
                    ? 'border-[var(--brand-primary)] bg-[var(--bg-elevated)] ring-1 ring-[var(--brand-primary)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-hover)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Sun className="w-4 h-4 text-[var(--status-warning)]" />
                  {theme === 'light' && (
                    <span className="status-dot" style={{ background: 'var(--status-online)' }} />
                  )}
                </div>
                <span className="text-xs font-bold text-[var(--text-primary)]">Light Theme</span>
                <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Clean enterprise daylight presentation
                </span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
