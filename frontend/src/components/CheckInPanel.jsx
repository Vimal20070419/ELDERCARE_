// components/CheckInPanel.jsx — Patient SMS-style medication check-in interface
import { useState } from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { adherenceAPI } from '../services/api';

export default function CheckInPanel({ medications, patientId, onCheckedIn }) {
  const [submitted, setSubmitted] = useState({});
  const [loading, setLoading] = useState({});

  const respond = async (med, status) => {
    setLoading((p) => ({ ...p, [med._id]: true }));
    try {
      await adherenceAPI.checkIn({ patientId, medicationId: med._id, status });
      setSubmitted((p) => ({ ...p, [med._id]: status }));
      onCheckedIn?.();
    } finally {
      setLoading((p) => ({ ...p, [med._id]: false }));
    }
  };

  if (!medications.length) {
    return (
      <div className="checkin-panel">
        <div className="checkin-header">
          <CheckCircle2 size={24} color="#fff" />
          <div>
            <h3 style={{ color: '#fff', fontWeight: 700 }}>Today's Medications</h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>No active medications scheduled</p>
          </div>
        </div>
        <div className="empty-state"><p>You're all set for today!</p></div>
      </div>
    );
  }

  return (
    <div className="checkin-panel">
      <div className="checkin-header">
        <CheckCircle2 size={24} color="#fff" />
        <div>
          <h3 style={{ color: '#fff', fontWeight: 700 }}>Today's Check-In</h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Confirm your doses below</p>
        </div>
        <span style={{
          marginLeft: 'auto', background: 'rgba(255,255,255,0.2)',
          borderRadius: '999px', padding: '3px 12px',
          fontSize: '0.8rem', color: '#fff', fontWeight: 600
        }}>
          {Object.keys(submitted).length}/{medications.length} done
        </span>
      </div>

      <div className="checkin-body">
        {medications.map((med) => {
          const done = submitted[med._id];
          const busy = loading[med._id];
          return (
            <div className="checkin-item" key={med._id}>
              <div className="checkin-item-info">
                <span className="checkin-item-name">{med.name}</span>
                <span className="checkin-item-meta">
                  {med.dosage} · {med.frequency}
                  {med.times?.length > 0 && (
                    <> · <Clock size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {med.times.join(', ')}</>
                  )}
                </span>
                {med.instructions && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>📝 {med.instructions}</span>}
              </div>

              {done ? (
                <span className={`badge badge-${done}`} style={{ fontSize: '0.8rem', padding: '5px 12px' }}>
                  {done === 'taken' ? '✅ Taken' : '⏩ Skipped'}
                </span>
              ) : (
                <div className="checkin-actions">
                  <button
                    id={`taken-${med._id}`}
                    className="btn-taken"
                    onClick={() => respond(med, 'taken')}
                    disabled={busy}
                  >
                    {busy ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <>✅ Taken</>}
                  </button>
                  <button
                    id={`skipped-${med._id}`}
                    className="btn-skipped"
                    onClick={() => respond(med, 'skipped')}
                    disabled={busy}
                  >
                    ⏩ Skip
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
