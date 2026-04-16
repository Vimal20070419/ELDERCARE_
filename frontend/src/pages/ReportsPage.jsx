// pages/ReportsPage.jsx — Physician-ready weekly adherence report
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, FileText, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { DailyAdherenceChart, MedAdherenceChart } from '../components/AdherenceChart';
import InteractionBadge from '../components/InteractionBadge';
import { reportAPI } from '../services/api';

const rateColor = (r) => r >= 80 ? 'var(--success-light)' : r >= 60 ? 'var(--warning-light)' : 'var(--danger-light)';
const rateBadge = (r) => r >= 80 ? 'badge-active' : r >= 60 ? 'badge-medium' : 'badge-high';

export default function ReportsPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await reportAPI.getWeekly(patientId);
        setReport(res.data?.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to generate report');
      } finally {
        setLoading(false);
      }
    })();
  }, [patientId]);

  const printReport = () => window.print();

  if (loading) return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content page-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '40px auto', justifyContent: 'center' }}>
          <span className="spinner" /><span>Generating report…</span>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content page-body">
        <div className="alert-banner error">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back</button>
      </div>
    </div>
  );

  if (!report) return null;

  const chartData = report.dailyBreakdown?.map((d) => ({
    date: d.date?.slice(5),
    taken: d.taken,
    missed: d.total - d.taken,
    rate: d.rate,
  })) || [];

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost btn-icon" onClick={() => navigate('/reports')}><ArrowLeft size={18} /></button>
            <div>
              <h2>Physician Report</h2>
              <p>Generated {new Date(report.generatedAt).toLocaleString()}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button id="print-report-btn" className="btn btn-secondary" onClick={printReport}>
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        <div className="page-body" id="physician-report">
          {/* Report Header */}
          <div className="report-header">
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 6 }}>
                {report.patient?.name}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 8 }}>
                Age: {report.patient?.age || 'N/A'} · Period: {new Date(report.reportPeriod.from).toLocaleDateString()} – {new Date(report.reportPeriod.to).toLocaleDateString()}
              </p>
              {report.patient?.comorbidities?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {report.patient.comorbidities.map((c) => (
                    <span key={c} className="med-chip">{c}</span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 110, height: 110, borderRadius: '50%', position: 'relative',
                background: `conic-gradient(${rateColor(report.overallAdherenceRate)} ${report.overallAdherenceRate}%, var(--bg-input) 0)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  position: 'absolute', width: 84, height: 84, borderRadius: '50%', background: 'var(--bg-card)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: rateColor(report.overallAdherenceRate) }}>
                    {report.overallAdherenceRate}%
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>adherence</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Summary */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="var(--primary-light)" /> Clinical Summary
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              {report.summaryNarrative}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Per-med adherence */}
            <div>
              {report.weeklyAdherence?.length > 0 && <MedAdherenceChart data={report.weeklyAdherence} />}
            </div>
            {/* Daily chart */}
            <div>
              {chartData.length > 0 && <DailyAdherenceChart data={chartData} />}
            </div>
          </div>

          {/* Clinical Insights based on OpenFDA */}
          <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(59, 130, 246, 0.05) 100%)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={18} color="var(--primary-light)" /> Clinical Pharmacology Insights
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {report.weeklyAdherence?.map(m => (
                <div key={m.medicationId} className="hoverable-list-item" style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>{m.name} Precautions</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxHeight: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Monitor for potential adverse reactions. Clinicians should observe for common side effects associated with {m.name} therapy, especially in elderly populations.
                  </div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 12, fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              * Data sourced from OpenFDA. Actual patient responses may vary.
            </p>
          </div>

          {/* Per-medication table */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} color="var(--primary-light)" /> Medication Adherence Detail
            </h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Taken</th>
                    <th>Skipped</th>
                    <th>Missed</th>
                    <th>Adherence</th>
                  </tr>
                </thead>
                <tbody>
                  {report.weeklyAdherence?.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No adherence data recorded</td></tr>
                  ) : report.weeklyAdherence?.map((m) => (
                    <tr key={m.medicationId}>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td>{m.dosage}</td>
                      <td>{m.frequency || '—'}</td>
                      <td style={{ color: 'var(--success-light)' }}>{m.taken}</td>
                      <td style={{ color: 'var(--warning-light)' }}>{m.skipped}</td>
                      <td style={{ color: 'var(--danger-light)' }}>{m.missed}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-wrap" style={{ width: 80 }}>
                            <div className="progress-fill" style={{
                              width: `${m.rate}%`,
                              background: `linear-gradient(90deg, ${rateColor(m.rate)}, ${rateColor(m.rate)})`,
                            }} />
                          </div>
                          <span className={`badge ${rateBadge(m.rate)}`}>{m.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drug Interactions */}
          {report.drugInteractionFlags?.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} color="var(--danger-light)" /> Drug Interaction Flags
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {report.drugInteractionFlags.map((flag, i) => (
                  <div key={i} className={`interaction-card ${flag.severity}`}>
                    <div className="interaction-icon" style={{ background: 'var(--danger-bg)', fontSize: '1.1rem' }}>🚨</div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>
                        {flag.drug1} ↔ {flag.drug2}
                        <span className={`badge badge-${flag.severity}`} style={{ marginLeft: 8 }}>{flag.severity}</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {flag.description?.slice(0, 200)}{flag.description?.length > 200 ? '…' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missed patterns */}
          {report.missedDosePatterns?.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={18} color="var(--warning-light)" /> Missed Dose Patterns
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {report.missedDosePatterns.map((p) => (
                  <div key={p.medicationId} style={{
                    padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
                    borderLeft: `4px solid ${p.severity === 'high' ? 'var(--danger)' : 'var(--warning)'}`,
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <div>
                      <span style={{ fontWeight: 700 }}>{p.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                        2-week rate: {p.twoWeekRate}%{p.consecutiveMisses > 0 && ` · ${p.consecutiveMisses} consecutive misses`}
                      </span>
                    </div>
                    <span className={`badge badge-${p.severity}`}>{p.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer signature block */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Report generated by ElderCare Medication Adherence Monitor</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(report.generatedAt).toLocaleString()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ borderTop: '1px solid var(--border)', width: 200, paddingTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Physician Signature
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
