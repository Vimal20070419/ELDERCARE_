// pages/ReportsDashboard.jsx — Centralized clinician report hub
import { useState, useEffect } from 'react';
import { ClipboardList, Search, FileText, ChevronRight, Activity, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { patientAPI, adherenceAPI } from '../services/api';
import useAuth from '../hooks/useAuth';

const rateColor = (r) => r >= 80 ? 'var(--success-light)' : r >= 60 ? 'var(--warning-light)' : 'var(--danger-light)';

export default function ReportsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      // Fetch patients based on role
      const res = user.role === 'doctor' ? await patientAPI.listAll() : await patientAPI.list();
      const pts = res.data?.data || [];
      
      // Enrich with adherence summary for the reports list
      const enriched = await Promise.all(pts.map(async (p) => {
        try {
          const stats = await adherenceAPI.getWeeklyStats(p._id);
          const s = stats.data?.data || [];
          const total = s.reduce((acc, m) => acc + m.total, 0);
          const taken = s.reduce((acc, m) => acc + m.taken, 0);
          const rate = total > 0 ? Math.round((taken / total) * 100) : '--';
          return { ...p, adherenceRate: rate };
        } catch {
          return { ...p, adherenceRate: '--' };
        }
      }));
      setPatients(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReportsData(); }, []);

  const filtered = patients.filter((p) => 
    p.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h2>Reporting Hub</h2>
            <p>Clinician Oversight & Physician-Ready Summaries</p>
          </div>
        </div>

        <div className="page-body">
          <div className="section-header" style={{ marginBottom: 20 }}>
            <h3><ClipboardList size={18} /> Physician-Ready Reports</h3>
            <div style={{ position: 'relative', width: 280 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                placeholder="Find patient..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 38, fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Weekly Adherence</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Physician Report</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1,2,3].map(i => <tr key={i}><td colSpan={4} className="skeleton" style={{ height: 60 }}></td></tr>)
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No patients found</td></tr>
                  ) : filtered.map((p) => (
                    <tr key={p._id} className="hoverable" onClick={() => navigate(`/reports/${p._id}`)}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.userId?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.userId?.email}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontWeight: 700, color: rateColor(p.adherenceRate) }}>{p.adherenceRate}%</span>
                          <div className="progress-wrap" style={{ width: 100, height: 6 }}>
                             <div className="progress-fill" style={{ width: `${p.adherenceRate}%`, background: rateColor(p.adherenceRate) }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${p.adherenceRate >= 80 ? 'badge-active' : p.adherenceRate >= 60 ? 'badge-medium' : 'badge-high'}`}>
                          {p.adherenceRate >= 80 ? 'Stable' : p.adherenceRate >= 60 ? 'Needs Review' : 'Critical'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-outline btn-sm">
                          <FileText size={14} /> Open Summary
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
