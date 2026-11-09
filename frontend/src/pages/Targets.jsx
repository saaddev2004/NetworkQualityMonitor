import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RotateCw } from 'lucide-react';
import TargetsHeader from '../components/targets/TargetsHeader';
import TargetStatusFilters from '../components/targets/TargetStatusFilters';
import TargetSearchBar from '../components/targets/TargetSearchBar';
import TargetsTable from '../components/targets/TargetsTable';
import TargetDrawer from '../components/TargetDrawer';
import ToastNotification from '../components/common/ToastNotification';
import { exportToCSV } from '../utils/formatters';

/**
 * Targets Inventory Page
 * Complete inventory management for monitored endpoints, including filtering, searching,
 * CSV reporting, manual health probing, and provisioning configuration.
 */
export default function Targets({ 
  targets = [],
  isLoading = false,
  error = null,
  onRetry = null,
  onAddTarget, 
  onUpdateTarget, 
  onDeleteTarget,
  onToggleTarget,
  onManualCheck
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [checkingId, setCheckingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Status counts for filter chips
  const counts = useMemo(() => {
    return {
      all: targets.length,
      online: targets.filter(t => t.current_status === 'online').length,
      warning: targets.filter(t => t.current_status === 'warning').length,
      critical: targets.filter(t => t.current_status === 'critical').length,
      offline: targets.filter(t => t.current_status === 'offline').length,
      disabled: targets.filter(t => !t.is_enabled || t.current_status === 'disabled').length
    };
  }, [targets]);

  // Filtered targets
  const filteredTargets = useMemo(() => {
    return targets.filter(t => {
      const matchesSearch = 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'disabled' ? (!t.is_enabled || t.current_status === 'disabled') : t.current_status === statusFilter);

      const matchesType =
        typeFilter === 'all' ||
        t.target_type === typeFilter;

      const matchesMethod =
        methodFilter === 'all' ||
        t.check_method === methodFilter;

      return matchesSearch && matchesStatus && matchesType && matchesMethod;
    });
  }, [targets, searchQuery, statusFilter, typeFilter, methodFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleManualCheck = async (e, target) => {
    e.stopPropagation();
    if (checkingId === target.id) return;
    if (!target.is_enabled) {
      showToast(`Cannot check paused target "${target.name}". Enable it first.`);
      return;
    }

    try {
      setCheckingId(target.id);
      const outcome = await onManualCheck(target.id);
      const latencyText = outcome?.result?.responseTimeMs !== null && outcome?.result?.responseTimeMs !== undefined
        ? ` (${outcome.result.responseTimeMs} ms)`
        : '';
      showToast(`Probe completed for ${target.name}: ${outcome?.status || 'done'}${latencyText}`);
    } catch (err) {
      showToast(err.message || `Manual probe failed for ${target.name}`);
    } finally {
      setCheckingId(null);
    }
  };

  const handleToggle = async (e, target) => {
    e.stopPropagation();
    if (togglingId) return;
    const nextState = !target.is_enabled;
    try {
      setTogglingId(target.id);
      await onToggleTarget(target.id, nextState);
      showToast(`Target ${target.name} ${nextState ? 'resumed' : 'paused'}`);
    } catch (err) {
      showToast(err.message || `Failed to update ${target.name}`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleEdit = (e, target) => {
    e.stopPropagation();
    setSelectedTarget(target);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (e, target) => {
    e.stopPropagation();
    if (deletingId) return;
    if (window.confirm(`Are you sure you want to delete ${target.name}? This will remove all historical telemetry.`)) {
      try {
        setDeletingId(target.id);
        await onDeleteTarget(target.id);
        showToast(`Target ${target.name} removed from inventory`);
      } catch (err) {
        showToast(err.message || `Failed to delete ${target.name}`);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['Target ID', 'Name', 'Address', 'Type', 'Method', 'Status', 'Latency (ms)', '24h Uptime', 'Interval (s)'];
    const rows = filteredTargets.map(t => [
      t.id,
      `"${t.name.replace(/"/g, '""')}"`,
      `"${t.address.replace(/"/g, '""')}"`,
      t.target_type,
      t.check_method,
      t.current_status,
      t.latency !== null ? t.latency : 'N/A',
      t.uptime_percentage,
      t.check_interval_seconds
    ]);

    exportToCSV(`monitored_targets_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast('Exported targets CSV report successfully');
  };

  return (
    <div className="content-body">
      {/* Toast Feedback */}
      <ToastNotification message={toastMessage} />

      {/* API Error Banner if connection fails */}
      {error && (
        <div className="p-3.5 rounded-lg border border-[var(--status-critical-border)] bg-[var(--status-critical-bg)] text-[var(--status-critical)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span><strong>Backend Connection Error:</strong> {error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-telemetry btn-secondary text-xs self-start sm:self-auto flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Page Header */}
      <TargetsHeader
        filteredCount={filteredTargets.length}
        totalCount={targets.length}
        onExportCSV={handleExportCSV}
        onAddTarget={() => {
          setSelectedTarget(null);
          setIsDrawerOpen(true);
        }}
      />

      {/* Filter and Search Bar */}
      <div className="telemetry-card p-3 space-y-3">
        <TargetStatusFilters
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          counts={counts}
        />
        <TargetSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          methodFilter={methodFilter}
          onMethodFilterChange={setMethodFilter}
        />
      </div>

      {/* Targets Table */}
      <TargetsTable
        targets={filteredTargets}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        checkingId={checkingId}
        deletingId={deletingId}
        togglingId={togglingId}
        onRowClick={(id) => navigate(`/targets/${id}`)}
        onManualCheck={handleManualCheck}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Drawer for Provisioning / Editing */}
      <TargetDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTarget(null);
        }}
        target={selectedTarget}
        onSave={async (data) => {
          if (selectedTarget) {
            await onUpdateTarget({ ...selectedTarget, ...data });
            showToast(`Target ${data.name} updated successfully`);
          } else {
            await onAddTarget(data);
            showToast(`Target ${data.name} created successfully`);
          }
        }}
      />
    </div>
  );
}
