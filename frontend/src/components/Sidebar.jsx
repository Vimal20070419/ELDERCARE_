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
    { icon: Users,         label: 'Patients',   path: '/dashboard' },
    { icon: ClipboardList, label: 'Reports',    path: '/reports' },
  ];
  const patientLinks = [
    { icon: Activity, label: 'My Medications', path: '/patient' },
  ];
  const links = user?.role === 'patient' ? patientLinks : caregiverLinks;

  const initials = user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'EC';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Activity size={20} color="#fff" />
        </div>
        <h1>ElderCare<span>Medication Monitor</span></h1>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-label">Navigation</p>
        {links.map(({ icon: Icon, label, path }) => (
          <div
            key={label}
            className={`nav-item ${pathname === path ? 'active' : ''}`}
            onClick={() => path && navigate(path)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          {unreadCount > 0 && (
            <span style={{ background: 'var(--danger)', color: '#fff', borderRadius: '999px', padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>
              {unreadCount}
            </span>
          )}
        </div>
        <button 
          className="btn-logout" 
          onClick={toggleSMS} 
          disabled={updating}
          style={{ marginBottom: 8, color: user?.smsEnabled ? 'var(--success-light)' : 'var(--text-muted)' }}
          title={user?.smsEnabled ? 'SMS Alerts Enabled' : 'SMS Alerts Disabled'}
        >
          <MessageSquare size={16} /> <span>{updating ? 'Updating...' : user?.smsEnabled ? 'SMS: On' : 'SMS: Off'}</span>
        </button>
        <button className="btn-logout" onClick={logout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
