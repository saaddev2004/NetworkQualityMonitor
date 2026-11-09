import React, { useState, useMemo } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
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
export default function Dashboard({ 
  targets = [], 
  events = [], 
  summary = null,
  isLoadingSummary = false,
  summaryError = null,
  onRefresh = null,
  onAddTarget, 
  onUpdateTarget 
}) {
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

  const handleRefresh = async () => {
    if (isRefreshing || isLoadingSummary) return;
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.error('Failed to refresh dashboard summary:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenEvent = (event) => {
    setSelectedEvent(event);
    setIsEventDrawerOpen(true);
  };

  return (
    <div className="content-body">
      {/* API Error Banner if summary connection fails or refresh fails */}
      {summaryError && (
        <div className="p-3.5 rounded-lg border border-[var(--status-critical-border)] bg-[var(--status-critical-bg)] text-[var(--status-critical)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span><strong>Dashboard Telemetry Error:</strong> {summaryError}</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingSummary}
            className="btn-telemetry btn-secondary text-xs self-start sm:self-auto flex items-center gap-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 ${(isRefreshing || isLoadingSummary) ? 'animate-spin' : ''}`} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 1. Header with Status & Action Buttons */}
      <DashboardHeader
        isRefreshing={isRefreshing || isLoadingSummary}
        onRefresh={handleRefresh}
        onAddTarget={() => setIsTargetDrawerOpen(true)}
      />

      {/* 2. 6-Tile Infrastructure KPI Grid */}
      <DashboardKPIs 
        summary={summary} 
        isLoading={isLoadingSummary} 
      />

      {/* 3. Latency History Curve & Fleet Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ResponseTimeCard
          points={chartPoints}
          avgLatency={avgLatency}
          timeRange={chartTimeRange}
          onTimeRangeChange={setChartTimeRange}
        />
        <NetworkAvailabilityCard 
          summary={summary} 
          isLoading={isLoadingSummary} 
        />
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
