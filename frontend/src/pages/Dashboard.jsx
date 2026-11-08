import React, { useState, useMemo } from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardKPIs from '../components/dashboard/DashboardKPIs';
import ResponseTimeCard from '../components/dashboard/ResponseTimeCard';
import NetworkAvailabilityCard from '../components/dashboard/NetworkAvailabilityCard';
import TargetHealthSnapshot from '../components/dashboard/TargetHealthSnapshot';
import RecentIncidentsSnapshot from '../components/dashboard/RecentIncidentsSnapshot';
import EventDetailDrawer from '../components/EventDetailDrawer';
import TargetDrawer from '../components/TargetDrawer';
import { generateResponseHistory } from '../data/mockData';

/**
 * Dashboard Page
 * High-level network health overview combining real-time KPIs, response time curves,
 * availability metrics, target summaries, and incident auditing.
 */
export default function Dashboard({ targets = [], events = [], onAddTarget, onUpdateTarget }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false);
  const [isTargetDrawerOpen, setIsTargetDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartTimeRange, setChartTimeRange] = useState('24h');

  // Average latency of online targets
  const onlineTargets = targets.filter(t => t.latency !== null && t.current_status === 'online');
  const avgLatency = onlineTargets.length > 0 
    ? Math.round(onlineTargets.reduce((acc, t) => acc + t.latency, 0) / onlineTargets.length)
    : 0;

  // Chart data points for response time history
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
      {/* 1. Header with Status & Action Buttons */}
      <DashboardHeader
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onAddTarget={() => setIsTargetDrawerOpen(true)}
      />

      {/* 2. 6-Tile Infrastructure KPI Grid */}
      <DashboardKPIs targets={targets} />

      {/* 3. Latency History Curve & Fleet Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ResponseTimeCard
          points={chartPoints}
          avgLatency={avgLatency}
          timeRange={chartTimeRange}
          onTimeRangeChange={setChartTimeRange}
        />
        <NetworkAvailabilityCard targets={targets} />
      </div>

      {/* 4. Target Health & Incident Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TargetHealthSnapshot targets={targets} />
        <RecentIncidentsSnapshot events={events} onOpenEvent={handleOpenEvent} />
      </div>

      {/* 5. Drawers */}
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
