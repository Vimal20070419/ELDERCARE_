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
            Age {patient.age || 'N/A'}
            {patient.comorbidities?.length > 0 && ` · ${patient.comorbidities.slice(0,2).join(', ')}`}
          </div>
        </div>
        <ChevronRight size={18} color="var(--text-muted)" />
      </div>

      <div className="patient-stats">
        <div className="patient-stat">
          <div className="value">{meds}</div>
          <div className="label">Meds</div>
        </div>
        <div className="patient-stat">
          <div className="value" style={{ color: rate >= 80 ? 'var(--success-light)' : rate >= 60 ? 'var(--warning-light)' : 'var(--danger-light)' }}>
            {typeof rate === 'number' ? `${rate}%` : rate}
          </div>
          <div className="label">Adherence</div>
        </div>
        <div className="patient-stat">
          <div className="value" style={{ color: riskColor, display: 'flex', alignItems: 'center', gap: 4 }}>
             <Brain size={12} /> {risk}
          </div>
          <div className="label">Risk Score</div>
        </div>
      </div>

      {patient.comorbidities?.length > 0 && (
        <div className="med-detail">
          {patient.comorbidities.slice(0,3).map((c) => (
            <span key={c} className="med-chip">{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}
