// components/AddMedicationModal.jsx
import { useState, useRef } from 'react';
import { X, Pill, Camera, Plus, Trash2 } from 'lucide-react';
import { medicationAPI, ocrAPI } from '../services/api';

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Every 4 hours', 'Every 6 hours', 'Weekly', 'As needed'];

const emptyForm = () => ({
  name: '', brandName: '', dosage: '', frequency: 'Once daily',
  times: ['08:00'], startDate: '', endDate: '', instructions: '',
});

export default function AddMedicationModal({ patientId, onClose, onSuccess }) {
  const [forms, setForms] = useState([emptyForm()]);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [activeOcrIndex, setActiveOcrIndex] = useState(null);

  const setField = (index, field, value) => {
    const newForms = [...forms];
    newForms[index][field] = value;
    setForms(newForms);
  };

  const updateTime = (formIndex, timeIndex, val) => {
    const newForms = [...forms];
    newForms[formIndex].times[timeIndex] = val;
    setForms(newForms);
  };

  const addTime = (index) => {
    const newForms = [...forms];
    newForms[index].times.push('12:00');
    setForms(newForms);
  };

  const removeTime = (formIndex, timeIndex) => {
    const newForms = [...forms];
    newForms[formIndex].times = newForms[formIndex].times.filter((_, i) => i !== timeIndex);
    setForms(newForms);
  };

  const addMedicationForm = () => setForms([...forms, emptyForm()]);
  const removeMedicationForm = (index) => setForms(forms.filter((_, i) => i !== index));

  const triggerBulkOCR = () => {
    fileInputRef.current?.click();
  };

  const handleBulkOCRScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('patientId', patientId);
      
      const res = await ocrAPI.scan(formData, true); // Request dryRun=true preview
      const parsedMedications = res.data.data.medications;
      
      if (!parsedMedications || parsedMedications.length === 0) {
         throw new Error('No valid medications found in document.');
      }

      const newForms = parsedMedications.map(med => ({
        ...emptyForm(),
        name: med.name || '',
        dosage: med.dosage || '',
        frequency: med.frequency || 'Once daily',
        instructions: med.instructions || '',
        times: med.times || ['08:00']
      }));

      setForms(newForms);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process document');
    } finally {
      setOcrLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError('');
    try {
      // Execute all additions concurrently
      await Promise.all(
        forms.map(form => medicationAPI.add({ ...form, patientId }))
      );
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add medications. Please ensure all names and dosages are filled correctly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 650, position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {ocrLoading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}>
            <span className="spinner" style={{ width: 40, height: 40, borderBottomColor: 'var(--primary)', marginBottom: 12 }} />
            <p style={{ fontWeight: 600, color: 'var(--primary)' }}>Scanning prescription...</p>
          </div>
        )}
        <div className="modal-header" style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3><Pill size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Add Medications</h3>
            <span className="badge" style={{ background: 'var(--surface-active)' }}>{forms.length} {forms.length === 1 ? 'item' : 'items'}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={triggerBulkOCR} style={{ marginLeft: 'auto', marginRight: 16 }}>
              <Camera size={14} /> Scan Document
            </button>
            <input type="file" accept="image/*,application/pdf" ref={fileInputRef} onChange={handleBulkOCRScan} style={{ display: 'none' }} />
          </div>
          <button className="modal-close" onClick={onClose} disabled={ocrLoading}><X size={20} /></button>
        </div>
        
        {error && <div className="alert-banner error" style={{ margin: '16px 24px 0' }}>{error}</div>}
        
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
            {forms.map((form, index) => (
              <div key={index} style={{ marginBottom: 32, padding: 24, background: 'var(--bg-input)', borderRadius: 12, border: '1px solid var(--border-strong)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h4 style={{ margin: 0, color: 'var(--primary-light)', fontSize: '1.05rem' }}>Medication #{index + 1}</h4>
                  <div style={{ display: 'flex', gap: 8 }}>

                    {forms.length > 1 && (
                      <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => removeMedicationForm(index)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Drug Name *</label>
                    <input required value={form.name} onChange={(e) => setField(index, 'name', e.target.value)} placeholder="e.g. Warfarin" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Brand Name</label>
                    <input value={form.brandName} onChange={(e) => setField(index, 'brandName', e.target.value)} placeholder="e.g. Coumadin" />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Dosage *</label>
                    <input required value={form.dosage} onChange={(e) => setField(index, 'dosage', e.target.value)} placeholder="e.g. 5mg" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Frequency *</label>
                    <select value={form.frequency} onChange={(e) => setField(index, 'frequency', e.target.value)}>
                      {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Dose Times</label>
                  {form.times.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <input type="time" value={t} onChange={(e) => updateTime(index, i, e.target.value)} style={{ flex: 1 }} />
                      {form.times.length > 1 && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeTime(index, i)}>×</button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => addTime(index)}>+ Add time</button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" value={form.startDate} onChange={(e) => setField(index, 'startDate', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input type="date" value={form.endDate} onChange={(e) => setField(index, 'endDate', e.target.value)} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Instructions</label>
                  <textarea
                    value={form.instructions}
                    onChange={(e) => setField(index, 'instructions', e.target.value)}
                    rows={2}
                    placeholder="Take with food. Avoid grapefruit."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            ))}
            
            <button type="button" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '12px', border: '2px dashed var(--border)' }} onClick={addMedicationForm}>
              <Plus size={18} /> Add Another Medication
            </button>
          </div>

          <div className="form-actions" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: '#fff' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
               {loading ? <span className="spinner" /> : `Save All Medications (${forms.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
