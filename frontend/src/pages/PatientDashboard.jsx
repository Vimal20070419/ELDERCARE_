// pages/PatientDashboard.jsx — Patient-facing medication check-in interface
import { useState, useEffect } from 'react';
import { Activity, Bell, TrendingUp } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import CheckInPanel from '../components/CheckInPanel';
import NotificationBell from '../components/NotificationBell';
import { DailyAdherenceChart } from '../components/AdherenceChart';
import { patientAPI, medicationAPI, adherenceAPI } from '../services/api';
import useAuth from '../hooks/useAuth';
import useNotifications from '../hooks/useNotifications';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [meds, setMeds] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const ptRes = await patientAPI.getProfile();
        const pt = ptRes.data?.data;
        setPatient(pt);
        if (pt) {
          const [medRes, statsRes] = await Promise.all([
            medicationAPI.getByPatient(pt._id, 'active'),
            adherenceAPI.getWeeklyStats(pt._id),
          ]);
          setMeds(medRes.data?.data || []);
          setWeeklyStats(statsRes.data?.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(patient?._id);

  const totalRate = (() => {
    const total = weeklyStats.reduce((s, m) => s + m.total, 0);
    const taken = weeklyStats.reduce((s, m) => s + m.taken, 0);
    return total > 0 ? Math.round((taken / total) * 100) : null;
  })();

  const chartData = weeklyStats.map((m) => ({
    date: m.name?.slice(0, 8) || 'Med',
    taken: m.taken,
    missed: m.missed + m.skipped,
    rate: m.rate,
  }));

  const rateColor = totalRate === null ? 'var(--text-muted)'
    : totalRate >= 80 ? 'var(--success-light)'
    : totalRate >= 60 ? 'var(--warning-light)'
    : 'var(--danger-light)';  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="dashboard-layout">
          {/* Main Feed */}
          <div className="main-feed">
            <div className="page-header">
              <div>
                <h2>My Health Hub</h2>
                <p>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}</p>
              </div>
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkRead={markRead}
                onMarkAll={markAllRead}
              />
            </div>

            <div className="page-body">
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  {/* Hero Metric Section */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: 24 }}>
                    <div className="card" style={{ 
                      textAlign: 'center', 
                      padding: '32px',
                      boxShadow: 'var(--shadow-premium)',
                      background: 'white'
                    }}>
                      <div style={{
                        width: 120, height: 120, borderRadius: '50%', margin: '0 auto 20px',
                        background: `conic-gradient(${rateColor} ${totalRate || 0}%, var(--bg-input) 0)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative',
                        boxShadow: `0 0 20px -5px ${rateColor}44`
                      }}>
                        <div style={{
                          position: 'absolute', width: 96, height: 96, borderRadius: '50%',
                          background: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexDirection: 'column',
                          fontWeight: 800, fontSize: '1.4rem', color: rateColor
                        }}>
                          {totalRate !== null ? `${totalRate}%` : 'N/A'}
                          <div style={{ fontSize: '0.6rem', opacity: 0.6, fontWeight: 700 }}>WEEKLY</div>
                        </div>
                      </div>
                      <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Adherence Health</h3>
                    </div>

                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>ADHERENCE TREND</h4>
                      {chartData.length > 0 && <DailyAdherenceChart data={chartData} />}
                    </div>
                  </div>

                  {/* Active Task (Check-In) */}
                  <div style={{ maxWidth: '800px' }}>
                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Today's Schedule</h3>
                    </div>
                    <CheckInPanel
                      medications={meds}
                      patientId={patient?._id}
                      onCheckedIn={() => {}}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <aside className="right-panel">
            <div style={{ marginBottom: 40 }}>
              <h4>My Prescriptions</h4>
              {meds.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active medications.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {meds.map((m) => (
                    <div key={m._id} className="card" style={{ padding: '16px', background: 'var(--bg-deep)', border: 'none', boxShadow: 'none' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>{m.dosage} · {m.frequency}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {m.times?.map((t) => <span key={t} className="time-pill" style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--primary)' }}>{t}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4>Upcoming Alerts</h4>
              <div className="card" style={{ padding: 16, borderLeft: '4px solid var(--primary)' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Refill Reminder</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Atorvastatin refill due in 3 days.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
