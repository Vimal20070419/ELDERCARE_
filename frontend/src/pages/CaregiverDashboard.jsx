// pages/CaregiverDashboard.jsx — Main caregiver view
import { useState, useEffect } from 'react';
import { Plus, Users, Activity, AlertTriangle, TrendingUp, Brain } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PatientCard from '../components/PatientCard';
import AddPatientModal from '../components/AddPatientModal';
import NotificationBell from '../components/NotificationBell';
import { patientAPI, adherenceAPI } from '../services/api';
import useAuth from '../hooks/useAuth';
import useNotifications from '../hooks/useNotifications';

export default function CaregiverDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [enriched, setEnriched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Use first patient's ID for notification polling (simplified)
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(
    enriched[0]?._id, 30000
  );

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await patientAPI.list();
      const pts = res.data?.data || [];
      setPatients(pts);

      // Enrich each patient with adherence rate + medication count + AI Risk Score
      const enriched = await Promise.all(pts.map(async (p) => {
        try {
          const [statsRes, aiRes] = await Promise.all([
            adherenceAPI.getWeeklyStats(p._id),
            patientAPI.getAIInsights(p._id)
          ]);
          
          const s = statsRes.data?.data || [];
          const total = s.reduce((acc, m) => acc + m.total, 0);
          const taken = s.reduce((acc, m) => acc + m.taken, 0);
          const rate = total > 0 ? Math.round((taken / total) * 100) : null;
          
          return { 
            ...p, 
            adherenceRate: rate, 
            medicationCount: s.length,
            riskScore: aiRes.data?.data?.healthRiskScore || 0,
            riskLevel: aiRes.data?.data?.riskLevel || 'Low'
          };
        } catch (err) {
          return { ...p, adherenceRate: null, medicationCount: 0, riskScore: 0, riskLevel: 'Low' };
        }
      }));

      // Sort by Priority (Risk Score DESC)
      const sorted = [...enriched].sort((a, b) => b.riskScore - a.riskScore);
      setEnriched(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const avgAdherence = enriched.filter((p) => p.adherenceRate !== null);
  const avgRate = avgAdherence.length
    ? Math.round(avgAdherence.reduce((s, p) => s + p.adherenceRate, 0) / avgAdherence.length)
    : '--';

  return (
    <div className="app-shell">
      <Sidebar unreadCount={unreadCount} />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h2>Caregiver Dashboard</h2>
            <p>Welcome back, {user?.name}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={markRead}
              onMarkAll={markAllRead}
            />
            <button id="add-patient-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} /> Add Patient
            </button>
          </div>
        </div>

        <div className="page-body">
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon indigo"><Users size={20} color="var(--primary-light)" /></div>
              <span className="stat-label">Active Patients</span>
              <span className="stat-value indigo">{patients.length}</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><TrendingUp size={20} color="var(--success-light)" /></div>
              <span className="stat-label">Avg Adherence</span>
              <span className="stat-value green">{typeof avgRate === 'number' ? `${avgRate}%` : avgRate}</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber"><AlertTriangle size={20} color="var(--warning-light)" /></div>
              <span className="stat-label">Notifications</span>
              <span className="stat-value amber">{unreadCount}</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon indigo"><Activity size={20} color="var(--primary-light)" /></div>
              <span className="stat-label">Total Medications</span>
              <span className="stat-value indigo">{enriched.reduce((s, p) => s + (p.medicationCount || 0), 0)}</span>
            </div>
          </div>

          {/* Patient Grid */}
          <div className="section-header">
            <h3><Brain size={18} /> AI Priority Monitor</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Patients sorted by Health Risk Score</p>
          </div>

          {loading ? (
            <div className="patient-grid">
              {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}
            </div>
          ) : enriched.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <p>No patients yet. Add your first patient to get started.</p>
              <button className="btn btn-primary" style={{ margin: '16px auto 0' }} onClick={() => setShowModal(true)}>
                <Plus size={16} /> Add Patient
              </button>
            </div>
          ) : (
            <div className="patient-grid">
              {enriched.map((p) => <PatientCard key={p._id} patient={p} />)}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AddPatientModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchPatients(); }}
        />
      )}
    </div>
  );
}
