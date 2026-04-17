// components/PatientCard.jsx
import { useNavigate } from 'react-router-dom';
import { User, ChevronRight, Brain } from 'lucide-react';

export default function PatientCard({ patient }) {
  const navigate = useNavigate();
  const name = patient.userId?.name || 'Unknown';
  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const meds = patient.medicationCount || 0;
  const rate = patient.adherenceRate ?? '--';
  const risk = patient.riskScore ?? 0;
  const riskLevel = patient.riskLevel || 'Low';

  const riskColor = risk >= 60 ? 'var(--danger-light)' : risk >= 30 ? 'var(--warning-light)' : 'var(--success-light)';

  return (
    <div
      className="patient-card"
      id={`patient-card-${patient._id}`}
      onClick={() => navigate(`/patients/${patient._id}`)}
    >
      <div className="patient-card-header">
        <div className="patient-avatar">{initials}</div>
        <div style={{ flex: 1 }}>
          <div className="patient-name">{name}</div>
          <div className="patient-meta">
            Age {patient.age || 'N/A'} · {rate >= 80 ? 'Good Adherence' : 'Needs Attention'}
          </div>
        </div>
        <ChevronRight size={20} color="var(--text-muted)" />
      </div>

      <div className="patient-stats">
        <div className="patient-stat">
          <span className="value">{meds}</span>
          <span className="label">Meds</span>
        </div>
        <div className="patient-stat">
          <span className="value">{typeof rate === 'number' ? `${rate}%` : rate}</span>
          <span className="label">Adherence</span>
        </div>
        <div className="patient-stat">
          <span className="value" style={{ color: riskColor, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Brain size={14} /> {risk}
          </span>
          <span className="label">Risk</span>
        </div>
      </div>

      {patient.comorbidities?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {patient.comorbidities.slice(0,3).map((c) => (
            <span key={c} className="med-chip" style={{ fontSize: '0.65rem', padding: '4px 10px' }}>{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}
