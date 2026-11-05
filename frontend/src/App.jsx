import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Targets from './pages/Targets';
import TargetDetails from './pages/TargetDetails';
import Events from './pages/Events';
import { initialTargets, initialEvents } from './data/mockData';
import { Radio, Sun, Moon } from 'lucide-react';
import './index.css';

export default function App() {
  const [targets, setTargets] = useState(initialTargets);
  const [events, setEvents] = useState(initialEvents);

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
        {/* Navigation Sidebar (Always Sticky / Fixed) */}
        <Sidebar 
          targetsCount={targets.length} 
          activeAlertsCount={activeAlertsCount} 
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Main Work Area */}
        <main className="app-content">
          {/* Top Telemetry Global Header */}
          <header className="top-telemetry-bar">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span className="font-semibold text-[var(--text-primary)]">NETWORK MONITOR</span>
              </span>
              <span className="text-[var(--border-subtle)] hidden sm:inline">/</span>
              <span className="text-xs font-medium text-[var(--text-secondary)] hidden sm:inline">
                Enterprise Observability
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                <span className="status-dot" style={{ background: 'var(--status-online)' }} />
                <span className="hidden sm:inline">ENGINE: ONLINE</span>
              </div>
              <div className="h-4 w-px bg-[var(--border-subtle)]" />
              <div className="text-xs font-mono text-[var(--text-muted)]">
                PROBES: <span className="text-[var(--text-primary)] font-semibold">{targets.length}</span>
              </div>
              <div className="h-4 w-px bg-[var(--border-subtle)]" />
              <button
                onClick={toggleTheme}
                className="btn-telemetry btn-icon btn-secondary text-xs"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                )}
              </button>
            </div>
          </header>

          {/* Page Routing */}
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  targets={targets} 
                  events={events} 
                  onAddTarget={handleAddTarget}
                  onUpdateTarget={handleUpdateTarget}
                />
              } 
            />
            <Route 
              path="/targets" 
              element={
                <Targets 
                  targets={targets}
                  onAddTarget={handleAddTarget}
                  onUpdateTarget={handleUpdateTarget}
                  onDeleteTarget={handleDeleteTarget}
                  onToggleTarget={handleToggleTarget}
                  onManualCheck={handleManualCheck}
                />
              } 
            />
            <Route 
              path="/targets/:id" 
              element={
                <TargetDetails 
                  targets={targets}
                  events={events}
                  onUpdateTarget={handleUpdateTarget}
                  onManualCheck={handleManualCheck}
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
        </main>
      </div>
    </Router>
  );
}
