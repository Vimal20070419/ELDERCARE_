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
    <div className="auth-split">
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-logo">
            <h1>Create Account</h1>
            <p>Join the CareMonitor network</p>
          </div>

          {error && <div className="alert-banner error" style={{ marginBottom: 24 }}>{error}</div>}

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
              <label className="form-label" style={{ marginBottom: 12 }}>I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, background: '#f1f5f9', padding: 4, borderRadius: 12 }}>
                {['doctor', 'caregiver', 'patient'].map((r) => (
                  <button
                    key={r} type="button"
                    onClick={() => set('role', r)}
                    className="btn btn-sm"
                    style={{
                      padding: '10px',
                      background: form.role === r ? 'white' : 'transparent',
                      color: form.role === r ? 'var(--primary)' : 'var(--text-secondary)',
                      boxShadow: form.role === r ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                      borderRadius: 10,
                      textTransform: 'capitalize', fontSize: '0.82rem', fontWeight: 600
                    }}
                  >
                    {r === 'caregiver' ? '👨‍⚕️ Care' : r === 'doctor' ? '🩺 Doc' : '🧓 Pat'}
                  </button>
                ))}
              </div>
            </div>

            <button id="reg-submit" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '12px' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '32px' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>Sign in here</Link>
          </div>
        </div>
      </div>

      <div className="auth-brand-side">
        <div className="auth-brand-overlay" />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ 
            width: 56, height: 56, background: 'rgba(255,255,255,0.2)', 
            borderRadius: 14, display: 'flex', alignItems: 'center', 
            justifyContent: 'center', marginBottom: 40 
          }}>
            <Activity size={32} color="#fff" />
          </div>
          <h2>Transforming<br />Elder Care.</h2>
          <p>CareMonitor helps you stay connected with your healthcare team and manage your medications with ease and confidence.</p>
          
          <div style={{ marginTop: 60, display: 'flex', gap: 32 }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>10k+</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Active Users</div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 32 }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>99%</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Adherence Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
