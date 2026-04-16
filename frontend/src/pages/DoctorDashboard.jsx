// pages/DoctorDashboard.jsx — Clinic-wide oversight for Doctors
import { useState, useEffect } from 'react';
import { Users, Activity, Heart, Search, FileText, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import AddPatientModal from '../components/AddPatientModal';
import { patientAPI } from '../services/api';
import useAuth from '../hooks/useAuth';
import useNotifications from '../hooks/useNotifications';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(null); // Doctors don't have a linked patientId

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await patientAPI.listAll ? await patientAPI.listAll() : await patientAPI.list(); 
      // Note: need to ensure patientAPI.listAll is defined in services/api.js
      setPatients(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = patients.filter((p) => 
    p.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.userId?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h2>Clinic Oversight</h2>
            <p>Dr. {user?.name} — Clinical Dashboard</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
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
          {/* Global Stats */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-icon indigo"><Users size={20} /></div>
              <span className="stat-label">Total Patients</span>
              <span className="stat-value indigo">{patients.length}</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><Activity size={20} /></div>
              <span className="stat-label">Medications Monitored</span>
              <span className="stat-value green">--</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon red"><Heart size={20} /></div>
              <span className="stat-label">Critical Alerts</span>
              <span className="stat-value red">0</span>
            </div>
          </div>

          <div className="section-header" style={{ marginBottom: 16 }}>
            <h3><Users size={18} /> Patient Directory</h3>
            <div style={{ position: 'relative', width: 300 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                placeholder="Search by name or email..." 
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
                    <th>Patient Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Comorbidities</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1,2,3].map(i => <tr key={i}><td colSpan={5} className="skeleton" style={{ height: 50 }}></td></tr>)
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No patients found</td></tr>
                  ) : filtered.map((p) => (
                    <tr key={p._id} className="hoverable" onClick={() => navigate(`/patients/${p._id}`)}>
                      <td style={{ fontWeight: 600 }}>{p.userId?.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.userId?.email}</td>
                      <td>{p.age}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {p.comorbidities?.slice(0, 2).map(c => (
                            <span key={c} className="med-chip" style={{ fontSize: '0.7rem' }}>{c}</span>
                          ))}
                          {p.comorbidities?.length > 2 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{p.comorbidities.length-2} more</span>}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary-light)' }}>
                          View Reports <ChevronRight size={14} />
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

      {showModal && (
        <AddPatientModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchAll(); }}
        />
      )}
    </div>
  );
}
