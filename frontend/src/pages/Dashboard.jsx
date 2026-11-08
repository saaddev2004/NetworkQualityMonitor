import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Server, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  RotateCw, 
  Wifi, 
  ShieldAlert,
  ArrowRight,
  Radio,
  WifiOff,
  PowerOff,
  AlertCircle
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Sparkline from '../components/Sparkline';
import ResponseChart from '../components/ResponseChart';
import EventDetailDrawer from '../components/EventDetailDrawer';
import TargetDrawer from '../components/TargetDrawer';
import { generateResponseHistory } from '../data/mockData';

export default function Dashboard({ targets = [], events = [], onAddTarget, onUpdateTarget }) {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false);
  const [isTargetDrawerOpen, setIsTargetDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartTimeRange, setChartTimeRange] = useState('24h');

  // Compute live KPIs from current targets list
  const total = targets.length;
  const online = targets.filter(t => t.current_status === 'online').length;
  const offline = targets.filter(t => t.current_status === 'offline').length;
  const warning = targets.filter(t => t.current_status === 'warning').length;
  const critical = targets.filter(t => t.current_status === 'critical').length;
  const disabled = targets.filter(t => !t.is_enabled || t.current_status === 'disabled').length;

  // Average latency of online targets
  const onlineTargets = targets.filter(t => t.latency !== null && t.current_status === 'online');
  const avgLatency = onlineTargets.length > 0 
    ? Math.round(onlineTargets.reduce((acc, t) => acc + t.latency, 0) / onlineTargets.length)
    : 0;

  // Chart data for response time history
  const chartPoints = useMemo(() => {
    return generateResponseHistory(1, 32);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleOpenEvent = (event) => {
    setSelectedEvent(event);
    setIsEventDrawerOpen(true);
  };

  return (
    <div className="content-body">
      {/* Top Header / Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Network Overview
            </h1>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--status-online-bg)] text-[var(--status-online)] border border-[var(--status-online-border)]">
              <span className="status-dot" style={{ background: 'var(--status-online)' }} />
              Engine Online
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Real-time visibility into your infrastructure health and network performance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-telemetry btn-secondary"
            title="Poll target statuses immediately"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[var(--brand-primary)]' : ''}`} />
            <span>{isRefreshing ? 'Auditing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setIsTargetDrawerOpen(true)}
            className="btn-telemetry btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Target</span>
          </button>
        </div>
      </div>

      {/* KPI Section: Exactly 6 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Total Targets */}
        <div className="telemetry-card kpi-card">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-[11px] font-semibold uppercase tracking-wider">
            <span>Total Targets</span>
            <Radio className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
          </div>
          <div className="my-1">
            <div className="kpi-value text-[var(--text-primary)]">{total}</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Configured endpoints</div>
          </div>
        </div>

        {/* 2. Online */}
        <div className="telemetry-card kpi-card" style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--status-online)' }}>
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--status-online)' }}>
            <span>Online</span>
            <span className="status-dot" style={{ background: 'var(--status-online)' }} />
          </div>
          <div className="my-1">
            <div className="kpi-value" style={{ color: 'var(--status-online)' }}>{online}</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Passing SLA probes</div>
          </div>
        </div>

        {/* 3. Offline */}
        <div className="telemetry-card kpi-card" style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--status-offline)' }}>
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--status-offline)' }}>
            <span>Offline</span>
            <span className="status-dot" style={{ background: 'var(--status-offline)' }} />
          </div>
          <div className="my-1">
            <div className="kpi-value" style={{ color: 'var(--status-offline)' }}>{offline}</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Unreachable / timeout</div>
          </div>
        </div>

        {/* 4. Warning */}
        <div className="telemetry-card kpi-card" style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--status-warning)' }}>
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--status-warning)' }}>
            <span>Warning</span>
            <span className="status-dot" style={{ background: 'var(--status-warning)' }} />
          </div>
          <div className="my-1">
            <div className="kpi-value" style={{ color: 'var(--status-warning)' }}>{warning}</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Latency SLA elevated</div>
          </div>
        </div>

        {/* 5. Critical */}
        <div className="telemetry-card kpi-card" style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--status-critical)' }}>
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--status-critical)' }}>
            <span>Critical</span>
            <span className="status-dot" style={{ background: 'var(--status-critical)' }} />
          </div>
          <div className="my-1">
            <div className="kpi-value" style={{ color: 'var(--status-critical)' }}>{critical}</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Threshold breached</div>
          </div>
        </div>

        {/* 6. Disabled */}
        <div className="telemetry-card kpi-card" style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--status-disabled)' }}>
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[var(--status-disabled)]">
            <span>Disabled</span>
            <PowerOff className="w-3.5 h-3.5 text-[var(--status-disabled)]" />
          </div>
          <div className="my-1">
            <div className="kpi-value text-[var(--status-disabled)]">{disabled}</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Monitoring paused</div>
          </div>
        </div>
      </div>

      {/* Dashboard Charts: Response Time & Network Availability Side by Side on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Response Time Visualization */}
        <div className="lg:col-span-2 telemetry-card flex flex-col">
          <div className="telemetry-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Response Time History
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Historical round-trip latency across active probe cycles
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {['1h', '6h', '12h', '24h', '7d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setChartTimeRange(range)}
                  className={`text-xs px-2 py-0.5 rounded transition ${
                    chartTimeRange === range
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between">
            {/* Latency Summary Stats */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-3 text-xs">
              <div>
                <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Average Latency</span>
                <span className="font-mono font-bold text-sm text-[var(--text-primary)]">{avgLatency} ms</span>
              </div>
              <div className="h-6 w-px bg-[var(--border-subtle)]" />
              <div>
                <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Min Latency</span>
                <span className="font-mono font-bold text-sm text-[var(--status-online)]">24 ms</span>
              </div>
              <div className="h-6 w-px bg-[var(--border-subtle)]" />
              <div>
                <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Max Peak</span>
                <span className="font-mono font-bold text-sm text-[var(--status-warning)]">180 ms</span>
              </div>
              <div className="h-6 w-px bg-[var(--border-subtle)] hidden sm:block" />
              <div className="hidden sm:block">
                <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Baseline SLA</span>
                <span className="font-mono font-bold text-sm text-[var(--text-secondary)]">&lt; 300 ms</span>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="w-full overflow-hidden">
              <ResponseChart points={chartPoints} height={190} />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Network Availability Visualization */}
        <div className="telemetry-card flex flex-col">
          <div className="telemetry-card-header">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Network Availability
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Rolling SLA conformance
              </p>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between">
            {/* Primary Availability Percentage */}
            <div className="text-center py-2">
              <div className="text-4xl font-mono font-extrabold tracking-tight text-[var(--status-online)]">
                99.42%
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                Overall fleet uptime (rolling 24h)
              </div>
            </div>

            {/* Segmented Color Availability Bar */}
            <div className="my-2">
              <div className="w-full h-2.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden flex">
                <div style={{ width: `${(online / total) * 100}%` }} className="h-full bg-[var(--status-online)]" title={`Online: ${online}`} />
                <div style={{ width: `${(warning / total) * 100}%` }} className="h-full bg-[var(--status-warning)]" title={`Warning: ${warning}`} />
                <div style={{ width: `${(critical / total) * 100}%` }} className="h-full bg-[var(--status-critical)]" title={`Critical: ${critical}`} />
                <div style={{ width: `${(offline / total) * 100}%` }} className="h-full bg-[var(--status-offline)]" title={`Offline: ${offline}`} />
                <div style={{ width: `${(disabled / total) * 100}%` }} className="h-full bg-[var(--status-disabled)]" title={`Disabled: ${disabled}`} />
              </div>
            </div>

            {/* Status Breakdown Legend Rows */}
            <div className="space-y-2 text-xs pt-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <span className="status-dot" style={{ background: 'var(--status-online)' }} />
                  Online (Healthy)
                </span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{online}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <span className="status-dot" style={{ background: 'var(--status-warning)' }} />
                  Warning (High Latency)
                </span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{warning}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <span className="status-dot" style={{ background: 'var(--status-critical)' }} />
                  Critical (Breach)
                </span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{critical}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <span className="status-dot" style={{ background: 'var(--status-offline)' }} />
                  Offline (Timeout)
                </span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{offline}</span>
              </div>
            </div>

            {/* Bottom 30-Day Summary */}
            <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>30-Day SLA Target: 99.0%</span>
              <span className="font-mono font-semibold text-[var(--status-online)]">SLA PASS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Health & Recent Incidents: 2-Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Target Health Snapshot */}
        <div className="lg:col-span-2 telemetry-card flex flex-col">
          <div className="telemetry-card-header">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[var(--brand-primary)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Target Health
              </h2>
            </div>
            <button
              onClick={() => navigate('/targets')}
              className="text-xs font-medium text-[var(--brand-primary)] hover:underline flex items-center gap-1"
            >
              View All {total} Targets <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="table-container flex-1">
            <table className="telemetry-table">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Latency</th>
                  <th>Uptime</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {targets.slice(0, 6).map((target) => (
                  <tr
                    key={target.id}
                    className="clickable-row"
                    onClick={() => navigate(`/targets/${target.id}`)}
                  >
                    <td>
                      <div className="font-semibold text-[var(--text-primary)]">{target.name}</div>
                      <div className="font-mono text-[11px] text-[var(--text-muted)] truncate max-w-[220px]">
                        {target.address}
                      </div>
                    </td>
                    <td>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        {target.check_method}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={target.current_status} isEnabled={target.is_enabled} />
                    </td>
                    <td>
                      {target.latency !== null && target.latency !== undefined ? (
                        <span className="font-mono font-medium text-[var(--text-primary)]">
                          {target.latency} ms
                        </span>
                      ) : (
                        <span className="font-mono text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td>
                      <span className="font-mono font-medium" style={{
                        color: parseFloat(target.uptime_percentage) >= 99 ? 'var(--status-online)' :
                               parseFloat(target.uptime_percentage) >= 95 ? 'var(--status-warning)' : 'var(--status-critical)'
                      }}>
                        {target.uptime_percentage}
                      </span>
                    </td>
                    <td>
                      <Sparkline data={target.history_sparkline} status={target.current_status} width={75} height={20} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Recent Incidents */}
        <div className="telemetry-card flex flex-col">
          <div className="telemetry-card-header">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[var(--status-warning)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Recent Incidents
              </h2>
            </div>
            <button
              onClick={() => navigate('/events')}
              className="text-xs font-medium text-[var(--brand-primary)] hover:underline flex items-center gap-1"
            >
              Event Log <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-3 flex-1 space-y-2.5 overflow-y-auto max-h-[360px]">
            {events.slice(0, 5).map((evt) => (
              <div
                key={evt.id}
                onClick={() => handleOpenEvent(evt)}
                className="p-3 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-[var(--border-card-hover)] cursor-pointer transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="status-dot" style={{
                      background: evt.severity === 'critical' ? 'var(--status-critical)' :
                                  evt.severity === 'warning' ? 'var(--status-warning)' : 'var(--status-online)'
                    }} />
                    <span className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[170px]">
                      {evt.target_name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {new Date(evt.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {evt.description}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)]">
                  <span className="uppercase">{evt.event_type}</span>
                  <span className="text-[var(--brand-primary)] flex items-center gap-0.5">
                    Inspect <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Target and Event Drawers */}
      <EventDetailDrawer
        isOpen={isEventDrawerOpen}
        onClose={() => setIsEventDrawerOpen(false)}
        event={selectedEvent}
      />

      <TargetDrawer
        isOpen={isTargetDrawerOpen}
        onClose={() => setIsTargetDrawerOpen(false)}
        target={null}
        onSave={onAddTarget}
      />
    </div>
  );
}
