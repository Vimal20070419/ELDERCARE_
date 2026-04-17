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
      <Sidebar />
      <div className="main-content">
        <div className="dashboard-layout">
          {/* Center Content */}
          <div className="main-feed">
            <div className="page-header">
              <div>
                <h2>Healthcare Dashboard</h2>
                <p>Welcome back, {user?.name.split(' ')[0]}</p>
              </div>
              <button id="add-patient-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={18} /> Add Patient
              </button>
            </div>

            <div className="page-body">
              {/* Summary Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(37,99,235,0.1)' }}><Users size={24} color="var(--primary)" /></div>
                  <div className="stat-info">
                    <span className="stat-label">Total Patients</span>
                    <span className="stat-value">{patients.length}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}><TrendingUp size={24} color="var(--success)" /></div>
                  <div className="stat-info">
                    <span className="stat-label">Avg Adherence</span>
                    <span className="stat-value">{typeof avgRate === 'number' ? `${avgRate}%` : avgRate}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}><AlertTriangle size={24} color="var(--warning)" /></div>
                  <div className="stat-info">
                    <span className="stat-label">Alerts</span>
                    <span className="stat-value">{unreadCount}</span>
                  </div>
                </div>
              </div>

              {/* Patient List */}
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Priority Monitor</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sorted by Health Risk Score</div>
              </div>

              {loading ? (
                <div className="patient-grid">
                  {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}
                </div>
              ) : enriched.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} />
                  <p>No patients yet. Add your first patient to get started.</p>
                </div>
              ) : (
                <div className="patient-grid">
                  {enriched.map((p) => <PatientCard key={p._id} patient={p} />)}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <aside className="right-panel">
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h4>Active Alerts</h4>
                <NotificationBell
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkRead={markRead}
                  onMarkAll={markAllRead}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 20, background: 'var(--bg-deep)', borderRadius: 12, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    All clear! No critical alerts.
                  </div>
                ) : (
                  notifications.slice(0, 3).map((n) => (
                    <div key={n._id} className="card" style={{ padding: 16, borderLeft: '4px solid var(--danger)' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{n.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h4>Upcoming Tasks</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Weekly Review - James</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 20, marginTop: 4 }}>Due at 2:00 PM</p>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Medication Checkup</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 20, marginTop: 4 }}>Due Tomorrow</p>
                </div>
              </div>
            </div>
          </aside>
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
