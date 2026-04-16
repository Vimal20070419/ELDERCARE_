// components/InteractionBadge.jsx — Drug interaction flag display card
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { interactionAPI } from '../services/api';
import { useState } from 'react';

const severityConfig = {
  critical: { color: 'var(--critical)',      bg: 'var(--critical-bg)', icon: '🚨' },
  high:     { color: 'var(--danger-light)',  bg: 'var(--danger-bg)',   icon: '⚠️' },
  medium:   { color: 'var(--warning-light)', bg: 'var(--warning-bg)', icon: '⚠️' },
  low:      { color: 'var(--info)',          bg: 'var(--info-bg)',     icon: 'ℹ️' },
};

export default function InteractionBadge({ flag, onRefresh }) {
  const [acking, setAcking] = useState(false);
  const cfg = severityConfig[flag.severity] || severityConfig.low;

  const acknowledge = async () => {
    setAcking(true);
    try {
      await interactionAPI.acknowledge(flag._id);
      onRefresh?.();
    } finally { setAcking(false); }
  };

  return (
    <div className={`interaction-card ${flag.severity}`}>
      <div className="interaction-icon" style={{ background: cfg.bg, fontSize: '1.2rem' }}>
        {cfg.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{flag.drug1}</span>
          <span style={{ color: 'var(--text-muted)' }}>↔</span>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{flag.drug2}</span>
          <span className={`badge badge-${flag.severity}`} style={{ marginLeft: 'auto' }}>{flag.severity}</span>
        </div>
        {flag.description && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
            {flag.description.slice(0, 200)}{flag.description.length > 200 ? '…' : ''}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Detected {new Date(flag.createdAt).toLocaleDateString()}
          </span>
          {!flag.acknowledged && (
            <button
              id={`ack-flag-${flag._id}`}
              className="btn btn-sm btn-ghost"
              onClick={acknowledge}
              disabled={acking}
              style={{ marginLeft: 'auto', color: 'var(--success-light)' }}
            >
              <CheckCircle size={14} /> Acknowledge
            </button>
          )}
          {flag.acknowledged && (
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--success-light)' }}>
              ✓ Acknowledged
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
