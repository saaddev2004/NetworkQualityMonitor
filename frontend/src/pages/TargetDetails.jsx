import React, { useState, useMemo } from 'react';
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
import { generateTimeSeries, CHECK_HISTORY, generateAvailabilityHistory } from '../data/mockData';

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

  // Synthetic 32-cycle time-series for chart
  const timeSeries = useMemo(() => {
    if (!target) return [];
    return generateTimeSeries(target);
  }, [target]);

  // Target-specific check history
  const checkLogs = useMemo(() => {
    if (!target) return [];
    return CHECK_HISTORY[target.id] || [];
  }, [target]);

  // 30-Day availability blocks
  const availabilityDays = useMemo(() => {
    return generateAvailabilityHistory(targetId, 30);
  }, [targetId]);

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
    } catch (err) {
      showToast(err.message || `Manual probe failed for ${target.name}`);
    } finally {
      setIsChecking(false);
    }
  };

  const validPoints = timeSeries.map(p => p.latency).filter(v => v !== null && v !== undefined);
  const minLatency = validPoints.length ? Math.min(...validPoints) : 0;
  const maxLatency = validPoints.length ? Math.max(...validPoints) : 0;
  const avgLatency = validPoints.length ? Math.round(validPoints.reduce((a, b) => a + b, 0) / validPoints.length) : 0;

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
        avgLatency={avgLatency}
        minLatency={minLatency}
        maxLatency={maxLatency}
      />

      {/* Response Time Chart Card */}
      <TargetResponseChartCard
        target={target}
        timeSeries={timeSeries}
        chartRange={chartRange}
        onRangeChange={setChartRange}
      />

      {/* 30-Day Availability Trend Bar */}
      <TargetAvailabilityBar
        uptimePercentage={target.uptime_percentage}
        availabilityDays={availabilityDays}
      />

      {/* Two Column Layout: Configuration & Recent Checks History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TargetConfigCard
          target={target}
          onConfigure={() => setIsDrawerOpen(true)}
        />
        <RecentProbesTable checkLogs={checkLogs} />
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
