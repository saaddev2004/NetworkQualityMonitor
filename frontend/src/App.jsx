import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopTelemetryBar from './components/layout/TopTelemetryBar';
import Dashboard from './pages/Dashboard';
import Targets from './pages/Targets';
import TargetDetails from './pages/TargetDetails';
import Events from './pages/Events';
import Settings from './pages/Settings';
import ScrollToTop from './components/common/ScrollToTop';
import { getEvents } from './services/eventService';
import { getTargets, createTarget, updateTarget, deleteTarget, toggleTarget, checkTarget } from './services/targetService';
import { getDashboardSummary } from './services/dashboardService';
import { getSystemHealth } from './services/systemService';
import './index.css';

/**
 * Root Application Component
 * Coordinates routing, telemetry data state, responsive drawer overlay, and Light/Dark theme switching
 */
export default function App() {
  const [targets, setTargets] = useState([]);
  const [isLoadingTargets, setIsLoadingTargets] = useState(true);
  const [targetsError, setTargetsError] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live system health and engine scheduler telemetry state
  const [healthData, setHealthData] = useState(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);
  const [healthError, setHealthError] = useState(null);
  const [lastHealthSync, setLastHealthSync] = useState(null);

  // Theme State management (Dark mode by default, toggleable to light)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch targets from backend REST API (GET /api/v1/targets)
  const fetchTargets = useCallback(async () => {
    setIsLoadingTargets(true);
    setTargetsError(null);
    try {
      const data = await getTargets();
      setTargets(data);
    } catch (err) {
      console.error('Failed to fetch targets from API:', err);
      const errMsg = err.response?.data?.error?.message 
        || (err.code === 'ERR_NETWORK' 
          ? 'Unable to connect to backend API server (http://localhost:5000). Please ensure the backend is running.' 
          : err.message)
        || 'Failed to fetch targets from backend API';
      setTargetsError(errMsg);
      setTargets([]);
    } finally {
      setIsLoadingTargets(false);
    }
  }, []);

  // Fetch incident events from backend REST API (GET /api/v1/events)
  const fetchEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    setEventsError(null);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events from API:', err);
      const errMsg = err.response?.data?.error?.message 
        || (err.code === 'ERR_NETWORK' 
          ? 'Unable to connect to backend API server (http://localhost:5000). Please ensure the backend is running.' 
          : err.message)
        || 'Failed to fetch incident events from backend API';
      setEventsError(errMsg);
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  const inFlightSummaryPromiseRef = useRef(null);

  // Fetch high-level summary from backend REST API (GET /api/v1/dashboard/summary)
  const fetchDashboardSummary = useCallback(async (silent = false) => {
    // Prevent duplicate in-flight requests by returning the active promise
    if (inFlightSummaryPromiseRef.current) {
      return inFlightSummaryPromiseRef.current;
    }

    if (!silent) {
      setIsLoadingSummary(true);
      setSummaryError(null);
    }

    const summaryPromise = (async () => {
      try {
        const data = await getDashboardSummary();
        setDashboardSummary(data);
        setSummaryError(null);
        return data;
      } catch (err) {
        console.error('Failed to fetch dashboard summary from API:', err);
        const errMsg = err.response?.data?.error?.message 
          || (err.code === 'ERR_NETWORK' 
            ? 'Unable to connect to backend API server (http://localhost:5000). Please ensure the backend is running.' 
            : err.message)
          || 'Failed to fetch dashboard summary from backend API';
        if (!silent) {
          setSummaryError(errMsg);
        }
        throw err;
      } finally {
        if (!silent) {
          setIsLoadingSummary(false);
        }
        inFlightSummaryPromiseRef.current = null;
      }
    })();

    inFlightSummaryPromiseRef.current = summaryPromise;
    return summaryPromise;
  }, []);

  const inFlightHealthPromiseRef = useRef(null);

  // Fetch system health and engine scheduler status (GET /api/v1/health)
  const fetchSystemHealth = useCallback(async (silent = false) => {
    if (inFlightHealthPromiseRef.current) {
      return inFlightHealthPromiseRef.current;
    }

    if (!silent) {
      setIsLoadingHealth(true);
      setHealthError(null);
    }

    const healthPromise = (async () => {
      try {
        const data = await getSystemHealth();
        setHealthData(data);
        setLastHealthSync(new Date());
        setHealthError(null);
        return data;
      } catch (err) {
        console.error('Failed to fetch system telemetry:', err);
        const errMsg = err.response?.data?.error?.message 
          || (err.code === 'ERR_NETWORK' 
            ? 'Unable to connect to backend API server (http://localhost:5000). Please ensure the backend is running.' 
            : err.message)
          || 'Failed to fetch engine telemetry';
        if (!silent) {
          setHealthError(errMsg);
        }
        throw err;
      } finally {
        if (!silent) {
          setIsLoadingHealth(false);
        }
        inFlightHealthPromiseRef.current = null;
      }
    })();

    inFlightHealthPromiseRef.current = healthPromise;
    return healthPromise;
  }, []);

  // Fetch targets, events, summary, and engine health on initial mount
  useEffect(() => {
    fetchTargets();
    fetchEvents();
    fetchDashboardSummary();
    fetchSystemHealth();

    // Periodic freshness check every 30s to keep engine status up to date
    const telemetryInterval = setInterval(() => {
      fetchSystemHealth(true).catch(() => {});
    }, 30000);

    return () => clearInterval(telemetryInterval);
  }, [fetchTargets, fetchEvents, fetchDashboardSummary, fetchSystemHealth]);

  // Real dashboard refresh callback for user-triggered refresh button
  const handleRefreshDashboard = useCallback(async () => {
    const results = await Promise.allSettled([
      fetchDashboardSummary(false),
      fetchTargets(),
      fetchEvents(),
      fetchSystemHealth(true)
    ]);
    const summaryRes = results[0];
    if (summaryRes.status === 'rejected') {
      throw summaryRes.reason;
    }
  }, [fetchDashboardSummary, fetchTargets, fetchEvents, fetchSystemHealth]);

  // Add target handler (POST /api/v1/targets)
  const handleAddTarget = async (newTargetData) => {
    try {
      const created = await createTarget(newTargetData);
      setTargets(prev => [created, ...prev]);
      // Silently refresh dashboard summary to update KPI metrics
      fetchDashboardSummary(true).catch(e => console.error('Dashboard summary refresh error:', e));
      fetchSystemHealth(true).catch(e => console.error('System health refresh error:', e));
      return created;
    } catch (err) {
      console.error('Failed to create target via API:', err);
      const apiErr = new Error(
        err.response?.data?.error?.message 
        || (err.code === 'ERR_NETWORK' 
          ? 'Unable to connect to backend API server (http://localhost:5000). Please ensure the backend is running.' 
          : err.message)
        || 'Failed to create monitored target'
      );
      apiErr.code = err.response?.data?.error?.code;
      apiErr.details = err.response?.data?.error?.details;
      throw apiErr;
    }
  };

  // Update target handler (PATCH /api/v1/targets/:id)
  const handleUpdateTarget = async (updatedTarget) => {
    const targetId = updatedTarget?.id;
    if (!targetId) {
      throw new Error('Target ID is missing');
    }

    try {
      const normalized = await updateTarget(targetId, updatedTarget);
      setTargets(prev => prev.map(t => (t.id === Number(targetId) ? { ...t, ...normalized } : t)));
      // Silently refresh dashboard summary
      fetchDashboardSummary(true).catch(e => console.error('Dashboard summary refresh error:', e));
      return normalized;
    } catch (err) {
      console.error('Failed to update target via API:', err);
      const apiErr = new Error(
        err.response?.data?.error?.message 
        || (err.code === 'ERR_NETWORK' 
          ? 'Unable to connect to backend API server (http://localhost:5000). Please ensure the backend is running.' 
          : err.message)
        || 'Failed to update monitored target'
      );
      apiErr.code = err.response?.data?.error?.code;
      apiErr.details = err.response?.data?.error?.details;
      throw apiErr;
    }
  };

  // Delete target handler (DELETE /api/v1/targets/:id)
  const handleDeleteTarget = async (targetId) => {
    if (!targetId) {
      throw new Error('Target ID is missing');
    }

    try {
      await deleteTarget(targetId);
      setTargets(prev => prev.filter(t => t.id !== Number(targetId)));
      // Silently refresh dashboard summary
      fetchDashboardSummary(true).catch(e => console.error('Dashboard summary refresh error:', e));
      fetchSystemHealth(true).catch(e => console.error('System health refresh error:', e));
      return true;
    } catch (err) {
      console.error('Failed to delete target via API:', err);
      const apiErr = new Error(
        err.response?.data?.error?.message 
        || (err.code === 'ERR_NETWORK' 
          ? 'Unable to connect to backend API server (http://localhost:5000). Please ensure the backend is running.' 
          : err.message)
        || 'Failed to delete monitored target'
      );
      apiErr.code = err.response?.data?.error?.code;
      throw apiErr;
    }
  };

  // Toggle enable/disable (PATCH /api/v1/targets/:id/enabled)
  const handleToggleTarget = async (targetId, nextEnabledState) => {
    if (!targetId) {
      throw new Error('Target ID is missing');
    }

    const currentTarget = targets.find(t => t.id === Number(targetId));
    const targetState = typeof nextEnabledState === 'boolean' 
      ? nextEnabledState 
      : (currentTarget ? !currentTarget.is_enabled : true);

    try {
      const result = await toggleTarget(targetId, targetState);

      setTargets(prev => prev.map(t => {
        if (t.id === Number(targetId)) {
          return {
            ...t,
            is_enabled: result.isEnabled,
            current_status: result.currentStatus,
            latency: result.isEnabled ? t.latency : null,
            response_time_ms: result.isEnabled ? t.response_time_ms : null
          };
        }
        return t;
      }));

      // Silently refresh dashboard summary
      fetchDashboardSummary(true).catch(e => console.error('Dashboard summary refresh error:', e));
      fetchSystemHealth(true).catch(e => console.error('System health refresh error:', e));

      return result;
    } catch (err) {
      console.error('Failed to toggle target enabled status via API:', err);
      const apiErr = new Error(
        err.response?.data?.error?.message 
        || (err.code === 'ERR_NETWORK' 
          ? 'Unable to connect to backend API server (http://localhost:5000). Please ensure the backend is running.' 
          : err.message)
        || 'Failed to update target status'
      );
      apiErr.code = err.response?.data?.error?.code;
      throw apiErr;
    }
  };

  // Manual health check probe (POST /api/v1/targets/:id/check)
  const handleManualCheck = async (targetId) => {
    if (!targetId) {
      throw new Error('Target ID is missing');
    }

    try {
      const outcome = await checkTarget(targetId);

      setTargets(prev => prev.map(t => {
        if (t.id === Number(targetId)) {
          const latencyVal = outcome.result?.responseTimeMs !== undefined
            ? (outcome.result.responseTimeMs !== null ? Number(outcome.result.responseTimeMs) : null)
            : t.latency;

          const updatedSparkline = latencyVal !== null && latencyVal !== undefined
            ? [...(t.history_sparkline || []).slice(-11), latencyVal]
            : (t.history_sparkline || []);

          return {
            ...t,
            current_status: outcome.status || t.current_status,
            latency: latencyVal,
            response_time_ms: latencyVal,
            last_checked_at: new Date().toISOString(),
            history_sparkline: updatedSparkline
          };
        }
        return t;
      }));

      // Silently refresh incident events to reflect any newly generated transition or recovery event
      fetchEvents().catch(e => console.error('Events refresh error:', e));
      // Silently refresh dashboard summary to reflect updated statuses and uptimes
      fetchDashboardSummary(true).catch(e => console.error('Dashboard summary refresh error:', e));

      return outcome;
    } catch (err) {
      console.error('Failed to execute manual check via API:', err);
      const apiErr = new Error(
        err.response?.data?.error?.message 
        || (err.code === 'ERR_NETWORK' 
          ? 'Unable to connect to backend API server (http://localhost:5000). Please ensure the backend is running.' 
          : err.message)
        || 'Manual health check failed'
      );
      apiErr.code = err.response?.data?.error?.code;
      throw apiErr;
    }
  };

  const activeAlertsCount = events.filter(e => !e.is_resolved).length;

  // Lock background scrolling when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [sidebarOpen]);

  return (
    <Router>
      <ScrollToTop />
      <div className="app-container">
        {/* Mobile Backdrop Overlay (Hidden on desktop) */}
        {sidebarOpen && (
          <div 
            className="sidebar-mobile-backdrop lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Navigation Sidebar (Fixed on Desktop, Off-Canvas Drawer on Mobile/Tablet) */}
        <Sidebar 
          targetsCount={dashboardSummary?.totalTargets ?? (isLoadingSummary ? '...' : 0)} 
          activeAlertsCount={dashboardSummary?.activeEvents ?? activeAlertsCount} 
          fleetConformance={dashboardSummary?.overallUptime}
          fleetConformancePercent={dashboardSummary?.overallUptimePercent}
          theme={theme}
          onToggleTheme={toggleTheme}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Work Area */}
        <main className="app-content">
          {/* Top Telemetry Global Header */}
          <TopTelemetryBar
            engineStatus={
              healthError 
                ? 'offline' 
                : (healthData?.engine?.status || (isLoadingHealth ? 'loading' : 'offline'))
            }
            activeProbesCount={healthData?.engine?.activeJobsCount ?? null}
            configuredTargetsCount={dashboardSummary?.totalTargets ?? targets.length}
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenMobileSidebar={() => setSidebarOpen(true)}
          />

          {/* Page Routing with Subtle 200ms Transition */}
          <AnimatedRoutes 
            targets={targets}
            isLoadingTargets={isLoadingTargets}
            targetsError={targetsError}
            onRetryTargets={fetchTargets}
            events={events}
            isLoadingEvents={isLoadingEvents}
            eventsError={eventsError}
            onRetryEvents={fetchEvents}
            summary={dashboardSummary}
            isLoadingSummary={isLoadingSummary}
            summaryError={summaryError}
            onRefreshDashboard={handleRefreshDashboard}
            healthData={healthData}
            isLoadingHealth={isLoadingHealth}
            healthError={healthError}
            onRefreshHealth={() => fetchSystemHealth(false)}
            lastHealthSync={lastHealthSync}
            theme={theme}
            onToggleTheme={toggleTheme}
            onAddTarget={handleAddTarget}
            onUpdateTarget={handleUpdateTarget}
            onDeleteTarget={handleDeleteTarget}
            onToggleTarget={handleToggleTarget}
            onManualCheck={handleManualCheck}
          />
        </main>
      </div>
    </Router>
  );
}

/**
 * AnimatedRoutes Component
 * Manages subtle 200ms fade & minimal Y-shift page transitions on route navigation
 */
function AnimatedRoutes({ 
  targets, 
  isLoadingTargets,
  targetsError,
  onRetryTargets,
  events, 
  isLoadingEvents,
  eventsError,
  onRetryEvents,
  summary,
  isLoadingSummary,
  summaryError,
  onRefreshDashboard,
  healthData,
  isLoadingHealth,
  healthError,
  onRefreshHealth,
  lastHealthSync,
  theme,
  onToggleTheme,
  onAddTarget, 
  onUpdateTarget, 
  onDeleteTarget, 
  onToggleTarget, 
  onManualCheck 
}) {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-view-enter">
      <Routes location={location}>
        <Route 
          path="/" 
          element={
            <Dashboard 
              targets={targets} 
              events={events} 
              summary={summary}
              isLoadingSummary={isLoadingSummary}
              summaryError={summaryError}
              onRefresh={onRefreshDashboard}
              onAddTarget={onAddTarget}
              onUpdateTarget={onUpdateTarget}
            />
          } 
        />
        <Route 
          path="/targets" 
          element={
            <Targets 
              targets={targets} 
              isLoading={isLoadingTargets}
              error={targetsError}
              onRetry={onRetryTargets}
              onAddTarget={onAddTarget}
              onUpdateTarget={onUpdateTarget}
              onDeleteTarget={onDeleteTarget}
              onToggleTarget={onToggleTarget}
              onManualCheck={onManualCheck}
            />
          } 
        />
        <Route 
          path="/targets/:id" 
          element={
            <TargetDetails 
              targets={targets} 
              events={events}
              onUpdateTarget={onUpdateTarget}
              onDeleteTarget={onDeleteTarget}
              onToggleTarget={onToggleTarget}
              onManualCheck={onManualCheck}
            />
          } 
        />
        <Route 
          path="/events" 
          element={
            <Events 
              events={events} 
              isLoading={isLoadingEvents}
              error={eventsError}
              onRetry={onRetryEvents}
            />
          } 
        />
        <Route 
          path="/settings" 
          element={
            <Settings 
              healthData={healthData}
              isLoadingHealth={isLoadingHealth}
              healthError={healthError}
              onRefreshHealth={onRefreshHealth}
              lastSynchronized={lastHealthSync}
              theme={theme}
              onToggleTheme={onToggleTheme}
            />
          } 
        />
      </Routes>
    </div>
  );
}
