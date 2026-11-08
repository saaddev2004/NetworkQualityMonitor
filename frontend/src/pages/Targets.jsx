import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Server, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  RotateCw, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Check,
  Power,
  Play,
  Globe,
  Cpu
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Sparkline from '../components/Sparkline';
import TargetDrawer from '../components/TargetDrawer';

export default function Targets({ 
  targets = [], 
  onAddTarget, 
  onUpdateTarget, 
  onDeleteTarget,
  onToggleTarget,
  onManualCheck
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [checkingId, setCheckingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Status counts for filter chips
  const counts = useMemo(() => {
    return {
      all: targets.length,
      online: targets.filter(t => t.current_status === 'online').length,
      warning: targets.filter(t => t.current_status === 'warning').length,
      critical: targets.filter(t => t.current_status === 'critical').length,
      offline: targets.filter(t => t.current_status === 'offline').length,
      disabled: targets.filter(t => !t.is_enabled || t.current_status === 'disabled').length
    };
  }, [targets]);

  // Filtered targets
  const filteredTargets = useMemo(() => {
    return targets.filter(t => {
      const matchesSearch = 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'disabled' ? (!t.is_enabled || t.current_status === 'disabled') : t.current_status === statusFilter);

      const matchesType =
        typeFilter === 'all' ||
        t.target_type === typeFilter;

      const matchesMethod =
        methodFilter === 'all' ||
        t.check_method === methodFilter;

      return matchesSearch && matchesStatus && matchesType && matchesMethod;
    });
  }, [targets, searchQuery, statusFilter, typeFilter, methodFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleManualCheck = (e, target) => {
    e.stopPropagation();
    setCheckingId(target.id);
    setTimeout(() => {
      onManualCheck(target.id);
      setCheckingId(null);
      showToast(`Manual probe cycle completed for ${target.name}`);
    }, 600);
  };

  const handleToggle = (e, target) => {
    e.stopPropagation();
    onToggleTarget(target.id);
    showToast(`Target ${target.name} ${target.is_enabled ? 'paused' : 'activated'}`);
  };

  const handleEdit = (e, target) => {
    e.stopPropagation();
    setSelectedTarget(target);
    setIsDrawerOpen(true);
  };

  const handleDelete = (e, target) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to decommission probe target: "${target.name}"?`)) {
      onDeleteTarget(target.id);
      showToast(`Decommissioned target #${target.id}`);
    }
  };

  // CSV Export - browser client-side download
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Address', 'Type', 'Method', 'Status', 'Latency(ms)', 'Uptime', 'Interval(s)'];
    const rows = targets.map(t => [
      t.id,
      `"${t.name.replace(/"/g, '""')}"`,
      `"${t.address.replace(/"/g, '""')}"`,
      t.target_type,
      t.check_method,
      t.current_status,
      t.latency !== null ? t.latency : 'N/A',
      t.uptime_percentage,
      t.check_interval_seconds
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `monitored_targets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported targets CSV report successfully');
  };

  return (
    <div className="content-body">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="toast-notification fixed bottom-6 right-6 z-50 p-3 px-4 rounded-md bg-[var(--bg-card)] border border-[var(--border-card-hover)] shadow-md flex items-center gap-2 text-xs font-medium text-[var(--text-primary)]">
          <CheckCircle2 className="w-4 h-4 text-[var(--status-online)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Monitored Targets
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
              {filteredTargets.length} / {targets.length} Probes
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Complete inventory of monitored websites, HTTP microservices, and network hosts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="btn-telemetry btn-secondary"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setSelectedTarget(null);
              setIsDrawerOpen(true);
            }}
            className="btn-telemetry btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Target</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="telemetry-card p-3 space-y-3">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Targets', count: counts.all },
            { id: 'online', label: 'Online', count: counts.online, color: 'var(--status-online)' },
            { id: 'warning', label: 'Warning', count: counts.warning, color: 'var(--status-warning)' },
            { id: 'critical', label: 'Critical', count: counts.critical, color: 'var(--status-critical)' },
            { id: 'offline', label: 'Offline', count: counts.offline, color: 'var(--status-offline)' },
            { id: 'disabled', label: 'Disabled', count: counts.disabled, color: 'var(--status-disabled)' },
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setStatusFilter(chip.id)}
              className={`text-xs py-1 px-2.5 rounded-md transition flex items-center gap-1.5 border ${
                statusFilter === chip.id
                  ? 'bg-[var(--brand-subtle)] text-[var(--text-primary)] border-[var(--brand-primary)] font-semibold'
                  : 'text-[var(--text-secondary)] border-transparent hover:bg-[var(--bg-elevated)]'
              }`}
            >
              {chip.color && (
                <span className="status-dot" style={{ background: chip.color }} />
              )}
              <span>{chip.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                {chip.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Category Selectors */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search targets by name, URL, or IP address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-8 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-input text-xs w-auto"
            >
              <option value="all">All Types</option>
              <option value="website">Website</option>
              <option value="http_service">HTTP Service</option>
              <option value="host">Host / Node</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="form-input text-xs w-auto"
            >
              <option value="all">All Methods</option>
              <option value="http">HTTP Probing</option>
              <option value="icmp">ICMP Ping</option>
            </select>
          </div>
        </div>
      </div>

      {/* Targets Table */}
      <div className="telemetry-card">
        <div className="table-container">
          <table className="telemetry-table">
            <thead>
              <tr>
                <th>Target</th>
                <th>Method</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Uptime (24h)</th>
                <th>Trend</th>
                <th>Last Checked</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTargets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-xs text-[var(--text-muted)]">
                    No monitored targets match your current search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTargets.map((target) => {
                  const isChecking = checkingId === target.id;

                  return (
                    <tr
                      key={target.id}
                      className="clickable-row"
                      onClick={() => navigate(`/targets/${target.id}`)}
                    >
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="p-1 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                            {target.target_type === 'website' && <Globe className="w-3.5 h-3.5" />}
                            {target.target_type === 'http_service' && <Server className="w-3.5 h-3.5" />}
                            {target.target_type === 'host' && <Cpu className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition">
                              {target.name}
                            </div>
                            <div className="font-mono text-[11px] text-[var(--text-muted)] truncate max-w-[240px]">
                              {target.address}
                            </div>
                          </div>
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

                      <td>
                        <span className="text-xs text-[var(--text-muted)] font-mono">
                          {target.last_checked_at ? new Date(target.last_checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Never'}
                        </span>
                      </td>

                      <td className="text-right">
                        <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleManualCheck(e, target)}
                            disabled={isChecking || !target.is_enabled}
                            title="Run manual probe check"
                            className="btn-telemetry btn-secondary btn-icon text-xs"
                          >
                            <Play className={`w-3 h-3 ${isChecking ? 'animate-spin text-[var(--brand-primary)]' : ''}`} />
                          </button>

                          <button
                            onClick={(e) => handleToggle(e, target)}
                            title={target.is_enabled ? 'Pause monitoring' : 'Enable monitoring'}
                            className="btn-telemetry btn-secondary btn-icon text-xs"
                          >
                            <Power className={`w-3 h-3 ${target.is_enabled ? 'text-[var(--status-online)]' : 'text-[var(--text-muted)]'}`} />
                          </button>

                          <button
                            onClick={(e) => handleEdit(e, target)}
                            title="Edit configuration"
                            className="btn-telemetry btn-secondary btn-icon text-xs"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>

                          <button
                            onClick={(e) => handleDelete(e, target)}
                            title="Decommission target"
                            className="btn-telemetry btn-danger btn-icon text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Drawer */}
      <TargetDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        target={selectedTarget}
        onSave={(data) => {
          if (selectedTarget) {
            onUpdateTarget(data);
            showToast(`Updated target: ${data.name}`);
          } else {
            onAddTarget(data);
            showToast(`Provisioned new target: ${data.name}`);
          }
        }}
      />
    </div>
  );
}
