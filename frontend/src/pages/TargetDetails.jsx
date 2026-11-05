import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RotateCw, 
  Edit3, 
  Server, 
  Globe, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Activity,
  Layers,
  Terminal,
  Calendar,
  ExternalLink,
  Power,
  Play,
  Cpu
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ResponseChart from '../components/ResponseChart';
import TargetDrawer from '../components/TargetDrawer';
import { generateTimeSeries, CHECK_HISTORY, generateAvailabilityHistory } from '../data/mockData';

export default function TargetDetails({ targets = [], events = [], onUpdateTarget, onManualCheck }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const targetId = parseInt(id, 10);

  const target = targets.find(t => t.id === targetId);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [chartRange, setChartRange] = useState('24h');

  // Synthetic 32-cycle time-series for chart
  const timeSeries = useMemo(() => {
    if (!target) return [];
    return generateTimeSeries(target);
  }, [target]);

  // Target-specific check history
  const checkLogs = useMemo(() => {
    if (!target) return [];
    return CHECK_HISTORY[target.id] || [];
  }, [target]);

  // Target-specific events
  const targetEvents = useMemo(() => {
    return events.filter(e => e.target_id === targetId);
  }, [events, targetId]);

  // 30-Day availability blocks
  const availabilityDays = useMemo(() => {
    return generateAvailabilityHistory(targetId, 30);
  }, [targetId]);

  if (!target) {
    return (
      <div className="content-body py-16 text-center">
        <Server className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-3" />
        <h2 className="text-base font-bold text-[var(--text-primary)]">Target Not Found</h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          No telemetry target probe exists with ID #{id}.
        </p>
        <button
          onClick={() => navigate('/targets')}
          className="btn-telemetry btn-primary mt-4 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Targets Inventory</span>
        </button>
      </div>
    );
  }

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleManualCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      onManualCheck(target.id);
      setIsChecking(false);
      showToast(`Manual probe cycle completed for ${target.name}`);
    }, 600);
  };

  const validPoints = timeSeries.map(p => p.latency).filter(v => v !== null && v !== undefined);
  const minLatency = validPoints.length ? Math.min(...validPoints) : 0;
  const maxLatency = validPoints.length ? Math.max(...validPoints) : 0;
  const avgLatency = validPoints.length ? Math.round(validPoints.reduce((a, b) => a + b, 0) / validPoints.length) : 0;

  return (
    <div className="content-body">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3 px-4 rounded-md bg-[var(--bg-card)] border border-[var(--border-card-hover)] shadow-md flex items-center gap-2 text-xs font-medium text-[var(--text-primary)]">
          <CheckCircle2 className="w-4 h-4 text-[var(--status-online)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/targets')}
            className="btn-telemetry btn-secondary btn-icon"
            title="Back to targets list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                {target.name}
              </h1>
              <StatusBadge status={target.current_status} isEnabled={target.is_enabled} />
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="font-mono text-[var(--text-muted)] flex items-center gap-1">
                {target.target_type === 'website' && <Globe className="w-3 h-3" />}
                {target.target_type === 'http_service' && <Server className="w-3 h-3" />}
                {target.target_type === 'host' && <Cpu className="w-3 h-3" />}
                {target.address}
              </span>
              <span className="text-[var(--border-card-hover)]">•</span>
              <span className="text-[var(--text-muted)] font-mono uppercase text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                {target.check_method}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualCheck}
            disabled={isChecking || !target.is_enabled}
            className="btn-telemetry btn-secondary"
          >
            <Play className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-[var(--brand-primary)]' : ''}`} />
            <span>{isChecking ? 'Probing...' : 'Check Now'}</span>
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="btn-telemetry btn-primary"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Configure Target</span>
          </button>
        </div>
      </div>

      {/* Target Health Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="telemetry-card p-3.5">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
            Current Latency
          </span>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-1">
            {target.latency !== null && target.latency !== undefined ? `${target.latency} ms` : '—'}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
            Probe response time
          </span>
        </div>

        <div className="telemetry-card p-3.5">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
            24h Uptime SLA
          </span>
          <div className="text-2xl font-bold font-mono text-[var(--status-online)] mt-1">
            {target.uptime_percentage}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
            30-day compliance
          </span>
        </div>

        <div className="telemetry-card p-3.5">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
            Avg Probe Roundtrip
          </span>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-1">
            {avgLatency} ms
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
            Min: {minLatency}ms / Max: {maxLatency}ms
          </span>
        </div>

        <div className="telemetry-card p-3.5">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
            Probe Frequency
          </span>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-1">
            {target.check_interval_seconds}s
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
            Timeout: {target.timeout_seconds}s
          </span>
        </div>

        <div className="telemetry-card p-3.5">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
            Last Checked
          </span>
          <div className="text-base font-bold font-mono text-[var(--text-primary)] mt-1.5 truncate">
            {target.last_checked_at ? new Date(target.last_checked_at).toLocaleTimeString() : 'Never'}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block truncate">
            {target.last_checked_at ? new Date(target.last_checked_at).toLocaleDateString() : 'Awaiting check'}
          </span>
        </div>
      </div>

      {/* Response Time Chart Card */}
      <div className="telemetry-card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)] mb-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Response Time & SLA Latency History
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Warning threshold ({target.warning_threshold_ms}ms) and Critical threshold ({target.critical_threshold_ms}ms)
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {['1h', '6h', '12h', '24h', '7d'].map((r) => (
              <button
                key={r}
                onClick={() => setChartRange(r)}
                className={`text-xs px-2.5 py-0.5 rounded transition ${
                  chartRange === r
                    ? 'bg-[var(--brand-primary)] text-white font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full overflow-hidden">
          <ResponseChart points={timeSeries} target={target} height={210} />
        </div>
      </div>

      {/* 30-Day Availability Trend Bar */}
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
            {target.uptime_percentage}
          </span>
        </div>

        <div className="grid grid-cols-15 sm:grid-cols-30 gap-1 pt-1">
          {availabilityDays.map((day, idx) => (
            <div
              key={idx}
              title={`${day.date}: ${day.uptime}% uptime`}
              className="h-6 rounded-sm cursor-pointer transition hover:opacity-80"
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

      {/* Two Column Layout: Configuration & Recent Checks History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Monitoring Configuration */}
        <div className="telemetry-card p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] pb-3 border-b border-[var(--border-subtle)] mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--brand-primary)]" />
              Monitoring Configuration
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Target ID</span>
                <span className="font-mono text-[var(--text-secondary)]">#{target.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Check Protocol</span>
                <span className="font-mono uppercase font-semibold text-[var(--text-primary)]">{target.check_method}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Polling Interval</span>
                <span className="font-mono text-[var(--text-primary)]">{target.check_interval_seconds} seconds</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Request Timeout</span>
                <span className="font-mono text-[var(--text-primary)]">{target.timeout_seconds} seconds</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Warning Threshold</span>
                <span className="font-mono text-[var(--status-warning)] font-semibold">{target.warning_threshold_ms} ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Critical Threshold</span>
                <span className="font-mono text-[var(--status-critical)] font-semibold">{target.critical_threshold_ms} ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Active Telemetry</span>
                <span className={`font-mono text-xs font-semibold ${target.is_enabled ? 'text-[var(--status-online)]' : 'text-[var(--status-disabled)]'}`}>
                  {target.is_enabled ? 'ENABLED' : 'PAUSED'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)]">Provisioned Date</span>
                <span className="font-mono text-[11px] text-[var(--text-muted)]">
                  {target.created_at ? new Date(target.created_at).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="btn-telemetry btn-secondary w-full mt-4 justify-center"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Modify Alert Thresholds</span>
          </button>
        </div>

        {/* Right 2 Columns: Check History Table */}
        <div className="lg:col-span-2 telemetry-card flex flex-col">
          <div className="telemetry-card-header">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--text-muted)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Recent Probe Cycles
              </h2>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              Last 15 Cycles
            </span>
          </div>

          <div className="table-container flex-1">
            <table className="telemetry-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Result</th>
                  <th>Response Time</th>
                  <th>HTTP / Ping Status</th>
                  <th>Diagnostics</th>
                </tr>
              </thead>
              <tbody>
                {checkLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="font-mono text-xs text-[var(--text-muted)]">
                      {new Date(log.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td>
                      <StatusBadge status={log.result_status} />
                    </td>
                    <td>
                      {log.response_time_ms !== null ? (
                        <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                          {log.response_time_ms} ms
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td>
                      <span className="font-mono text-xs text-[var(--text-secondary)]">
                        {log.http_status_code ? `HTTP ${log.http_status_code}` : log.is_available ? 'Echo Reply (ICMP)' : 'No Response'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-[var(--text-muted)] truncate block max-w-[200px]" title={log.error_message || 'Normal probe cycle'}>
                        {log.error_message || 'OK: Response within SLA'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Target Drawer */}
      <TargetDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        target={target}
        onSave={(data) => {
          onUpdateTarget(data);
          showToast(`Saved target settings for ${data.name}`);
        }}
      />
    </div>
  );
}
