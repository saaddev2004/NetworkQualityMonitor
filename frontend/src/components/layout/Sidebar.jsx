import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Activity, 
  Server, 
  AlertTriangle, 
  Sun, 
  Moon,
  X 
} from 'lucide-react';
import NetPulseLogo from '../NetPulseLogo';

export default function Sidebar({ 
  targetsCount = 0, 
  activeAlertsCount = 0, 
  fleetConformance = null,
  fleetConformancePercent = null,
  theme = 'dark', 
  onToggleTheme,
  isOpen = false,
  onClose
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

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className={`app-sidebar ${isOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="brand-badge flex items-center justify-between">
        <NetPulseLogo variant="horizontal" size="md" showTagline={false} />
        {/* Mobile Close Button (Hidden on desktop) */}
        <button
          type="button"
          onClick={onClose}
          className="btn-telemetry btn-icon btn-secondary lg:hidden ml-auto"
          aria-label="Close navigation menu"
        >
          <X className="w-4 h-4" />
        </button>
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
              onClick={handleNavClick}
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
            Fleet Conformance (24h)
          </span>
          <span className="text-[11px] font-mono font-bold text-[var(--status-online)]">
            {fleetConformance || 'N/A'}
          </span>
        </div>
        <div className="w-full bg-[var(--bg-elevated)] h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-[var(--status-online)] h-full rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(100, Math.max(0, fleetConformancePercent ?? 0))}%` }} 
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-[var(--text-muted)] font-mono">
          <span>{targetsCount !== null && targetsCount !== undefined ? `${targetsCount} Monitored` : '...'}</span>
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
