import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Activity, 
  Server, 
  AlertTriangle, 
  Sun, 
  Moon 
} from 'lucide-react';
import NetPulseLogo from './NetPulseLogo';

export default function Sidebar({ 
  targetsCount = 8, 
  activeAlertsCount = 3, 
  theme = 'dark', 
  onToggleTheme
}) {
  const navItems = [
    {
      to: '/',
      label: 'Overview',
      icon: Activity,
      end: true
    },
    {
      to: '/targets',
      label: 'Monitored Targets',
      icon: Server,
      badge: targetsCount
    },
    {
      to: '/events',
      label: 'Event Log',
      icon: AlertTriangle,
      badge: activeAlertsCount,
      badgeStyle: 'text-[var(--status-critical)] bg-[var(--status-critical-bg)] border-[var(--status-critical-border)]'
    }
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="brand-badge">
        <NetPulseLogo variant="horizontal" size="sm" showTagline={true} />
      </div>

      {/* Navigation Section */}
      <nav className="flex flex-col gap-1 py-1">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeStyle || 'text-[var(--text-secondary)] bg-[var(--bg-elevated)] border-[var(--border-subtle)]'}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Status Tile */}
      <div className="mt-6 p-3 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Fleet Conformance
          </span>
          <span className="text-[11px] font-mono font-bold text-[var(--status-online)]">
            99.42%
          </span>
        </div>
        <div className="w-full bg-[var(--bg-elevated)] h-1.5 rounded-full overflow-hidden">
          <div className="bg-[var(--status-online)] h-full rounded-full" style={{ width: '99.42%' }} />
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-[var(--text-muted)] font-mono">
          <span>8 Monitored</span>
          <span className="text-[var(--status-online)] flex items-center gap-1">
            <span className="status-dot" style={{ background: 'var(--status-online)' }} />
            Active
          </span>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <button
          onClick={onToggleTheme}
          className="btn-telemetry btn-secondary w-full justify-center gap-2 text-xs"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
        <div className="text-[10px] text-[var(--text-muted)] text-center font-mono">
          NetPulse v1.0 • Enterprise Telemetry
        </div>
      </div>
    </aside>
  );
}
