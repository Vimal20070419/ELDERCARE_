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
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Activity size={28} color="#fff" /></div>
          <h1>ElderCare</h1>
          <p>Clinical Adherence Platform</p>
        </div>

        {error && <div className="alert-banner error">{error}</div>}

        <div style={{ marginBottom: 20 }}>
          <label className="form-label">Sign in as:</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['caregiver', 'doctor', 'patient'].map(r => (
              <button
                key={r}
                type="button"
                className={`btn btn-sm ${selectedRole === r ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSelectedRole(r)}
                style={{ flex: 1, textTransform: 'capitalize' }}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            <label htmlFor="rememberMe" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Remember Me</label>
          </div>

          <button id="login-submit" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
