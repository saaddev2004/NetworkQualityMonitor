import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Server, ArrowLeft } from 'lucide-react';
import TargetDetailsHeader from '../components/target-details/TargetDetailsHeader';
import TargetMetricsStrip from '../components/target-details/TargetMetricsStrip';
import TargetResponseChartCard from '../components/target-details/TargetResponseChartCard';
import TargetAvailabilityBar from '../components/target-details/TargetAvailabilityBar';
import TargetConfigCard from '../components/target-details/TargetConfigCard';
import RecentProbesTable from '../components/target-details/RecentProbesTable';
import TargetDrawer from '../components/TargetDrawer';
import ToastNotification from '../components/common/ToastNotification';
import { getTargetHistory, getTargetUptime } from '../services/targetService';
import { getMonitoringHistory } from '../services/historyService';
import { exportProbeResultsReport } from '../services/reportService';

/**
 * TargetDetails Page
 * Deep-dive diagnostic page providing telemetry waveforms, 30-day availability blocks,
 * configuration audit, and probe history log for a single endpoint.
 */
export default function TargetDetails({ targets = [], events = [], onUpdateTarget, onDeleteTarget, onToggleTarget, onManualCheck }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const targetId = parseInt(id, 10);

  const target = targets.find(t => t.id === targetId);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [chartRange, setChartRange] = useState('24h');

  // Live probe history state
  const [historyLogs, setHistoryLogs] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isExportingResults, setIsExportingResults] = useState(false);

  // Live uptime SLA state
  const [uptimeData, setUptimeData] = useState(null);
  const [isLoadingUptime, setIsLoadingUptime] = useState(true);
  const [uptimeError, setUptimeError] = useState(null);

  // Live chart response-time history state
  const [chartPoints, setChartPoints] = useState([]);
  const [chartMetrics, setChartMetrics] = useState({ avgLatency: null, minLatency: null, maxLatency: null });
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [chartError, setChartError] = useState(null);

  // Fetch initial history with cancellation guard to prevent stale overwrites
  const loadInitialHistory = useCallback(async (silent = false) => {
    if (!targetId || isNaN(targetId)) return;
    if (!silent) {
      setIsLoadingHistory(true);
      setHistoryError(null);
    }
    try {
      const data = await getTargetHistory(targetId, { limit: 20, page: 1 });
      setHistoryLogs(data);
      setHasMoreHistory(data.length === 20);
    } catch (err) {
      console.error('Failed to fetch probe history:', err);
      const errMsg = err.response?.data?.error?.message 
        || (err.code === 'ERR_NETWORK' 
          ? 'Unable to connect to backend API server. Please ensure the backend is running.' 
          : err.message)
        || 'Failed to load probe history';
      if (!silent) {
        setHistoryError(errMsg);
        setHistoryLogs([]);
      }
    } finally {
      if (!silent) {
        setIsLoadingHistory(false);
      }
    }
  }, [targetId]);

  // Fetch uptime SLA statistics
  const loadUptime = useCallback(async (silent = false) => {
    if (!targetId || isNaN(targetId)) return;
    if (!silent) {
      setIsLoadingUptime(true);
      setUptimeError(null);
    }
    try {
      const data = await getTargetUptime(targetId);
      setUptimeData(data);
    } catch (err) {
      console.error('Failed to fetch target uptime:', err);
      const errMsg = err.response?.data?.error?.message 
        || (err.code === 'ERR_NETWORK' 
          ? 'Unable to connect to backend API server. Please ensure the backend is running.' 
          : err.message)
        || 'Failed to load uptime statistics';
      if (!silent) {
        setUptimeError(errMsg);
        setUptimeData(null);
      }
    } finally {
      if (!silent) {
        setIsLoadingUptime(false);
      }
    }
  }, [targetId]);

  // Load next page of probe history
  const loadMoreHistory = async () => {
    if (isLoadingMore || !hasMoreHistory || !targetId) return;
    setIsLoadingMore(true);
    try {
      const nextPage = Math.floor(historyLogs.length / 20) + 1;
      const data = await getTargetHistory(targetId, { limit: 20, page: nextPage });
      setHistoryLogs(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newUnique = data.filter(p => !existingIds.has(p.id));
        return [...prev, ...newUnique];
      });
      setHasMoreHistory(data.length === 20);
    } catch (err) {
      console.error('Failed to load more probe history:', err);
      showToast('Failed to load older probe cycles');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Fetch history and uptime when targetId changes
  useEffect(() => {
    let isCancelled = false;

    // 1. Load History
    setIsLoadingHistory(true);
    setHistoryError(null);
    setHistoryLogs([]);

    getTargetHistory(targetId, { limit: 20, page: 1 })
      .then((data) => {
        if (!isCancelled) {
          setHistoryLogs(data);
          setHasMoreHistory(data.length === 20);
          setIsLoadingHistory(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Failed to fetch probe history:', err);
          const errMsg = err.response?.data?.error?.message 
            || (err.code === 'ERR_NETWORK' 
              ? 'Unable to connect to backend API server. Please ensure the backend is running.' 
              : err.message)
            || 'Failed to load probe history';
          setHistoryError(errMsg);
          setHistoryLogs([]);
          setIsLoadingHistory(false);
        }
      });

    // 2. Load Uptime SLA
    setIsLoadingUptime(true);
    setUptimeError(null);
    setUptimeData(null);

    getTargetUptime(targetId)
      .then((data) => {
        if (!isCancelled) {
          setUptimeData(data);
          setIsLoadingUptime(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Failed to fetch target uptime:', err);
          const errMsg = err.response?.data?.error?.message 
            || (err.code === 'ERR_NETWORK' 
              ? 'Unable to connect to backend API server. Please ensure the backend is running.' 
              : err.message)
            || 'Failed to load uptime statistics';
          setUptimeError(errMsg);
          setUptimeData(null);
          setIsLoadingUptime(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [targetId]);

  // Fetch real response-time history curve and summary statistics
  const loadChartHistory = useCallback(async (silent = false) => {
    if (!targetId || isNaN(targetId)) return;
    if (!silent) {
      setIsLoadingChart(true);
      setChartError(null);
    }
    try {
      const result = await getMonitoringHistory(targetId, { range: chartRange });
      setChartPoints(result.points || []);
      setChartMetrics({
        avgLatency: result.avgLatency,
        minLatency: result.minLatency,
        maxLatency: result.maxLatency
      });
    } catch (err) {
      console.error('Failed to fetch target chart history:', err);
      const errMsg = err.response?.data?.error?.message 
        || (err.code === 'ERR_NETWORK' 
          ? 'Unable to connect to backend API server. Please ensure the backend is running.' 
          : err.message)
        || 'Failed to load chart history';
      if (!silent) {
        setChartError(errMsg);
        setChartPoints([]);
        setChartMetrics({ avgLatency: null, minLatency: null, maxLatency: null });
      }
    } finally {
      if (!silent) {
        setIsLoadingChart(false);
      }
    }
  }, [targetId, chartRange]);

  // Synchronize chart history whenever target or time range changes
  useEffect(() => {
    loadChartHistory(false);
  }, [loadChartHistory]);

  if (!target) {
    return (
      <div className="content-body py-16 text-center">
        <Server className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-3" />
        <h2 className="text-base font-bold text-[var(--text-primary)]">Target Not Found</h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          No telemetry target probe exists with ID #{id}.
        </p>
        <button
          onClick={() => navigate('/targets')}
          className="btn-telemetry btn-primary mt-4 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Targets Inventory</span>
        </button>
      </div>
    );
  }

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleManualCheck = async () => {
    if (isChecking) return;
    if (!target.is_enabled) {
      showToast(`Cannot check paused target "${target.name}". Enable it first.`);
      return;
    }

    try {
      setIsChecking(true);
      const outcome = await onManualCheck(target.id);
      const latencyText = outcome?.result?.responseTimeMs !== null && outcome?.result?.responseTimeMs !== undefined
        ? ` (${outcome.result.responseTimeMs} ms)`
        : '';
      showToast(`Probe completed for ${target.name}: ${outcome?.status || 'done'}${latencyText}`);
      // Refresh probe history, uptime SLA, and chart history silently so the new probe cycle is immediately reflected
      loadInitialHistory(true);
      loadUptime(true);
      loadChartHistory(true);
    } catch (err) {
      showToast(err.message || `Manual probe failed for ${target.name}`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleExportResults = async () => {
    if (isExportingResults || !targetId) return;
    setIsExportingResults(true);
    try {
      const res = await exportProbeResultsReport({ targetId });
      const kb = (res.size / 1024).toFixed(1);
      showToast(`Exported ${res.filename} (${kb} KB) successfully`);
    } catch (err) {
      console.error('Failed to export probe results CSV:', err);
      showToast(err.message || 'Failed to download probe results report');
    } finally {
      setIsExportingResults(false);
    }
  };

  return (
    <div className="content-body">
      {/* Toast Feedback */}
      <ToastNotification message={toastMessage} />

      {/* Header Bar */}
      <TargetDetailsHeader
        target={target}
        isChecking={isChecking}
        onBack={() => navigate('/targets')}
        onManualCheck={handleManualCheck}
        onConfigure={() => setIsDrawerOpen(true)}
      />

      {/* Target Health Metrics Strip */}
      <TargetMetricsStrip
        target={target}
        avgLatency={chartMetrics.avgLatency}
        minLatency={chartMetrics.minLatency}
        maxLatency={chartMetrics.maxLatency}
        uptimeData={uptimeData}
        isLoadingUptime={isLoadingUptime}
      />

      {/* Response Time Chart Card */}
      <TargetResponseChartCard
        target={target}
        timeSeries={chartPoints}
        chartRange={chartRange}
        onRangeChange={setChartRange}
        isLoading={isLoadingChart}
        error={chartError}
        onRetry={() => loadChartHistory(false)}
      />

      {/* Real SLA Availability Bar */}
      <TargetAvailabilityBar
        uptimeData={uptimeData}
        isLoading={isLoadingUptime}
        error={uptimeError}
        onRetry={() => loadUptime(false)}
      />

      {/* Two Column Layout: Configuration & Recent Checks History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TargetConfigCard
          target={target}
          onConfigure={() => setIsDrawerOpen(true)}
        />
        <RecentProbesTable 
          checkLogs={historyLogs}
          isLoading={isLoadingHistory}
          error={historyError}
          onRetry={() => loadInitialHistory(false)}
          hasMore={hasMoreHistory}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMoreHistory}
          onExportCSV={handleExportResults}
          isExporting={isExportingResults}
        />
      </div>

      {/* Target Configuration Drawer */}
      <TargetDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        target={target}
        onSave={async (updated) => {
          await onUpdateTarget({ ...target, ...updated });
          showToast(`Target configuration saved for ${target.name}`);
        }}
      />
    </div>
  );
}
