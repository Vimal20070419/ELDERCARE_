import { Activity, Users, ClipboardList, BarChart2, LogOut, Bell, MessageSquare, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { authAPI } from '../services/api';

export default function Sidebar({ unreadCount = 0 }) {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [updating, setUpdating] = useState(false);

  const toggleSMS = async () => {
    setUpdating(true);
    try {
      const res = await authAPI.updatePrefs({ smsEnabled: !user.smsEnabled });
      login(localStorage.getItem('token'), res.data.data); // Update local user state
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const caregiverLinks = [
    { icon: Users,         label: 'Dashboard',   path: '/dashboard' },
    { icon: ClipboardList, label: 'Medications', path: '/reports' }, // Map to reports for now
    { icon: ShieldCheck,   label: 'Care Team',   path: '/care-team' },
    { icon: BarChart2,     label: 'Insights',    path: '/reports' },
    { icon: Bell,          label: 'Settings',    path: '#' },
  ];
  const patientLinks = [
    { icon: Activity,      label: 'Dashboard',   path: '/patient' },
    { icon: ClipboardList, label: 'Medications', path: '/patient' },
    { icon: Users,         label: 'Care Team',   path: '/care-team' },
    { icon: BarChart2,     label: 'Insights',    path: '#' },
    { icon: Bell,          label: 'Settings',    path: '#' },
  ];
  const links = user?.role === 'patient' ? patientLinks : caregiverLinks;

  const initials = user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'EC';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Activity size={20} color="#fff" strokeWidth={3} />
        </div>
        <h1>CareMonitor<span>Healthcare Dashboard</span></h1>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-label">Menu</p>
        {links.map(({ icon: Icon, label, path }) => (
          <div
            key={label}
            className={`nav-item ${pathname === path ? 'active' : ''}`}
            onClick={() => path !== '#' && navigate(path)}
            style={{ cursor: path === '#' ? 'default' : 'pointer', opacity: path === '#' ? 0.5 : 1 }}
          >
            <Icon size={20} strokeWidth={2.5} />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" style={{ background: 'var(--bg-deep)', marginBottom: 12 }}>
          <div className="user-avatar" style={{ background: 'var(--primary)', color: 'white' }}>{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role" style={{ color: 'var(--primary)', fontWeight: 700 }}>{user?.role}</div>
          </div>
        </div>
        
        <button 
          className="btn-logout" 
          onClick={toggleSMS} 
          disabled={updating}
          style={{ 
            marginBottom: 8, 
            background: 'transparent',
            border: 'none',
            justifyContent: 'flex-start',
            padding: '10px 14px',
            color: user?.smsEnabled ? 'var(--success)' : 'var(--text-muted)' 
          }}
        >
          <MessageSquare size={18} /> 
          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {updating ? 'Updating...' : user?.smsEnabled ? 'SMS Alerts: ON' : 'SMS Alerts: OFF'}
          </span>
        </button>

        <button 
          className="btn-logout" 
          onClick={logout}
          style={{ 
            background: 'transparent',
            border: 'none',
            justifyContent: 'flex-start',
            padding: '10px 14px',
            color: 'var(--danger)'
          }}
        >
          <LogOut size={18} /> 
          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Logout</span>
        </button>
      </div>
    </aside>
  );
}
