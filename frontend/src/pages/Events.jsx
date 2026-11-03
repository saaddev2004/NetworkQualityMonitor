import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { RefreshCw, AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getSeverityBadge = (severity) => {
    if (severity === 'critical') {
      return (
        <span className="badge badge-critical">
          <AlertCircle size={12} /> Critical
        </span>
      );
    }
    if (severity === 'warning') {
      return (
        <span className="badge badge-warning">
          <AlertTriangle size={12} /> Warning
        </span>
      );
    }
    return (
      <span className="badge badge-info">
        <Info size={12} /> Info
      </span>
    );
  };

  const filteredEvents = events.filter(e => {
    if (filterSeverity === 'all') return true;
    return e.severity === filterSeverity;
  });

  return (
    <div className="wrap">
      <div className="row">
        <div>
          <span className="sm mu">Audit trail of network alerts, state transitions, and recovery events.</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select 
            value={filterSeverity} 
            onChange={e => setFilterSeverity(e.target.value)}
            className="form-input"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warning Only</option>
            <option value="info">Info / Recovery</option>
          </select>
          <button 
            onClick={fetchEvents} 
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }} className="mu sm">
            <RefreshCw className="animate-spin" size={20} style={{ display: 'inline', marginRight: 8 }} />
            Loading event log...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <ShieldAlert size={36} color="var(--mu)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ margin: '0 0 6px 0' }}>No Events Recorded</h4>
            <p className="mu sm">
              Events are generated when target health changes state (e.g. online to warning/offline, or recovery).
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Target</th>
                <th>Event Type</th>
                <th>Description</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(e => (
                <tr key={e.id}>
                  <td>{getSeverityBadge(e.severity)}</td>
                  <td style={{ fontWeight: 600 }}>{e.target_name || `Target #${e.target_id}`}</td>
                  <td>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      padding: '2px 8px', 
                      background: e.event_type === 'recovery' ? 'var(--okb)' : '#f1f5f9',
                      color: e.event_type === 'recovery' ? 'var(--ok)' : 'var(--tx)',
                      borderRadius: 4,
                      textTransform: 'uppercase'
                    }}>
                      {e.event_type}
                    </span>
                  </td>
                  <td style={{ maxWidth: 360, wordBreak: 'break-word' }}>
                    {e.description}
                  </td>
                  <td className="sm mu" style={{ whiteSpace: 'nowrap' }}>
                    {new Date(e.occurred_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

