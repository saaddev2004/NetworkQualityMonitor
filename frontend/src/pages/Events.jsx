import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ExternalLink,
  ArrowUpRight,
  AlertCircle,
  Info
} from 'lucide-react';
import EventDetailDrawer from '../components/EventDetailDrawer';

export default function Events({ events = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, resolved
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter logic
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const matchesSearch = 
        evt.target_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.target_address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = 
        severityFilter === 'all' || 
        evt.severity === severityFilter;

      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'active' && !evt.is_resolved) ||
        (statusFilter === 'resolved' && evt.is_resolved);

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [events, searchQuery, severityFilter, statusFilter]);

  const activeCount = events.filter(e => !e.is_resolved).length;
  const criticalCount = events.filter(e => e.severity === 'critical').length;
  const warningCount = events.filter(e => e.severity === 'warning').length;

  const handleOpenEvent = (evt) => {
    setSelectedEvent(evt);
    setIsDrawerOpen(true);
  };

  const getSeverityBadge = (severity) => {
    if (severity === 'critical') {
      return (
        <span className="status-badge status-critical">
          <AlertCircle className="w-3 h-3" />
          <span>Critical</span>
        </span>
      );
    }
    if (severity === 'warning') {
      return (
        <span className="status-badge status-warning">
          <AlertTriangle className="w-3 h-3" />
          <span>Warning</span>
        </span>
      );
    }
    return (
      <span className="status-badge status-online">
        <CheckCircle2 className="w-3 h-3" />
        <span>Info</span>
      </span>
    );
  };

  return (
    <div className="content-body">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Event Log
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
              {filteredEvents.length} / {events.length} Incidents
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Audit trail of network alerts, state transitions, SLA breaches, and recovery events.
          </p>
        </div>

        {/* Quick Status Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs">
            <span className="status-dot" style={{ background: 'var(--status-critical)' }} />
            <span className="font-mono font-bold text-[var(--status-critical)]">{activeCount}</span>
            <span className="text-[var(--text-muted)]">Active Unresolved Alerts</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="telemetry-card p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Severity & Resolution Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => { setSeverityFilter('all'); setStatusFilter('all'); }}
            className={`text-xs py-1 px-2.5 rounded-md transition ${
              severityFilter === 'all' && statusFilter === 'all'
                ? 'bg-[var(--brand-subtle)] text-[var(--text-primary)] border border-[var(--brand-primary)] font-semibold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-transparent'
            }`}
          >
            All Events ({events.length})
          </button>

          <button
            onClick={() => { setStatusFilter('active'); }}
            className={`text-xs py-1 px-2.5 rounded-md transition flex items-center gap-1.5 ${
              statusFilter === 'active'
                ? 'bg-[var(--status-critical-bg)] text-[var(--status-critical)] border border-[var(--status-critical-border)] font-semibold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-transparent'
            }`}
          >
            <span className="status-dot" style={{ background: 'var(--status-critical)' }} />
            <span>Active Alerts ({activeCount})</span>
          </button>

          <button
            onClick={() => { setSeverityFilter('critical'); }}
            className={`text-xs py-1 px-2.5 rounded-md transition flex items-center gap-1.5 ${
              severityFilter === 'critical'
                ? 'bg-[var(--status-critical-bg)] text-[var(--status-critical)] border border-[var(--status-critical-border)] font-semibold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-transparent'
            }`}
          >
            <span>Critical Only ({criticalCount})</span>
          </button>

          <button
            onClick={() => { setSeverityFilter('warning'); }}
            className={`text-xs py-1 px-2.5 rounded-md transition flex items-center gap-1.5 ${
              severityFilter === 'warning'
                ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)] font-semibold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-transparent'
            }`}
          >
            <span>Warnings ({warningCount})</span>
          </button>

          <button
            onClick={() => { setStatusFilter('resolved'); }}
            className={`text-xs py-1 px-2.5 rounded-md transition ${
              statusFilter === 'resolved'
                ? 'bg-[var(--status-online-bg)] text-[var(--status-online)] border border-[var(--status-online-border)] font-semibold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-transparent'
            }`}
          >
            Resolved ({events.length - activeCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events log..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-8 text-xs"
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="telemetry-card">
        <div className="table-container">
          <table className="telemetry-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Target</th>
                <th>Event Type</th>
                <th>Description</th>
                <th>Triggered At</th>
                <th>Resolution Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-xs text-[var(--text-muted)]">
                    No incident events match your active filters.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    className="clickable-row"
                    onClick={() => handleOpenEvent(evt)}
                  >
                    <td>
                      {getSeverityBadge(evt.severity)}
                    </td>

                    <td>
                      <div className="font-semibold text-[var(--text-primary)]">
                        {evt.target_name}
                      </div>
                      <div className="font-mono text-[11px] text-[var(--text-muted)] truncate max-w-[180px]">
                        {evt.target_address}
                      </div>
                    </td>

                    <td>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        {evt.event_type.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="max-w-xs">
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                    </td>

                    <td>
                      <span className="text-xs text-[var(--text-muted)] font-mono whitespace-nowrap">
                        {new Date(evt.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">
                        {new Date(evt.occurred_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </td>

                    <td>
                      {evt.is_resolved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--status-online)]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Resolved</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--status-critical)]">
                          <span className="status-dot" style={{ background: 'var(--status-critical)' }} />
                          <span>Active Alert</span>
                        </span>
                      )}
                    </td>

                    <td className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEvent(evt);
                        }}
                        className="btn-telemetry btn-secondary text-xs py-1 px-2.5"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Drawer */}
      <EventDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
}
