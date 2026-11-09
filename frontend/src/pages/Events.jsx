import React, { useState, useMemo } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import EventsHeader from '../components/events/EventsHeader';
import EventsFilterBar from '../components/events/EventsFilterBar';
import EventsTable from '../components/events/EventsTable';
import EventDetailDrawer from '../components/EventDetailDrawer';

/**
 * Events Page
 * Audit trail and incident diagnostics for network state transitions, SLA breaches, and recovery events.
 */
export default function Events({ 
  events = [], 
  isLoading = false, 
  error = null, 
  onRetry = null 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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

  return (
    <div className="content-body">
      {/* API Error Banner if connection fails */}
      {error && (
        <div className="p-3.5 rounded-lg border border-[var(--status-critical-border)] bg-[var(--status-critical-bg)] text-[var(--status-critical)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span><strong>Backend Connection Error:</strong> {error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-telemetry btn-secondary text-xs self-start sm:self-auto flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* 1. Page Header with Ratio Badge & Active Count Pill */}
      <EventsHeader
        filteredCount={filteredEvents.length}
        totalCount={events.length}
        activeCount={activeCount}
      />

      {/* 2. Severity & Resolution Filter Bar */}
      <EventsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        severityFilter={severityFilter}
        onSeverityChange={setSeverityFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        totalEvents={events.length}
        activeCount={activeCount}
        criticalCount={criticalCount}
        warningCount={warningCount}
      />

      {/* 3. Incidents Audit Table */}
      <EventsTable
        events={filteredEvents}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        onOpenEvent={handleOpenEvent}
      />

      {/* 4. Incident Diagnostic Drawer */}
      <EventDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
}
