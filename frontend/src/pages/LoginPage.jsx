// pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';
import useAuth from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('caregiver');
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authAPI.login({ email: form.email, password: form.password });
      const { token, user } = res.data.data;

      // Role Verification check (Strict Spec compliance)
      if (user.role !== selectedRole) {
        throw new Error(`Invalid credentials for role: ${selectedRole.toUpperCase()}`);
      }

      login(token, user);
      
      if (rememberMe) {
          localStorage.setItem('remembered_email', form.email);
      }

      const target = user.role === 'patient' ? '/patient' : user.role === 'doctor' ? '/doctor' : '/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-logo">
            <h1>Sign In</h1>
            <p>Access your healthcare dashboard</p>
          </div>

          {error && <div className="alert-banner error" style={{ marginBottom: 24 }}>{error}</div>}

          <div style={{ marginBottom: 24 }}>
            <label className="form-label" style={{ marginBottom: 12 }}>Sign in as:</label>
            <div style={{ display: 'flex', gap: 8, background: '#f1f5f9', padding: 4, borderRadius: 12 }}>
              {['caregiver', 'doctor', 'patient'].map(r => (
                <button
                  key={r}
                  type="button"
                  className={`btn btn-sm ${selectedRole === r ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setSelectedRole(r)}
                  style={{ 
                    flex: 1, 
                    textTransform: 'capitalize',
                    background: selectedRole === r ? 'white' : 'transparent',
                    color: selectedRole === r ? 'var(--primary)' : 'var(--text-secondary)',
                    boxShadow: selectedRole === r ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                    borderRadius: 10,
                    padding: '8px'
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input id="login-email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input id="login-password" type="password" required value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <label htmlFor="rememberMe" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}>Remember Me</label>
            </div>

            <button id="login-submit" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '32px' }}>
            Don't have an account? <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary)' }}>Create account</Link>
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
          <h2>Better Care,<br />Every Day.</h2>
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
