// pages/PatientDetail.jsx — Single patient: meds, adherence charts, interaction flags
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Pill, AlertTriangle, FileText, TrendingUp, User, Brain, Sparkles, ShieldCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MedicationCard from '../components/MedicationCard';
import AddMedicationModal from '../components/AddMedicationModal';
import InteractionBadge from '../components/InteractionBadge';
import { DailyAdherenceChart, MedAdherenceChart } from '../components/AdherenceChart';
import NotificationBell from '../components/NotificationBell';
import { patientAPI, medicationAPI, adherenceAPI, interactionAPI } from '../services/api';
import useNotifications from '../hooks/useNotifications';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [meds, setMeds] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMed, setShowAddMed] = useState(false);
  const [activeTab, setActiveTab] = useState('medications');

  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(id);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ptRes, medRes, wRes, pRes, iRes, aiRes] = await Promise.all([
        patientAPI.getById(id),
        medicationAPI.getByPatient(id),
        adherenceAPI.getWeeklyStats(id),
        adherenceAPI.getMissedPatterns(id),
        interactionAPI.getByPatient(id),
        patientAPI.getAIInsights(id)
      ]);
      setPatient(ptRes.data?.data);
      setMeds(medRes.data?.data || []);
      setWeeklyStats(wRes.data?.data || []);
      setPatterns(pRes.data?.data || []);
      setInteractions(iRes.data?.data || []);
      setAiData(aiRes.data?.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [id]);

  const totalRate = (() => {
    const total = weeklyStats.reduce((s, m) => s + m.total, 0);
    const taken = weeklyStats.reduce((s, m) => s + m.taken, 0);
    return total > 0 ? Math.round((taken / total) * 100) : '--';
  })();

  const name = patient?.userId?.name || 'Patient';

  // Build daily chart data from weekly stats average (demo)
  const chartData = weeklyStats.length > 0 ? weeklyStats.map((m) => ({
    date: m.name.slice(0, 8),
    taken: m.taken,
    missed: m.missed + m.skipped,
    rate: m.rate,
  })) : [];

  const tabs = [
    { id: 'medications', label: 'Medications',  icon: Pill, count: meds.length },
    { id: 'adherence',   label: 'Adherence',    icon: TrendingUp, count: null },
    { id: 'ai',          label: 'AI Insights',  icon: Brain, count: null },
    { id: 'interactions',label: 'Interactions', icon: AlertTriangle, count: interactions.filter(f => !f.acknowledged).length || null },
    { id: 'patterns',    label: 'Patterns',     icon: User, count: patterns.length || null },
  ];

  if (loading) return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content"><div className="page-body"><div className="spinner" style={{ margin: '40px auto' }} /></div></div>
    </div>
  );

  const riskColor = (score) => {
    if (score >= 60) return 'var(--danger-light)';
    if (score >= 30) return 'var(--warning-light)';
    return 'var(--success-light)';
  };

  return (
    <div className="app-shell">
      <Sidebar unreadCount={unreadCount} />
      <div className="main-content">
        <div className="dashboard-layout">
          {/* Main Detail Area */}
          <div className="main-feed">
            <div className="page-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="btn btn-ghost btn-icon" onClick={() => navigate('/dashboard')} style={{ background: 'var(--bg-deep)' }}><ArrowLeft size={18} /></button>
                <div>
                  <h2>{name}</h2>
                  <p>Age {patient?.age || 'N/A'} · {patient?.comorbidities?.join(', ') || 'No primary conditions listed'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button id="add-med-btn" className="btn btn-primary" onClick={() => setShowAddMed(true)}>
                  <Plus size={16} /> Add Medication
                </button>
              </div>
            </div>

            <div className="page-body">
              {/* Top Metrics Row */}
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 32 }}>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'var(--primary-glow)' }}><TrendingUp size={24} color="var(--primary)" /></div>
                  <div className="stat-info">
                    <span className="stat-label">Adherence</span>
                    <span className="stat-value" style={{
                      color: typeof totalRate === 'number'
                        ? totalRate >= 80 ? 'var(--success)'
                        : totalRate >= 60 ? 'var(--warning)'
                        : 'var(--danger)'
                        : 'var(--text-muted)'
                    }}>{typeof totalRate === 'number' ? `${totalRate}%` : totalRate}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'var(--success-bg)' }}><Pill size={24} color="var(--success)" /></div>
                  <div className="stat-info">
                    <span className="stat-label">Active Meds</span>
                    <span className="stat-value">{meds.filter((m) => m.status === 'active').length}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: riskColor(aiData?.healthRiskScore || 0).replace('light', 'bg') }}><Brain size={24} color={riskColor(aiData?.healthRiskScore || 0)} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Risk Score</span>
                    <span className="stat-value" style={{ color: riskColor(aiData?.healthRiskScore || 0) }}>{aiData ? aiData.healthRiskScore : '--'}</span>
                  </div>
                </div>
              </div>

              {/* Functional Tabs */}
              <div style={{ display: 'flex', gap: 24, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
                {tabs.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    className="btn btn-ghost"
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      borderBottom: activeTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                      borderRadius: 0, padding: '12px 4px',
                      color: activeTab === t.id ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: 700, fontSize: '0.95rem'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {activeTab === 'medications' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                  {meds.map((m) => <MedicationCard key={m._id} med={m} onRefresh={loadAll} />)}
                </div>
              )}

              {activeTab === 'adherence' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <MedAdherenceChart data={weeklyStats} />
                  <DailyAdherenceChart data={chartData} />
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="card" style={{ borderLeft: '4px solid var(--primary)', padding: 32 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                     <Sparkles size={24} color="var(--primary)" />
                     <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Healthcare AI Observations</h3>
                   </div>
                   {aiData?.behavioralInsights?.map((insight, idx) => (
                     <div key={idx} style={{ padding: '16px 20px', background: 'var(--bg-deep)', borderRadius: 12, marginBottom: 12, fontSize: '0.95rem', lineHeight: 1.5 }}>
                       {insight}
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>

          {/* Clinical Context Panel */}
          <aside className="right-panel">
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h4>Security & Safety</h4>
                {interactions.length > 0 && <span className="badge badge-danger" style={{ borderRadius: 6 }}>CRITICAL FLAG</span>}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {interactions.length === 0 ? (
                  <div style={{ padding: 24, background: 'var(--success-bg)', borderRadius: 16, textAlign: 'center' }}>
                    <ShieldCheck size={32} color="var(--success)" style={{ marginBottom: 8 }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--success-dark)', fontWeight: 700 }}>No drug interactions</p>
                  </div>
                ) : (
                  interactions.map((f) => <InteractionBadge key={f._id} flag={f} onRefresh={loadAll} />)
                )}
              </div>
            </div>

            <div style={{ marginBottom: 40 }}>
              <h4>Behavioral Patterns</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {patterns.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No recurring missed dose patterns detected.</p>
                ) : (
                  patterns.map((p) => (
                    <div key={p.medicationId} className="card" style={{ padding: 16, borderLeft: `4px solid ${p.severity === 'high' ? 'var(--danger)' : 'var(--warning)'}` }}>
                      <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>{p.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        {p.severity.toUpperCase()} PRIORITY · {p.twoWeekRate}% adherence
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <button className="btn btn-secondary" style={{ width: '100%', padding: 14 }} onClick={() => navigate(`/reports/${id}`)}>
                <FileText size={18} /> Generate Clinical Report
              </button>
            </div>
          </aside>
        </div>
      </div>

      {showAddMed && (
        <AddMedicationModal
          patientId={id}
          onClose={() => setShowAddMed(false)}
          onSuccess={() => { setShowAddMed(false); loadAll(); }}
        />
      )}
    </div>
  );
}
