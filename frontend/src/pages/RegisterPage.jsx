// pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { authAPI } from '../services/api';
import useAuth from '../hooks/useAuth';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'caregiver' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authAPI.register(form);
      const { token, user } = res.data.data;
      login(token, user);
      navigate(user.role === 'patient' ? '/patient' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Activity size={28} color="#fff" /></div>
          <h1>Create Account</h1>
          <p>ElderCare Medication Monitor</p>
        </div>

        {error && <div className="alert-banner error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="reg-name" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Dr. Jane Smith" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="reg-email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input id="reg-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="reg-password" type="password" required minLength={6} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="At least 6 characters" />
          </div>
          <div className="form-group">
            <label className="form-label">I am a...</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {['doctor', 'caregiver', 'patient'].map((r) => (
                <button
                  key={r} type="button"
                  onClick={() => set('role', r)}
                  className="btn btn-sm"
                  style={{
                    padding: '10px',
                    background: form.role === r ? 'var(--primary-glow)' : 'var(--bg-glass)',
                    border: `1px solid ${form.role === r ? 'var(--primary)' : 'var(--border)'}`,
                    color: form.role === r ? 'var(--primary-light)' : 'var(--text-secondary)',
                    textTransform: 'capitalize', fontSize: '0.82rem',
                  }}
                >
                  {r === 'caregiver' ? '👨‍⚕️ Care' : r === 'doctor' ? '🩺 Doc' : '🧓 Pat'}
                </button>
              ))}
            </div>
          </div>
          <button id="reg-submit" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
