import React, { useState } from 'react';
import { 
  Activity, 
  Server, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Plus, 
  ShieldCheck, 
  Cpu
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('all');

  const stats = [
    { label: 'Total Monitored', count: 12, icon: Server, color: 'text-pr', bg: 'bg-blue-50' },
    { label: 'Online / Healthy', count: 9, icon: CheckCircle2, color: 'text-ok', bg: 'bg-okb' },
    { label: 'Warning State', count: 2, icon: AlertTriangle, color: 'text-wa', bg: 'bg-wab' },
    { label: 'Critical / Offline', count: 1, icon: XCircle, color: 'text-of', bg: 'bg-ofb' },
  ];

  const targets = [
    {
      id: 1,
      name: 'Primary API Gateway',
      type: 'http_service',
      address: 'https://api.internal.network/v1/health',
      method: 'HTTP',
      interval: '30s',
      latency: '42ms',
      status: 'online',
      statusClass: 'bg-okb text-ok',
      lastCheck: 'Just now'
    },
    {
      id: 2,
      name: 'Public Website Portal',
      type: 'website',
      address: 'https://network-monitor.org',
      method: 'HTTP',
      interval: '60s',
      latency: '148ms',
      status: 'online',
      statusClass: 'bg-okb text-ok',
      lastCheck: '30s ago'
    },
    {
      id: 3,
      name: 'Database Cluster Host (Primary)',
      type: 'host',
      address: '192.168.1.105',
      method: 'ICMP',
      interval: '15s',
      latency: '680ms',
      status: 'warning',
      statusClass: 'bg-wab text-wa',
      lastCheck: '12s ago'
    },
    {
      id: 4,
      name: 'Legacy Backup Server',
      type: 'host',
      address: '10.0.0.42',
      method: 'ICMP',
      interval: '60s',
      latency: 'Timeout',
      status: 'offline',
      statusClass: 'bg-ofb text-of',
      lastCheck: '2m ago'
    }
  ];

  return (
    <div className="min-h-screen bg-bg text-tx flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-nav border-b border-nav2 text-sf px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pr rounded-lg text-white">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Network Quality Monitor
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-pr/20 text-blue-300 border border-pr/40">
                v1.0.0
              </span>
            </h1>
            <p className="text-xs text-gray-400">Real-time target uptime & latency tracking</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-nav2 hover:bg-slate-700 text-gray-200 transition-colors border border-gray-700">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md bg-pr hover:bg-blue-700 text-white shadow-sm transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Add Target
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* System Summary Card */}
        <div className="bg-sf border border-bd rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-tx">System Overview</h2>
            <p className="text-sm text-mu">
              React + Tailwind CSS setup is complete and operational. All custom color tokens are active.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-ok bg-okb px-3 py-1.5 rounded-full border border-green-300 w-fit">
            <ShieldCheck className="w-4 h-4" />
            Monitoring Engine Connected
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-sf border border-bd rounded-xl p-5 shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-mu uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-black mt-1 text-tx">{stat.count}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Monitored Targets List */}
        <div className="bg-sf border border-bd rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-bd flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
            <div>
              <h3 className="font-bold text-tx">Monitored Targets</h3>
              <p className="text-xs text-mu">HTTP endpoints, ping hosts, and websites</p>
            </div>

            <div className="flex gap-2">
              {['all', 'online', 'warning', 'offline'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs capitalize font-medium px-3 py-1 rounded-md transition-colors ${
                    activeTab === tab
                      ? 'bg-pr text-white'
                      : 'bg-white text-mu border border-bd hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-mu text-xs uppercase font-semibold border-b border-bd">
                <tr>
                  <th className="px-6 py-3">Target</th>
                  <th className="px-6 py-3">Type & Address</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Interval</th>
                  <th className="px-6 py-3">Latency</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bd">
                {targets
                  .filter((t) => activeTab === 'all' || t.status === activeTab)
                  .map((target) => (
                    <tr key={target.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 font-semibold text-tx">
                        <div className="flex items-center gap-2">
                          {target.type === 'website' && <Globe className="w-4 h-4 text-pr" />}
                          {target.type === 'http_service' && <Activity className="w-4 h-4 text-purple-600" />}
                          {target.type === 'host' && <Cpu className="w-4 h-4 text-emerald-600" />}
                          <span>{target.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-mu">
                        {target.address}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {target.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-mu">
                        {target.interval}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono font-bold">
                        {target.latency}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 ${target.statusClass}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {target.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-mu border-t border-bd bg-sf">
        Network Quality Monitor &copy; 2026 &bull; React + Tailwind CSS Dashboard
      </footer>
    </div>
  );
}

