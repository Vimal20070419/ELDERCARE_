// components/AddPatientModal.jsx
import { useState } from 'react';
import { X, User } from 'lucide-react';
import { patientAPI } from '../services/api';

const COMORBIDITIES = ['Hypertension', 'Diabetes', 'Heart Disease', 'Asthma', 'COPD', 'Arthritis', 'Dementia', 'Depression', 'Kidney Disease'];

export default function AddPatientModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '', email: '', age: '', gender: 'other', phone: '',
    comorbidities: [], allergies: '', notes: '',
    emergencyContact: { name: '', phone: '', relation: '' },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const toggleComorbidity = (c) => setForm((p) => ({
    ...p,
    comorbidities: p.comorbidities.includes(c)
      ? p.comorbidities.filter((x) => x !== c)
      : [...p.comorbidities, c],
  }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await patientAPI.create({
        ...form,
        allergies: form.allergies.split(',').map((s) => s.trim()).filter(Boolean),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3><User size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Add New Patient</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        {error && <div className="alert-banner error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input id="patient-name" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. John Smith" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input id="patient-email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="patient@email.com" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input id="patient-age" type="number" min="0" max="130" value={form.age} onChange={(e) => set('age', e.target.value)} placeholder="75" />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select id="patient-gender" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input id="patient-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
          </div>
          <div className="form-group">
            <label className="form-label">Comorbidities</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {COMORBIDITIES.map((c) => (
                <button
                  key={c} type="button"
                  onClick={() => toggleComorbidity(c)}
                  className="btn btn-sm"
                  style={{
                    background: form.comorbidities.includes(c) ? 'var(--primary-glow)' : 'var(--bg-glass)',
                    border: `1px solid ${form.comorbidities.includes(c) ? 'var(--primary)' : 'var(--border)'}`,
                    color: form.comorbidities.includes(c) ? 'var(--primary-light)' : 'var(--text-secondary)',
                  }}
                >{c}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Allergies (comma separated)</label>
            <input id="patient-allergies" value={form.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="Penicillin, Sulfa, Aspirin" />
          </div>
          <div className="form-group">
            <label className="form-label">Emergency Contact Name</label>
            <input id="ec-name" value={form.emergencyContact.name} onChange={(e) => setForm((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, name: e.target.value } }))} placeholder="Jane Smith" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">EC Phone</label>
              <input id="ec-phone" value={form.emergencyContact.phone} onChange={(e) => setForm((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, phone: e.target.value } }))} placeholder="+1 555 000 0001" />
            </div>
            <div className="form-group">
              <label className="form-label">Relation</label>
              <input id="ec-relation" value={form.emergencyContact.relation} onChange={(e) => setForm((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, relation: e.target.value } }))} placeholder="Son / Daughter" />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="submit-patient" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
