// components/AddMedicationModal.jsx
import { useState } from 'react';
import { X, Pill } from 'lucide-react';
import { medicationAPI } from '../services/api';

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Every 4 hours', 'Every 6 hours', 'Weekly', 'As needed'];

export default function AddMedicationModal({ patientId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '', brandName: '', dosage: '', frequency: 'Once daily',
    times: ['08:00'], startDate: '', endDate: '', instructions: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const updateTime = (idx, val) => {
    const times = [...form.times];
    times[idx] = val;
    set('times', times);
  };

  const addTime = () => set('times', [...form.times, '12:00']);
  const removeTime = (idx) => set('times', form.times.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await medicationAPI.add({ ...form, patientId });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add medication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3><Pill size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Add Medication</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        {error && <div className="alert-banner error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Drug Name *</label>
              <input id="med-name" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Warfarin" />
            </div>
            <div className="form-group">
              <label className="form-label">Brand Name</label>
              <input id="med-brand" value={form.brandName} onChange={(e) => set('brandName', e.target.value)} placeholder="e.g. Coumadin" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Dosage *</label>
              <input id="med-dosage" required value={form.dosage} onChange={(e) => set('dosage', e.target.value)} placeholder="e.g. 5mg" />
            </div>
            <div className="form-group">
              <label className="form-label">Frequency *</label>
              <select id="med-frequency" value={form.frequency} onChange={(e) => set('frequency', e.target.value)}>
                {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Dose Times</label>
            {form.times.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <input
                  id={`time-${i}`}
                  type="time" value={t}
                  onChange={(e) => updateTime(i, e.target.value)}
                  style={{ flex: 1 }}
                />
                {form.times.length > 1 && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeTime(i)}>×</button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={addTime}>+ Add time</button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input id="med-start" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input id="med-end" type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Instructions</label>
            <textarea
              id="med-instructions"
              value={form.instructions}
              onChange={(e) => set('instructions', e.target.value)}
              rows={2}
              placeholder="Take with food. Avoid grapefruit."
              style={{ resize: 'vertical' }}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="submit-medication" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Add Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
