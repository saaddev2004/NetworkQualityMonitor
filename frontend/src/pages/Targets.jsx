import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { 
  Plus, 
  RefreshCw, 
  Trash2, 
  Play, 
  Power, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Globe, 
  Server, 
  Cpu,
  X
} from 'lucide-react';

export default function Targets() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    targetType: 'website',
    address: 'https://',
    checkMethod: 'http',
    checkIntervalSeconds: 60,
    warningThresholdMs: 500,
    criticalThresholdMs: 1000,
    timeoutSeconds: 5
  });

  const fetchTargets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/targets');
      setTargets(res.data);
    } catch (err) {
      console.error('Failed to fetch targets:', err);
      showNotification('Failed to load targets from backend', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleManualCheck = async (id, name) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: 'checking' }));
      const res = await api.post(`/targets/${id}/check`);
      const r = res.data.result;
      const statusText = r.status || (r.isAvailable ? 'online' : 'offline');
      const latencyText = r.responseTimeMs !== null ? `${r.responseTimeMs} ms` : 'N/A';
      showNotification(`Checked ${name}: ${statusText.toUpperCase()} (${latencyText})`, r.isAvailable ? 'success' : 'error');
      fetchTargets();
    } catch (err) {
      console.error('Manual check failed:', err);
      showNotification(`Manual check failed: ${err.response?.data?.error?.message || err.message}`, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleToggleEnabled = async (target) => {
    const newEnabled = !target.is_enabled;
    try {
      setActionLoading(prev => ({ ...prev, [target.id]: 'toggling' }));
      await api.patch(`/targets/${target.id}/enabled`, { isEnabled: newEnabled });
      showNotification(`Target ${target.name} ${newEnabled ? 'enabled' : 'disabled'}`, 'info');
      fetchTargets();
    } catch (err) {
      console.error('Toggle failed:', err);
      showNotification('Failed to toggle target status', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [target.id]: null }));
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete target "${name}"?`)) return;
    try {
      setActionLoading(prev => ({ ...prev, [id]: 'deleting' }));
      await api.delete(`/targets/${id}`);
      showNotification(`Target "${name}" removed`, 'info');
      setTargets(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      showNotification('Failed to delete target', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleCreateTarget = async (e) => {
    e.preventDefault();
    try {
      await api.post('/targets', {
        ...formData,
        checkIntervalSeconds: Number(formData.checkIntervalSeconds),
        warningThresholdMs: Number(formData.warningThresholdMs),
        criticalThresholdMs: Number(formData.criticalThresholdMs),
        timeoutSeconds: Number(formData.timeoutSeconds)
      });
      showNotification(`Target "${formData.name}" added successfully!`, 'success');
      setShowAddModal(false);
      setFormData({
        name: '',
        targetType: 'website',
        address: 'https://',
        checkMethod: 'http',
        checkIntervalSeconds: 60,
        warningThresholdMs: 500,
        criticalThresholdMs: 1000,
        timeoutSeconds: 5
      });
      fetchTargets();
    } catch (err) {
      console.error('Create target failed:', err);
      const detail = err.response?.data?.error?.details?.[0]?.message || err.response?.data?.error?.message || err.message;
      showNotification(`Failed to create target: ${detail}`, 'error');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      online: { cls: 'badge-online', icon: CheckCircle2 },
      warning: { cls: 'badge-warning', icon: AlertTriangle },
      critical: { cls: 'badge-critical', icon: AlertTriangle },
      offline: { cls: 'badge-offline', icon: XCircle },
      disabled: { cls: 'badge-disabled', icon: Clock },
      unknown: { cls: 'badge-unknown', icon: Clock },
    };
    const item = map[status] || map.unknown;
    const Icon = item.icon;
    return (
      <span className={`badge ${item.cls}`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  return (
    <div className="wrap">
      {notification && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 100,
          background: notification.type === 'error' ? '#fee2e2' : notification.type === 'success' ? '#dcfce7' : '#e0f2fe',
          color: notification.type === 'error' ? '#b91c1c' : notification.type === 'success' ? '#15803d' : '#0369a1',
          border: `1px solid ${notification.type === 'error' ? '#f87171' : notification.type === 'success' ? '#86efac' : '#7dd3fc'}`,
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontWeight: 500,
          fontSize: '0.875rem'
        }}>
          {notification.msg}
        </div>
      )}

      <div className="row">
        <div>
          <span className="sm mu">Manage monitored websites, hosts, and HTTP microservices.</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a 
            href="http://localhost:5000/api/v1/targets/reports/targets.csv"
            download="targets.csv"
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: 'none' }}
          >
            <Download size={14} /> Export CSV
          </a>
          <button 
            onClick={fetchTargets} 
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="btn btn-primary btn-sm"
          >
            <Plus size={14} /> Add Target
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }} className="mu sm">
            <RefreshCw className="animate-spin" size={20} style={{ display: 'inline', marginRight: 8 }} />
            Loading targets...
          </div>
        ) : targets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p className="mu" style={{ marginBottom: 16 }}>No targets currently monitored.</p>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Add Your First Target
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Target</th>
                <th>Address</th>
                <th>Type / Method</th>
                <th>Interval</th>
                <th>Status</th>
                <th>Last Checked</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {targets.map(t => {
                const isChecking = actionLoading[t.id] === 'checking';
                const isToggling = actionLoading[t.id] === 'toggling';
                const isDeleting = actionLoading[t.id] === 'deleting';

                return (
                  <tr key={t.id} style={{ opacity: t.is_enabled ? 1 : 0.65 }}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {t.target_type === 'website' && <Globe size={16} color="var(--pr)" />}
                        {t.target_type === 'http_service' && <Server size={16} color="#7c3aed" />}
                        {t.target_type === 'host' && <Cpu size={16} color="#059669" />}
                        <span>{t.name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--mu)' }}>
                      {t.address}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 6px', background: '#e2e8f0', borderRadius: 4 }}>
                        {t.check_method?.toUpperCase()}
                      </span>
                    </td>
                    <td>{t.check_interval_seconds}s</td>
                    <td>{getStatusBadge(t.current_status)}</td>
                    <td className="sm mu">
                      {t.last_checked_at ? new Date(t.last_checked_at).toLocaleTimeString() : 'Never'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          title="Run Check Now"
                          disabled={isChecking || !t.is_enabled}
                          onClick={() => handleManualCheck(t.id, t.name)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Play size={12} className={isChecking ? 'animate-spin' : ''} />
                          {isChecking ? 'Checking...' : 'Check'}
                        </button>
                        <button
                          title={t.is_enabled ? 'Disable Monitoring' : 'Enable Monitoring'}
                          disabled={isToggling}
                          onClick={() => handleToggleEnabled(t)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Power size={12} color={t.is_enabled ? 'var(--ok)' : 'var(--mu)'} />
                        </button>
                        <button
                          title="Delete Target"
                          disabled={isDeleting}
                          onClick={() => handleDelete(t.id, t.name)}
                          className="btn btn-danger btn-sm"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Add Monitored Target</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--mu)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTarget}>
              <div className="form-group">
                <label>Target Name *</label>
                <input 
                  type="text" 
                  required
                  className="form-input"
                  placeholder="e.g. Production Web API"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Target Type *</label>
                  <select 
                    className="form-input"
                    value={formData.targetType}
                    onChange={e => setFormData({ ...formData, targetType: e.target.value })}
                  >
                    <option value="website">Website</option>
                    <option value="http_service">HTTP Service</option>
                    <option value="host">Host / Server</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Check Method *</label>
                  <select 
                    className="form-input"
                    value={formData.checkMethod}
                    onChange={e => {
                      const method = e.target.value;
                      setFormData({ 
                        ...formData, 
                        checkMethod: method,
                        address: method === 'icmp' && formData.address.startsWith('http') ? '8.8.8.8' : formData.address
                      });
                    }}
                  >
                    <option value="http">HTTP / HTTPS</option>
                    <option value="icmp">ICMP Ping</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Address / Host *</label>
                <input 
                  type="text" 
                  required
                  className="form-input"
                  placeholder={formData.checkMethod === 'http' ? 'https://example.com' : '8.8.8.8'}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Interval (sec)</label>
                  <input 
                    type="number" 
                    min="5"
                    className="form-input"
                    value={formData.checkIntervalSeconds}
                    onChange={e => setFormData({ ...formData, checkIntervalSeconds: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Warning (ms)</label>
                  <input 
                    type="number" 
                    min="1"
                    className="form-input"
                    value={formData.warningThresholdMs}
                    onChange={e => setFormData({ ...formData, warningThresholdMs: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Critical (ms)</label>
                  <input 
                    type="number" 
                    min="1"
                    className="form-input"
                    value={formData.criticalThresholdMs}
                    onChange={e => setFormData({ ...formData, criticalThresholdMs: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Timeout (sec)</label>
                <input 
                  type="number" 
                  min="1"
                  max="60"
                  className="form-input"
                  value={formData.timeoutSeconds}
                  onChange={e => setFormData({ ...formData, timeoutSeconds: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Create Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

