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
          <div className="med-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Pill size={18} color="var(--primary)" strokeWidth={2.5} />
            {med.name}
          </div>
          {med.brandName && <div className="med-brand">{med.brandName}</div>}
        </div>
        <span className={`badge badge-${med.status === 'active' ? 'success' : 'warning'}`} style={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 800 }}>
          {med.status}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span className="med-chip">💊 {med.dosage}</span>
        <span className="med-chip">🔁 {med.frequency}</span>
      </div>

      {med.times?.length > 0 && (
        <div style={{ background: 'var(--bg-deep)', padding: 12, borderRadius: 12 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scheduled Doses</div>
          <div className="med-times">
            {med.times.map((t) => (
              <span key={t} className="time-pill" style={{ background: 'white', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 8 }}>
                <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {med.instructions && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(37,99,235,0.03)', padding: 12, borderRadius: 12, border: '1px dashed var(--border-strong)' }}>
          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Instruction:</span> {med.instructions}
        </div>
      )}

      <div className="med-card-actions">
        <button
          id={`toggle-med-${med._id}`}
          className={`btn btn-sm ${med.status === 'active' ? 'btn-ghost' : 'btn-success'}`}
          onClick={toggleStatus}
          disabled={loading}
          style={{ padding: '6px 12px', fontWeight: 700 }}
        >
          {med.status === 'active' ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
        </button>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => setShowInfo(true)}
          style={{ color: 'var(--primary)', fontWeight: 700, padding: '6px 12px' }}
        >
          <Info size={14} /> Clinical Info
        </button>
        <button
          id={`delete-med-${med._id}`}
          className="btn btn-sm btn-ghost"
          onClick={deleteMed}
          style={{ color: 'var(--danger)', marginLeft: 'auto', padding: '6px' }}
        >
          <Trash2 size={16} />
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
