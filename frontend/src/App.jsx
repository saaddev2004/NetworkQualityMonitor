import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Target, AlertTriangle, Activity } from 'lucide-react';
import './index.css';
import Dashboard from './pages/Dashboard';
import Targets from './pages/Targets';
import Events from './pages/Events';

function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/targets', label: 'Monitored Targets', icon: Target },
    { path: '/events', label: 'Event Log', icon: AlertTriangle },
  ];

  return (
    <aside>
      <div className="logo">
        <Activity size={20} color="var(--pr)" />
        <span>NetQuality Monitor</span>
      </div>
      
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={isActive ? 'active' : ''}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
      
      <small>
        React · Node.js · MySQL<br />
        Connected to API (5000)
      </small>
    </aside>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main>
          <div className="top">
            <h1>Network Quality Monitor</h1>
          </div>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/targets" element={<Targets />} />
            <Route path="/events" element={<Events />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
