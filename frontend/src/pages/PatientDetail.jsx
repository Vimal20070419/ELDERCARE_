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
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost btn-icon" onClick={() => navigate('/dashboard')}><ArrowLeft size={18} /></button>
            <div>
              <h2>{name}</h2>
              <p>Age {patient?.age || 'N/A'} · {patient?.comorbidities?.join(', ') || 'No comorbidities listed'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <NotificationBell notifications={notifications} unreadCount={unreadCount} onMarkRead={markRead} onMarkAll={markAllRead} />
            <button
              id="generate-report-btn"
              className="btn btn-secondary"
              onClick={() => navigate(`/reports/${id}`)}
            >
              <FileText size={16} /> Report
            </button>
            <button id="add-med-btn" className="btn btn-primary" onClick={() => setShowAddMed(true)}>
              <Plus size={16} /> Add Medication
            </button>
          </div>
        </div>

        <div className="page-body">
          {/* Overview Stats */}
          <div className="stats-grid" style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr', marginBottom: 24, gap: 12 }}>
            <div className="stat-card" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Brain size={16} color="var(--primary-light)" />
                <span className="stat-label" style={{ marginBottom: 0 }}>Health Risk Score</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                 <span className="stat-value" style={{ color: riskColor(aiData?.healthRiskScore || 0) }}>
                   {aiData ? aiData.healthRiskScore : '--'}
                 </span>
                 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
              <p style={{ fontSize: '0.75rem', marginTop: 4, color: riskColor(aiData?.healthRiskScore || 0), fontWeight: 600 }}>
                 {aiData?.riskLevel} Risk
              </p>
            </div>
            <div className="stat-card">
              <span className="stat-label">Weekly Adherence</span>
              <span className="stat-value" style={{
                color: typeof totalRate === 'number'
                  ? totalRate >= 80 ? 'var(--success-light)'
                  : totalRate >= 60 ? 'var(--warning-light)'
                  : 'var(--danger-light)'
                  : 'var(--text-muted)'
              }}>{typeof totalRate === 'number' ? `${totalRate}%` : totalRate}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Active Meds</span>
              <span className="stat-value indigo">{meds.filter((m) => m.status === 'active').length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Interactions</span>
              <span className="stat-value" style={{ color: interactions.length > 0 ? 'var(--danger-light)' : 'var(--success-light)' }}>
                {interactions.length}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Patterns</span>
              <span className="stat-value" style={{ color: patterns.length > 0 ? 'var(--warning-light)' : 'var(--success-light)' }}>
                {patterns.length}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                className="btn btn-ghost"
                onClick={() => setActiveTab(t.id)}
                style={{
                  borderBottom: activeTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                  borderRadius: 0, color: activeTab === t.id ? 'var(--primary-light)' : 'var(--text-muted)',
                  paddingBottom: 10,
                }}
              >
                <t.icon size={15} /> {t.label}
                {t.count > 0 && (
                  <span style={{ background: 'var(--danger)', color: '#fff', borderRadius: '999px', padding: '0 6px', fontSize: '0.7rem', marginLeft: 4 }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'medications' && (
            <div>
              {meds.length === 0 ? (
                <div className="empty-state"><Pill size={40} /><p>No medications added yet.</p></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                  {meds.map((m) => <MedicationCard key={m._id} med={m} onRefresh={loadAll} />)}
                </div>
              )}
            </div>
          )}

          {activeTab === 'adherence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {chartData.length === 0 ? (
                <div className="empty-state"><TrendingUp size={40} /><p>No adherence data yet. Check-ins will appear here.</p></div>
              ) : (
                <>
                  <MedAdherenceChart data={weeklyStats} />
                  <DailyAdherenceChart data={chartData} />
                </>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
               <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                   <Sparkles size={20} color="var(--primary-light)" />
                   <h4 style={{ margin: 0 }}>Behavioral Observations</h4>
                 </div>
                 {aiData?.behavioralInsights?.length > 0 ? (
                   <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                     {aiData.behavioralInsights.map((insight, idx) => (
                       <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                         {insight}
                       </li>
                     ))}
                   </ul>
                 ) : (
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Insufficient data for deep behavioral analysis.</p>
                 )}
               </div>

               {aiData?.safetyIntelligence?.length > 0 && (
                 <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <AlertTriangle size={20} color="var(--danger-light)" />
                      <h4 style={{ margin: 0 }}>Safety Intelligence</h4>
                    </div>
                    <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                       {aiData.safetyIntelligence.map((warn, idx) => (
                         <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                           {warn}
                         </li>
                       ))}
                    </ul>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'interactions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {interactions.length === 0 ? (
                <div className="empty-state"><AlertTriangle size={40} /><p>No drug interaction flags detected.</p></div>
              ) : (
                interactions.map((f) => <InteractionBadge key={f._id} flag={f} onRefresh={loadAll} />)
              )}
            </div>
          )}

          {activeTab === 'patterns' && (
            <div>
              {patterns.length === 0 ? (
                <div className="empty-state"><User size={40} /><p>No missed dose patterns detected. Great adherence!</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {patterns.map((p) => (
                    <div key={p.medicationId} className="card" style={{
                      borderLeft: `4px solid ${p.severity === 'high' ? 'var(--danger)' : 'var(--warning)'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontWeight: 700 }}>{p.name}</p>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            2-week rate: <strong style={{ color: p.twoWeekRate < 60 ? 'var(--danger-light)' : 'var(--warning-light)' }}>{p.twoWeekRate}%</strong>
                            {p.consecutiveMisses > 0 && ` · ${p.consecutiveMisses} consecutive misses`}
                          </p>
                        </div>
                        <span className={`badge badge-${p.severity}`}>{p.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
