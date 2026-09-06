import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick helper to fill demo account
  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '1.5rem'
    }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1rem'
          }}>
            <Calendar size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Sign In to Tracker
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Enter your credentials or click a demo account below
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@tracker.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.75rem', textAlign: 'center', textTransform: 'uppercase' }}>
            Quick Demo Accounts (password: password123)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@tracker.com')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.5rem 0.25rem' }}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('alice@tracker.com')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.5rem 0.25rem' }}
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('bob@tracker.com')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.5rem 0.25rem' }}
            >
              Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}