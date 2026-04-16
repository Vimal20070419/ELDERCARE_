// components/AdherenceChart.jsx — recharts adherence visualisations
import {
  ResponsiveContainer, ComposedChart,
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      fontSize: '0.8rem',
    }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}{p.name.toLowerCase().includes('rate') ? '%' : ''}
        </p>
      ))}
    </div>
  );
};

export function DailyAdherenceChart({ data }) {
  return (
    <div className="chart-wrap">
      <p className="chart-title">📅 Daily Adherence — Last 7 Days</p>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }} />
          <Bar dataKey="taken" name="Taken" fill="var(--success)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="missed" name="Missed" fill="var(--danger)" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="rate" name="Rate %" stroke="var(--primary-light)" strokeWidth={2} dot={{ fill: 'var(--primary)', r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MedAdherenceChart({ data }) {
  return (
    <div className="chart-wrap">
      <p className="chart-title">💊 Per-Medication Adherence Rate (Weekly)</p>
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 50)}>
        <ComposedChart data={data} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} unit="%" />
          <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={80} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="rate" name="Adherence %" fill="var(--primary)" radius={[0, 4, 4, 0]} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
