import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardKPIs from '../components/dashboard/DashboardKPIs';
import ResponseTimeCard from '../components/dashboard/ResponseTimeCard';
import NetworkAvailabilityCard from '../components/dashboard/NetworkAvailabilityCard';
import TargetHealthSnapshot from '../components/dashboard/TargetHealthSnapshot';
import RecentIncidentsSnapshot from '../components/dashboard/RecentIncidentsSnapshot';
import EventDetailDrawer from '../components/EventDetailDrawer';
import TargetDrawer from '../components/TargetDrawer';
import { getMonitoringHistory } from '../services/historyService';

/**
 * Dashboard Page
 * High-level network health overview combining real-time KPIs, real historical response time curves,
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

  // Response Time Chart State
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [chartTimeRange, setChartTimeRange] = useState('24h');
  const [chartPoints, setChartPoints] = useState([]);
  const [chartMetrics, setChartMetrics] = useState({ avgLatency: null, minLatency: null, maxLatency: null });
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [chartError, setChartError] = useState(null);

  // Active target calculation
  const activeTargetId = selectedTargetId || (targets.length > 0 ? targets[0].id : null);
  const activeTarget = targets.find(t => t.id === Number(activeTargetId)) || targets[0] || null;

  // In-flight guard to prevent duplicate concurrent chart fetches
  const inFlightChartPromiseRef = useRef(null);

  // Fetch real monitoring history for the active target and time range
  const fetchChartHistory = useCallback(async (silent = false) => {
    if (!activeTargetId) {
      setChartPoints([]);
      setChartMetrics({ avgLatency: null, minLatency: null, maxLatency: null });
      setIsLoadingChart(false);
      return;
    }

    if (inFlightChartPromiseRef.current) {
      return inFlightChartPromiseRef.current;
    }

    if (!silent) {
      setIsLoadingChart(true);
      setChartError(null);
    }

    const fetchPromise = (async () => {
      try {
        const result = await getMonitoringHistory(activeTargetId, {
          range: chartTimeRange,
          limit: 100
        });
        setChartPoints(result.points);
        setChartMetrics({
          avgLatency: result.avgLatency,
          minLatency: result.minLatency,
          maxLatency: result.maxLatency
        });
        setChartError(null);
        return result;
      } catch (err) {
        console.error('Failed to fetch response time history:', err);
        const errMsg = err.response?.data?.error?.message 
          || (err.code === 'ERR_NETWORK' 
            ? 'Unable to connect to backend API server (http://localhost:5000). Please ensure the backend is running.' 
            : err.message)
          || 'Failed to fetch monitoring history';
        if (!silent) {
          setChartError(errMsg);
        }
        throw err;
      } finally {
        if (!silent) {
          setIsLoadingChart(false);
        }
        inFlightChartPromiseRef.current = null;
      }
    })();

    inFlightChartPromiseRef.current = fetchPromise;
    return fetchPromise;
  }, [activeTargetId, chartTimeRange]);

  // Load history whenever activeTargetId or chartTimeRange changes
  useEffect(() => {
    if (activeTargetId) {
      fetchChartHistory(false).catch(() => {});
    } else {
      setIsLoadingChart(false);
    }
  }, [activeTargetId, chartTimeRange, fetchChartHistory]);

  // Real dashboard refresh callback for user-triggered refresh button
  const handleRefresh = async () => {
    if (isRefreshing || isLoadingSummary || isLoadingChart) return;
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        onRefresh ? onRefresh() : Promise.resolve(),
        fetchChartHistory(false)
      ]);
    } catch (err) {
      console.error('Failed to refresh dashboard:', err);
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
        isRefreshing={isRefreshing || isLoadingSummary || isLoadingChart}
        onRefresh={handleRefresh}
        onAddTarget={() => setIsTargetDrawerOpen(true)}
      />

      {/* 2. 6-Tile Infrastructure KPI Grid */}
      <DashboardKPIs 
        summary={summary} 
        isLoading={isLoadingSummary} 
      />

      {/* 3. Real Latency History Curve & Fleet Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ResponseTimeCard
          points={chartPoints}
          target={activeTarget}
          targets={targets}
          selectedTargetId={activeTargetId}
          onTargetChange={setSelectedTargetId}
          avgLatency={chartMetrics.avgLatency}
          minLatency={chartMetrics.minLatency}
          maxLatency={chartMetrics.maxLatency}
          timeRange={chartTimeRange}
          onTimeRangeChange={setChartTimeRange}
          isLoading={isLoadingChart}
          error={chartError}
          onRetry={() => fetchChartHistory(false)}
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
