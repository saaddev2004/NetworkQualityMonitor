import React, { useState, useMemo } from 'react';
import EventsHeader from '../components/events/EventsHeader';
import EventsFilterBar from '../components/events/EventsFilterBar';
import EventsTable from '../components/events/EventsTable';
import EventDetailDrawer from '../components/EventDetailDrawer';

/**
 * Events Page
 * Audit trail and incident diagnostics for network state transitions, SLA breaches, and recovery events.
 */
export default function Events({ events = [] }) {
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
