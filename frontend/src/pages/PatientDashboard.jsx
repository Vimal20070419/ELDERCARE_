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
    : 'var(--danger-light)';

  return (
    <div className="app-shell">
      <Sidebar unreadCount={unreadCount} />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h2>My Medications</h2>
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
              {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
              {/* Left col: Check-in + stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Weekly rate card */}
                <div className="card" style={{ textAlign: 'center', padding: '28px' }}>
                  <div style={{
                    width: 100, height: 100, borderRadius: '50%', margin: '0 auto 16px',
                    background: `conic-gradient(${rateColor} ${totalRate || 0}%, var(--bg-input) 0)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', width: 76, height: 76, borderRadius: '50%',
                      background: 'var(--bg-card)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '1.2rem', color: rateColor,
                    }}>
                      {totalRate !== null ? `${totalRate}%` : 'N/A'}
                    </div>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '1rem' }}>Weekly Adherence</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {totalRate === null ? 'Start checking in to track your progress'
                     : totalRate >= 80 ? '🎉 Excellent! Keep it up.'
                     : totalRate >= 60 ? '⚠️ Getting there. Try not to miss doses.'
                     : '🚨 Low adherence. Please contact your caregiver.'}
                  </p>
                </div>

                {/* Check-in panel */}
                <CheckInPanel
                  medications={meds}
                  patientId={patient?._id}
                  onCheckedIn={() => {}} // Could refresh stats
                />
              </div>

              {/* Right col: Chart + med list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {chartData.length > 0 && <DailyAdherenceChart data={chartData} />}

                {/* All medications summary */}
                <div className="card">
                  <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={18} color="var(--primary-light)" /> My Prescriptions
                  </h3>
                  {meds.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No active medications.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {meds.map((m) => (
                        <div key={m._id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 14px', background: 'var(--bg-glass)',
                          borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                        }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.dosage} · {m.frequency}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {m.times?.map((t) => <span key={t} className="time-pill">{t}</span>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
