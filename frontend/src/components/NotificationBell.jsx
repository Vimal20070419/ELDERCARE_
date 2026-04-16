// components/NotificationBell.jsx
import { useState } from 'react';
import { Bell, X } from 'lucide-react';

const typeIcon = { reminder: '💊', alert: '⚠️', interaction_flag: '🚨', missed_dose: '❌', report_ready: '📋' };
const typeColors = {
  reminder: 'var(--info-bg)',
  alert: 'var(--warning-bg)',
  interaction_flag: 'var(--danger-bg)',
  missed_dose: 'var(--danger-bg)',
  report_ready: 'var(--success-bg)',
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function NotificationBell({ notifications, unreadCount, onMarkRead, onMarkAll }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="notif-bell-wrap" style={{ position: 'relative' }}>
      <button
        id="notif-bell-btn"
        className="btn btn-ghost btn-icon"
        onClick={() => setOpen((p) => !p)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="notif-dot" />}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 499 }} onClick={() => setOpen(false)} />
          <div className="notif-panel">
            <div className="notif-panel-header">
              <span>Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
              {unreadCount > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={onMarkAll}>Mark all read</button>
              )}
            </div>
            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <p>No new notifications</p>
                </div>
              ) : notifications.map((n) => (
                <div
                  key={n._id}
                  className={`notif-item ${!n.read ? 'unread' : ''}`}
                  onClick={() => onMarkRead(n._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="notif-icon" style={{ background: typeColors[n.type] || 'var(--bg-glass)' }}>
                    {typeIcon[n.type] || '🔔'}
                  </div>
                  <div className="notif-item-body">
                    <p>{n.message}</p>
                    <time>{timeAgo(n.createdAt)}</time>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
