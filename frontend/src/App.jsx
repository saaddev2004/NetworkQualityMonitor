import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopTelemetryBar from './components/layout/TopTelemetryBar';
import Dashboard from './pages/Dashboard';
import Targets from './pages/Targets';
import TargetDetails from './pages/TargetDetails';
import Events from './pages/Events';
import { initialTargets, initialEvents } from './data/mockData';
import './index.css';

/**
 * Root Application Component
 * Coordinates routing, telemetry data state, responsive drawer overlay, and Light/Dark theme switching
 */
export default function App() {
  const [targets, setTargets] = useState(initialTargets);
  const [events, setEvents] = useState(initialEvents);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Add target handler
  const handleAddTarget = (newTarget) => {
    const nextId = targets.length > 0 ? Math.max(...targets.map(t => t.id)) + 1 : 1;
    const isEnabled = newTarget.is_enabled !== undefined ? newTarget.is_enabled : true;
    const initialLatency = isEnabled ? Math.floor(Math.random() * 35 + 25) : null;

    const formatted = {
      ...newTarget,
      id: nextId,
      is_enabled: isEnabled,
      current_status: isEnabled ? 'online' : 'disabled',
      latency: initialLatency,
      response_time_ms: initialLatency,
      uptime_percentage: '100.00%',
      last_checked_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      history_sparkline: isEnabled ? [24, 28, 25, 30, 26, initialLatency] : []
    };
    setTargets(prev => [formatted, ...prev]);
  };

  // Update target handler
  const handleUpdateTarget = (updatedTarget) => {
    setTargets(prev => prev.map(t => (t.id === updatedTarget.id ? { ...t, ...updatedTarget } : t)));
  };

  // Delete target handler
  const handleDeleteTarget = (targetId) => {
    setTargets(prev => prev.filter(t => t.id !== targetId));
  };

  // Toggle enable/disable
  const handleToggleTarget = (targetId) => {
    setTargets(prev => prev.map(t => {
      if (t.id === targetId) {
        const nextState = !t.is_enabled;
        return {
          ...t,
          is_enabled: nextState,
          current_status: nextState ? 'online' : 'disabled',
          latency: nextState ? (t.latency || 45) : null,
          response_time_ms: nextState ? (t.response_time_ms || 45) : null
        };
      }
      return t;
    }));
  };

  // Simulate manual check probe
  const handleManualCheck = (targetId) => {
    setTargets(prev => prev.map(t => {
      if (t.id === targetId) {
        let newLatency = t.latency;
        let newStatus = t.current_status;

        if (t.current_status !== 'offline') {
          const jitter = Math.floor(Math.random() * 14 - 7);
          newLatency = Math.max(8, (t.latency || 45) + jitter);
          if (newLatency >= t.critical_threshold_ms) newStatus = 'critical';
          else if (newLatency >= t.warning_threshold_ms) newStatus = 'warning';
          else newStatus = 'online';
        }

        const updatedSparkline = [...(t.history_sparkline || []), newLatency].slice(-14);

        return {
          ...t,
          latency: newLatency,
          response_time_ms: newLatency,
          current_status: newStatus,
          last_checked_at: new Date().toISOString(),
          history_sparkline: updatedSparkline
        };
      }
      return t;
    }));
  };

  const activeAlertsCount = events.filter(e => !e.is_resolved).length;

  return (
    <Router>
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
          targetsCount={targets.length} 
          activeAlertsCount={activeAlertsCount} 
          theme={theme}
          onToggleTheme={toggleTheme}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Work Area */}
        <main className="app-content">
          {/* Top Telemetry Global Header */}
          <TopTelemetryBar
            probesCount={targets.length}
            isEngineOnline={true}
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenMobileSidebar={() => setSidebarOpen(true)}
          />

          {/* Page Routing with Subtle 200ms Transition */}
          <AnimatedRoutes 
            targets={targets}
            events={events}
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
  events, 
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
              onManualCheck={onManualCheck}
            />
          } 
        />
        <Route 
          path="/events" 
          element={
            <Events 
              events={events} 
            />
          } 
        />
      </Routes>
    </div>
  );
}
