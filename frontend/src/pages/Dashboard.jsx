import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(() => {
    setLoading(true);
    setError(false);

    // Try primary endpoint /dashboard/summary, fallback to /targets/dashboard/summary
    api.get('/dashboard/summary')
      .then(res => {
        setSummary(res.data);
        setLoading(false);
      })
      .catch(() => {
        api.get('/targets/dashboard/summary')
          .then(res => {
            setSummary(res.data);
            setLoading(false);
          })
          .catch(err => {
            console.error('API Error:', err);
            setError(true);
            setLoading(false);
          });
      });
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (error) return (
    <div className="wrap">
      <div className="card st">
        <h3 style={{ color: 'var(--of)', margin: '0 0 8px 0' }}>Couldn’t load data</h3>
        <p className="mu" style={{ margin: '0 0 16px 0' }}>
          The API did not respond. Is your backend running on http://localhost:5000?
        </p>
        <button onClick={fetchSummary} className="btn btn-primary btn-sm">
          Retry Connection
        </button>
      </div>
    </div>
  );

  if (loading || !summary) return (
    <div className="wrap">
      <div className="card">
        <div className="sm mu">Loading Dashboard Data...</div>
      </div>
    </div>
  );

  // Card component UI banane ke liye
  const Card = ({ label, value, colorStyle = '' }) => {
    const colorMap = { ok: 'var(--ok)', wa: 'var(--wa)', cr: 'var(--cr)', of: 'var(--of)' };
    const style = colorStyle ? { color: colorMap[colorStyle] } : {};
    
    return (
      <div className="card">
        <div className="sm mu">{label}</div>
        <div className="m" style={style}>{value}</div>
      </div>
    );
  };

  return (
    <div className="wrap">
      <div className="row" style={{ marginBottom: '12px' }}>
        <span className="mu sm sp">Counts reflect current target status.</span>
        <button onClick={fetchSummary} className="btn btn-secondary btn-sm">
          Refresh
        </button>
      </div>
      
      <div className="grid g4">
        <Card label="Total targets" value={summary.totalTargets} />
        <Card label="Online" value={summary.onlineTargets} colorStyle="ok" />
        <Card label="Warning" value={summary.warningTargets} colorStyle="wa" />
        <Card label="Critical" value={summary.criticalTargets} colorStyle="cr" />
        <Card label="Offline" value={summary.offlineTargets} colorStyle="of" />
        <Card label="Disabled" value={summary.disabledTargets} />
        <Card label="Overall uptime" value={summary.overallUptime} colorStyle="ok" />
        <Card label="Active events" value={summary.activeEvents} colorStyle="of" />
      </div>
    </div>
  );
}
