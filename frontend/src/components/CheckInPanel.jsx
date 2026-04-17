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
          <CheckCircle2 size={24} color="#fff" strokeWidth={3} />
          <div>
            <h3>Today's Schedule</h3>
            <p>No active medications remaining for today</p>
          </div>
        </div>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ 
            width: 64, height: 64, background: 'var(--success-bg)', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', margin: '0 auto 16px' 
          }}>
            <CheckCircle2 size={32} color="var(--success)" />
          </div>
          <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>You're all set!</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All medications for today have been logged.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkin-panel">
      <div className="checkin-header">
        <Clock size={24} color="#fff" strokeWidth={3} />
        <div>
          <h3>Medication Check-In</h3>
          <p>Please confirm your current doses</p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{Object.keys(submitted).length}/{medications.length}</div>
          <div style={{ fontSize: '0.65rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>Completed</div>
        </div>
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
                     <> · <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> {med.times.join(', ')}</>
                   )}
                </span>
                {med.instructions && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: 'white', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 700 }}>Note:</span> {med.instructions}
                  </div>
                )}
              </div>

              <div className="checkin-actions">
                {done ? (
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: 8, 
                    color: done === 'taken' ? 'var(--success)' : 'var(--text-muted)',
                    fontWeight: 800, fontSize: '1rem'
                  }}>
                    {done === 'taken' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                    {done === 'taken' ? 'Confirmed Taken' : 'Marked as Skipped'}
                  </div>
                ) : (
                  <>
                    <button
                      id={`taken-${med._id}`}
                      className="btn-taken"
                      onClick={() => respond(med, 'taken')}
                      disabled={busy}
                    >
                      {busy ? <span className="spinner" style={{ width: 18, height: 18, borderColor: 'white' }} /> : <><CheckCircle2 size={20} strokeWidth={3} /> TAKEN</>}
                    </button>
                    <button
                      id={`skipped-${med._id}`}
                      className="btn-skipped"
                      onClick={() => respond(med, 'skipped')}
                      disabled={busy}
                    >
                      <XCircle size={20} strokeWidth={2.5} /> Skip
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
