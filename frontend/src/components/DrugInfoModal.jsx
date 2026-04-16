// components/DrugInfoModal.jsx — Displays OpenFDA side effects and warnings
import { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, List } from 'lucide-react';
import { medicationAPI } from '../services/api';

export default function DrugInfoModal({ medId, medName, onClose }) {
  const [info, setInfo] = useState({ warnings: [], sideEffects: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await medicationAPI.getClinicalInfo(medId);
        setInfo(res.data?.data || { warnings: [], sideEffects: [] });
      } catch (err) {
        setError('Failed to fetch drug information');
      } finally {
        setLoading(false);
      }
    })();
  }, [medId]);

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h3><Info size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Clinician Drug Info: {medName}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '16px 24px' }}>
          {loading ? (
            <div className="spinner" style={{ margin: '40px auto' }} />
          ) : error ? (
            <div className="alert-banner error">{error}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Warnings Section */}
              <section>
                <h4 style={{ color: 'var(--warning-light)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <AlertTriangle size={18} /> Warnings & Precautions
                </h4>
                {info.warnings?.length > 0 ? (
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {info.warnings.map((w, i) => <p key={i} style={{ marginBottom: 10 }}>{w}</p>)}
                  </div>
                ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No specific warnings found in FDA label.</p>}
              </section>

              {/* Side Effects Section */}
              <section>
                <h4 style={{ color: 'var(--info-light)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <List size={18} /> Adverse Reactions (Side Effects)
                </h4>
                {info.sideEffects?.length > 0 ? (
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {info.sideEffects.map((s, i) => <p key={i} style={{ marginBottom: 10 }}>{s}</p>)}
                  </div>
                ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No side effects data found in FDA label.</p>}
              </section>

            </div>
          )}
        </div>

        <div className="form-actions" style={{ borderTop: '1px solid var(--border)', padding: '16px 24px' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>Close Drug Info</button>
        </div>
      </div>
    </div>
  );
}
