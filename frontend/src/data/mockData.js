// ============================================================
// Mock Data for NetPulse — Network Monitoring & Performance Intelligence
// Frontend Prototype – fully internally consistent sample data
// ============================================================

export const TARGETS = [
  {
    id: 1,
    name: 'Production API',
    target_type: 'http_service',
    address: 'https://api.prod.internal/health',
    check_method: 'http',
    check_interval_seconds: 30,
    warning_threshold_ms: 300,
    critical_threshold_ms: 800,
    timeout_seconds: 5,
    is_enabled: true,
    current_status: 'online',
    response_time_ms: 85,
    latency: 85,
    uptime_percentage: '99.94%',
    last_checked_at: new Date(Date.now() - 18 * 1000).toISOString(),
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    history_sparkline: [78, 82, 85, 90, 84, 86, 88, 82, 85, 87, 85, 84]
  },
  {
    id: 2,
    name: 'Main Website',
    target_type: 'website',
    address: 'https://www.company.io',
    check_method: 'http',
    check_interval_seconds: 60,
    warning_threshold_ms: 500,
    critical_threshold_ms: 1200,
    timeout_seconds: 8,
    is_enabled: true,
    current_status: 'online',
    response_time_ms: 42,
    latency: 42,
    uptime_percentage: '99.98%',
    last_checked_at: new Date(Date.now() - 5 * 1000).toISOString(),
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    history_sparkline: [38, 45, 41, 40, 44, 43, 39, 42, 46, 41, 42, 42]
  },
  {
    id: 3,
    name: 'Database Server',
    target_type: 'host',
    address: '10.0.1.15',
    check_method: 'icmp',
    check_interval_seconds: 15,
    warning_threshold_ms: 50,
    critical_threshold_ms: 150,
    timeout_seconds: 3,
    is_enabled: true,
    current_status: 'warning',
    response_time_ms: 180,
    latency: 180,
    uptime_percentage: '97.82%',
    last_checked_at: new Date(Date.now() - 10 * 1000).toISOString(),
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    history_sparkline: [48, 52, 65, 88, 120, 145, 160, 175, 185, 180, 178, 180]
  },
  {
    id: 4,
    name: 'Authentication Service',
    target_type: 'http_service',
    address: 'https://auth.internal/ping',
    check_method: 'http',
    check_interval_seconds: 30,
    warning_threshold_ms: 200,
    critical_threshold_ms: 600,
    timeout_seconds: 5,
    is_enabled: true,
    current_status: 'online',
    response_time_ms: 65,
    latency: 65,
    uptime_percentage: '99.91%',
    last_checked_at: new Date(Date.now() - 22 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    history_sparkline: [62, 66, 64, 68, 65, 63, 67, 64, 66, 65, 64, 65]
  },
  {
    id: 5,
    name: 'Payment Gateway',
    target_type: 'http_service',
    address: 'https://pay.external-vendor.com/status',
    check_method: 'http',
    check_interval_seconds: 60,
    warning_threshold_ms: 400,
    critical_threshold_ms: 1000,
    timeout_seconds: 10,
    is_enabled: true,
    current_status: 'critical',
    response_time_ms: 1140,
    latency: 1140,
    uptime_percentage: '94.50%',
    last_checked_at: new Date(Date.now() - 55 * 1000).toISOString(),
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    history_sparkline: [380, 520, 710, 890, 1020, 1180, 1140, 1150, 1130, 1140]
  },
  {
    id: 6,
    name: 'CDN Edge Endpoint',
    target_type: 'http_service',
    address: 'https://cdn.company.io/health',
    check_method: 'http',
    check_interval_seconds: 60,
    warning_threshold_ms: 100,
    critical_threshold_ms: 300,
    timeout_seconds: 5,
    is_enabled: true,
    current_status: 'online',
    response_time_ms: 28,
    latency: 28,
    uptime_percentage: '100.00%',
    last_checked_at: new Date(Date.now() - 8 * 1000).toISOString(),
    created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    history_sparkline: [26, 28, 27, 29, 28, 27, 30, 28, 27, 28, 28, 28]
  },
  {
    id: 7,
    name: 'Legacy ERP System',
    target_type: 'host',
    address: '192.168.1.100',
    check_method: 'icmp',
    check_interval_seconds: 120,
    warning_threshold_ms: 100,
    critical_threshold_ms: 300,
    timeout_seconds: 5,
    is_enabled: false,
    current_status: 'disabled',
    response_time_ms: null,
    latency: null,
    uptime_percentage: '88.20%',
    last_checked_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    history_sparkline: []
  },
  {
    id: 8,
    name: 'Staging API Cluster',
    target_type: 'http_service',
    address: 'https://api.staging.internal/health',
    check_method: 'http',
    check_interval_seconds: 60,
    warning_threshold_ms: 500,
    critical_threshold_ms: 1500,
    timeout_seconds: 10,
    is_enabled: true,
    current_status: 'offline',
    response_time_ms: null,
    latency: null,
    uptime_percentage: '91.30%',
    last_checked_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    history_sparkline: [65, 70, 72, null, null, null, null, null]
  }
];

export const initialTargets = TARGETS;

// ─────────────────────────────────────────────────────────────
// 2. DASHBOARD STATS
// ─────────────────────────────────────────────────────────────
export const DASHBOARD_STATS = {
  totalTargets: 8,
  online: 4,
  offline: 1,
  warning: 1,
  critical: 1,
  disabled: 1,
  overallUptime: '99.42%',
  avgResponseTime: 55,
  activeIncidents: 3
};

export const summaryMetrics = DASHBOARD_STATS;

// ─────────────────────────────────────────────────────────────
// 3. EVENTS
// ─────────────────────────────────────────────────────────────
export const EVENTS = [
  {
    id: 101,
    target_id: 5,
    target_name: 'Payment Gateway',
    target_address: 'https://pay.external-vendor.com/status',
    event_type: 'critical',
    severity: 'critical',
    description: 'Response time 1140 ms exceeded critical threshold (1000 ms)',
    occurred_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    resolved_at: null,
    is_resolved: false
  },
  {
    id: 102,
    target_id: 8,
    target_name: 'Staging API Cluster',
    target_address: 'https://api.staging.internal/health',
    event_type: 'offline',
    severity: 'critical',
    description: 'Target unreachable: Connection refused (HTTP 502 Bad Gateway)',
    occurred_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    resolved_at: null,
    is_resolved: false
  },
  {
    id: 103,
    target_id: 3,
    target_name: 'Database Server',
    target_address: '10.0.1.15',
    event_type: 'warning',
    severity: 'warning',
    description: 'ICMP round-trip latency 180 ms exceeded warning threshold (50 ms)',
    occurred_at: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    resolved_at: null,
    is_resolved: false
  },
  {
    id: 104,
    target_id: 8,
    target_name: 'Staging API Cluster',
    target_address: 'https://api.staging.internal/health',
    event_type: 'repeated_failure',
    severity: 'critical',
    description: '3 consecutive check probe cycles timed out across 180 seconds',
    occurred_at: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    resolved_at: null,
    is_resolved: false
  },
  {
    id: 105,
    target_id: 2,
    target_name: 'Main Website',
    target_address: 'https://www.company.io',
    event_type: 'recovery',
    severity: 'info',
    description: 'Service recovered: HTTP response latency stabilized at 42 ms',
    occurred_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    is_resolved: true
  },
  {
    id: 106,
    target_id: 2,
    target_name: 'Main Website',
    target_address: 'https://www.company.io',
    event_type: 'warning',
    severity: 'warning',
    description: 'Response time spiked to 540 ms exceeding warning threshold (500 ms)',
    occurred_at: new Date(Date.now() - 125 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    is_resolved: true
  },
  {
    id: 107,
    target_id: 1,
    target_name: 'Production API',
    target_address: 'https://api.prod.internal/health',
    event_type: 'recovery',
    severity: 'info',
    description: 'Target health confirmed: All probes returning HTTP 200 OK (85 ms)',
    occurred_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    is_resolved: true
  },
  {
    id: 108,
    target_id: 4,
    target_name: 'Authentication Service',
    target_address: 'https://auth.internal/ping',
    event_type: 'warning',
    severity: 'warning',
    description: 'Response time 215 ms crossed warning threshold (200 ms) during traffic peak',
    occurred_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    is_resolved: true
  }
];

export const initialEvents = EVENTS;

// ─────────────────────────────────────────────────────────────
// 4. HISTORICAL GENERATORS
// ─────────────────────────────────────────────────────────────
export function generateResponseHistory(targetId, points = 32) {
  const target = TARGETS.find(t => t.id === targetId) || TARGETS[0];
  const list = [];
  const now = Date.now();
  const step = (target.check_interval_seconds || 60) * 1000;
  const base = target.response_time_ms || target.latency || (target.current_status === 'offline' ? 0 : 50);

  for (let i = points - 1; i >= 0; i--) {
    const timeStr = new Date(now - i * step).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let val = null;
    let avail = true;
    let stat = 'online';

    if (target.current_status === 'offline' && i < 6) {
      val = null;
      avail = false;
      stat = 'offline';
    } else if (target.current_status === 'critical' && i < 8) {
      val = Math.round(target.critical_threshold_ms * 1.15 + (Math.random() * 40));
      stat = 'critical';
    } else if (target.current_status === 'warning') {
      const slope = (points - 1 - i) / points;
      val = Math.round(target.warning_threshold_ms * (0.8 + slope * 0.5));
      stat = val >= target.critical_threshold_ms ? 'critical' : val >= target.warning_threshold_ms ? 'warning' : 'online';
    } else if (target.current_status === 'disabled') {
      val = null;
      avail = false;
      stat = 'disabled';
    } else {
      const jitter = (Math.sin(i * 0.8) * 0.2 + (Math.random() * 0.15 - 0.07));
      val = Math.max(12, Math.round(base * (1 + jitter)));
      stat = 'online';
    }

    list.push({
      time: timeStr,
      latency: val,
      available: avail,
      status: stat,
      timestamp: new Date(now - i * step).toISOString()
    });
  }
  return list;
}

export function generateTimeSeries(target) {
  return generateResponseHistory(target?.id, 32);
}

export function generateAvailabilityHistory(targetId, days = 30) {
  const result = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
    const jitter = Math.random() > 0.85 ? (Math.random() * 2) : 0;
    const uptime = Math.max(92, Math.min(100, +(100 - jitter).toFixed(2)));
    result.push({ date: dateStr, uptime });
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// 5. CHECK HISTORY (FOR TARGET DETAILS)
// ─────────────────────────────────────────────────────────────
function makeChecks(target, count = 15) {
  const records = [];
  const now = Date.now();
  const step = (target.check_interval_seconds || 60) * 1000;
  const base = target.response_time_ms || target.latency || 45;

  for (let i = 0; i < count; i++) {
    const checkedAt = new Date(now - i * step).toISOString();
    const isRecent = i < 3;

    if (target.current_status === 'offline' && isRecent) {
      records.push({
        id: target.id * 1000 + i,
        checked_at: checkedAt,
        is_available: false,
        response_time_ms: null,
        http_status_code: 502,
        result_status: 'offline',
        error_message: 'Connection refused: HTTP 502 Bad Gateway'
      });
    } else if (target.current_status === 'critical' && isRecent) {
      records.push({
        id: target.id * 1000 + i,
        checked_at: checkedAt,
        is_available: false,
        response_time_ms: 1140,
        http_status_code: 504,
        result_status: 'critical',
        error_message: 'Response threshold exceeded (1140 ms > 1000 ms)'
      });
    } else if (target.current_status === 'warning' && isRecent) {
      records.push({
        id: target.id * 1000 + i,
        checked_at: checkedAt,
        is_available: true,
        response_time_ms: 180,
        http_status_code: target.check_method === 'http' ? 200 : null,
        result_status: 'warning',
        error_message: 'High latency threshold breach (180 ms > 50 ms)'
      });
    } else if (target.current_status === 'disabled') {
      records.push({
        id: target.id * 1000 + i,
        checked_at: checkedAt,
        is_available: false,
        response_time_ms: null,
        http_status_code: null,
        result_status: 'disabled',
        error_message: 'Monitoring paused by operator'
      });
    } else {
      const rt = Math.max(8, Math.round(base + (Math.sin(i) * 6)));
      records.push({
        id: target.id * 1000 + i,
        checked_at: checkedAt,
        is_available: true,
        response_time_ms: rt,
        http_status_code: target.check_method === 'http' ? 200 : null,
        result_status: 'online',
        error_message: null
      });
    }
  }
  return records;
}

export const CHECK_HISTORY = TARGETS.reduce((acc, t) => {
  acc[t.id] = makeChecks(t, 15);
  return acc;
}, {});
