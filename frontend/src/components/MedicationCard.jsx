import { Clock, Pill, Pause, Play, Trash2, Info } from 'lucide-react';
import { medicationAPI } from '../services/api';
import { useState } from 'react';
import DrugInfoModal from './DrugInfoModal';

export default function MedicationCard({ med, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const toggleStatus = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const newStatus = med.status === 'active' ? 'paused' : 'active';
      await medicationAPI.updateStatus(med._id, newStatus);
      onRefresh();
    } finally { setLoading(false); }
  };

  const deleteMed = async () => {
    if (!confirm(`Delete ${med.name}?`)) return;
    await medicationAPI.delete(med._id);
    onRefresh();
  };

  return (
    <div className="med-card">
      <div className="med-card-header">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Pill size={16} color="var(--primary-light)" />
            <span className="med-name">{med.name}</span>
          </div>
          {med.brandName && <div className="med-brand">{med.brandName}</div>}
        </div>
        <span className={`badge badge-${med.status}`}>{med.status}</span>
      </div>

      <div className="med-detail">
        <span className="med-chip">💊 {med.dosage}</span>
        <span className="med-chip">🔁 {med.frequency}</span>
        {med.startDate && (
          <span className="med-chip">📅 {new Date(med.startDate).toLocaleDateString()}</span>
        )}
      </div>

      {med.times?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>DOSE TIMES</div>
          <div className="med-times">
            {med.times.map((t) => (
              <span key={t} className="time-pill">
                <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {med.instructions && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
          📝 {med.instructions}
        </p>
      )}

      <div className="med-card-actions">
        <button
          id={`toggle-med-${med._id}`}
          className={`btn btn-sm ${med.status === 'active' ? 'btn-secondary' : 'btn-success'}`}
          onClick={toggleStatus}
          disabled={loading}
        >
          {med.status === 'active' ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
        </button>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => setShowInfo(true)}
          title="Clinical Information"
          style={{ color: 'var(--info-light)' }}
        >
          <Info size={14} /> Info
        </button>
        <button
          id={`delete-med-${med._id}`}
          className="btn btn-sm btn-ghost"
          onClick={deleteMed}
          style={{ color: 'var(--danger)', marginLeft: 'auto' }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {showInfo && (
        <DrugInfoModal 
          medId={med._id} 
          medName={med.name} 
          onClose={() => setShowInfo(false)} 
        />
      )}
    </div>
  );
}
