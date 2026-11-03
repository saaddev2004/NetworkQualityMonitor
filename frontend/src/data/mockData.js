// Realistic sample data for the Obsidian Telemetry visual prototype
export const initialTargets = [
  {
    id: 1,
    name: 'Primary API Gateway',
    target_type: 'http_service',
    address: 'https://api.internal.network/v1/health',
    check_method: 'http',
    check_interval_seconds: 30,
    warning_threshold_ms: 150,
    critical_threshold_ms: 400,
    timeout_seconds: 5,
    is_enabled: 1,
    current_status: 'online',
    latency: 38,
    uptime_percentage: '99.94%',
    last_checked_at: new Date(Date.now() - 12000).toISOString(),
    created_at: '2026-10-15T10:00:00.000Z',
    history_sparkline: [35, 42, 38, 40, 37, 36, 44, 39, 41, 38, 37, 40, 39, 38, 42]
  },
  {
    id: 2,
    name: 'Student Portal & LMS',
    target_type: 'website',
    address: 'https://portal.uni.edu.pk',
    check_method: 'http',
    check_interval_seconds: 60,
    warning_threshold_ms: 500,
    critical_threshold_ms: 1000,
    timeout_seconds: 5,
    is_enabled: 1,
    current_status: 'online',
    latency: 184,
    uptime_percentage: '99.82%',
    last_checked_at: new Date(Date.now() - 25000).toISOString(),
    created_at: '2026-10-16T11:20:00.000Z',
    history_sparkline: [170, 185, 192, 178, 180, 210, 195, 182, 188, 179, 184]
  },
  {
    id: 3,
    name: 'Library Search API',
    target_type: 'http_service',
    address: 'https://lib.uni.edu.pk/api/catalog',
    check_method: 'http',
    check_interval_seconds: 60,
    warning_threshold_ms: 500,
    critical_threshold_ms: 1000,
    timeout_seconds: 5,
    is_enabled: 1,
    current_status: 'warning',
    latency: 642,
    uptime_percentage: '98.40%',
    last_checked_at: new Date(Date.now() - 45000).toISOString(),
    created_at: '2026-10-18T14:15:00.000Z',
    history_sparkline: [320, 380, 450, 510, 580, 620, 650, 642, 610, 642]
  },
  {
    id: 4,
    name: 'Core Edge Router SJC-01',
    target_type: 'host',
    address: '10.0.0.1',
    check_method: 'icmp',
    check_interval_seconds: 15,
    warning_threshold_ms: 25,
    critical_threshold_ms: 80,
    timeout_seconds: 2,
    is_enabled: 1,
    current_status: 'online',
    latency: 4.2,
    uptime_percentage: '99.99%',
    last_checked_at: new Date(Date.now() - 8000).toISOString(),
    created_at: '2026-10-12T08:00:00.000Z',
    history_sparkline: [4.1, 4.3, 4.0, 4.2, 4.5, 4.1, 4.2, 4.4, 4.1, 4.2]
  },
  {
    id: 5,
    name: 'PostgreSQL Secondary Cluster',
    target_type: 'host',
    address: 'db-replica.internal.net',
    check_method: 'icmp',
    check_interval_seconds: 30,
    warning_threshold_ms: 100,
    critical_threshold_ms: 300,
    timeout_seconds: 3,
    is_enabled: 1,
    current_status: 'offline',
    latency: null,
    uptime_percentage: '91.20%',
    last_checked_at: new Date(Date.now() - 55000).toISOString(),
    created_at: '2026-10-20T16:30:00.000Z',
    history_sparkline: [45, 52, 60, null, null, null, null, null]
  },
  {
    id: 6,
    name: 'Mail Relay Gateway',
    target_type: 'http_service',
    address: 'https://mail.uni.edu.pk/health',
    check_method: 'http',
    check_interval_seconds: 120,
    warning_threshold_ms: 400,
    critical_threshold_ms: 900,
    timeout_seconds: 5,
    is_enabled: 1,
    current_status: 'critical',
    latency: 1140,
    uptime_percentage: '96.50%',
    last_checked_at: new Date(Date.now() - 110000).toISOString(),
    created_at: '2026-10-22T09:40:00.000Z',
    history_sparkline: [380, 520, 710, 890, 1020, 1180, 1140]
  },
  {
    id: 7,
    name: 'Legacy Documentation Archive',
    target_type: 'website',
    address: 'http://wiki-legacy.uni.edu.pk',
    check_method: 'http',
    check_interval_seconds: 300,
    warning_threshold_ms: 600,
    critical_threshold_ms: 1200,
    timeout_seconds: 5,
    is_enabled: 0,
    current_status: 'disabled',
    latency: null,
    uptime_percentage: '88.10%',
    last_checked_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    created_at: '2026-09-01T12:00:00.000Z',
    history_sparkline: []
  }
];

export const initialEvents = [
  {
    id: 101,
    target_id: 5,
    target_name: 'PostgreSQL Secondary Cluster',
    target_address: 'db-replica.internal.net',
    event_type: 'offline',
    severity: 'critical',
    description: 'Target unreachable: ICMP ping timeout after 3000ms',
    occurred_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    resolved_at: null,
    is_resolved: 0
  },
  {
    id: 102,
    target_id: 5,
    target_name: 'PostgreSQL Secondary Cluster',
    target_address: 'db-replica.internal.net',
    event_type: 'repeated_failure',
    severity: 'critical',
    description: '3 consecutive check cycles failed across 90 seconds',
    occurred_at: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
    resolved_at: null,
    is_resolved: 0
  },
  {
    id: 103,
    target_id: 6,
    target_name: 'Mail Relay Gateway',
    target_address: 'https://mail.uni.edu.pk/health',
    event_type: 'critical',
    severity: 'critical',
    description: 'Response time 1140 ms exceeded critical threshold 900 ms',
    occurred_at: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    resolved_at: null,
    is_resolved: 0
  },
  {
    id: 104,
    target_id: 3,
    target_name: 'Library Search API',
    target_address: 'https://lib.uni.edu.pk/api/catalog',
    event_type: 'warning',
    severity: 'warning',
    description: 'Response time 642 ms exceeded warning threshold 500 ms',
    occurred_at: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    resolved_at: null,
    is_resolved: 0
  },
  {
    id: 105,
    target_id: 2,
    target_name: 'Student Portal & LMS',
    target_address: 'https://portal.uni.edu.pk',
    event_type: 'recovery',
    severity: 'info',
    description: 'Target state recovered: latest check online (184 ms)',
    occurred_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    resolved_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    is_resolved: 1
  },
  {
    id: 106,
    target_id: 4,
    target_name: 'Core Edge Router SJC-01',
    target_address: '10.0.0.1',
    event_type: 'warning',
    severity: 'warning',
    description: 'Response time 32 ms briefly crossed warning threshold 25 ms',
    occurred_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    resolved_at: new Date(Date.now() - 1000 * 60 * 350).toISOString(),
    is_resolved: 1
  }
];

export const summaryMetrics = {
  totalTargets: 7,
  onlineTargets: 3,
  warningTargets: 1,
  criticalTargets: 1,
  offlineTargets: 1,
  disabledTargets: 1,
  overallUptime: '99.42%',
  activeEvents: 3
};

// Generates 30 realistic time-series check points for Target Details chart
export function generateTimeSeries(target) {
  const points = [];
  const count = 32;
  const now = Date.now();
  const step = (target.check_interval_seconds || 60) * 1000;
  const baseLat = target.latency || (target.current_status === 'offline' ? 0 : 180);

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * step).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let value = null;
    let isAvail = true;
    let resultStatus = 'online';

    if (target.current_status === 'offline' && i < 6) {
      value = null;
      isAvail = false;
      resultStatus = 'offline';
    } else {
      const jitter = (Math.sin(i * 0.7) * 0.25 + (Math.random() * 0.2 - 0.1));
      value = Math.max(12, Math.round(baseLat * (1 + jitter)));
      if (value >= target.critical_threshold_ms) resultStatus = 'critical';
      else if (value >= target.warning_threshold_ms) resultStatus = 'warning';
    }

    points.push({
      time: timestamp,
      rawTime: new Date(now - i * step).toISOString(),
      latency: value,
      isAvailable: isAvail,
      status: resultStatus,
      httpCode: isAvail && target.check_method === 'http' ? 200 : isAvail ? null : null,
      error: !isAvail ? 'Connection timed out (Host unreachable)' : null
    });
  }
  return points;
}
