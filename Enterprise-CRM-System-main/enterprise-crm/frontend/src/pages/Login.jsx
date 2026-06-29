import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [credentialsHintVisible, setCredentialsHintVisible] = useState(true);
  const { login, error, setError, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Clear errors on load
  useEffect(() => {
    setError(null);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      navigate('/dashboard');
    }
  };

  const handleQuickLogin = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <svg 
            style={{ width: '48px', height: '48px', color: 'var(--primary)', marginBottom: '1rem' }} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
          <h2>Welcome Back</h2>
          <p>Login to manage your enterprise sales pipelines</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </div>

        {credentialsHintVisible && (
          <div className="credentials-hint">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
              <span>💡 Quick Testing Accounts</span>
              <button 
                onClick={() => setCredentialsHintVisible(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <p style={{ marginBottom: '0.5rem' }}>First registered account in database is auto-assigned as <strong>Admin</strong>. Default credentials:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div 
                style={styles.hintItem}
                onClick={() => handleQuickLogin('admin@crm.com', 'admin123')}
              >
                <span>🔴 <strong>Admin</strong> (Full access)</span>
                <span>admin@crm.com / admin123</span>
              </div>
              <div 
                style={styles.hintItem}
                onClick={() => handleQuickLogin('manager@crm.com', 'manager123')}
              >
                <span>🟣 <strong>Manager</strong> (Dashboard & details)</span>
                <span>manager@crm.com / manager123</span>
              </div>
              <div 
                style={styles.hintItem}
                onClick={() => handleQuickLogin('rep1@crm.com', 'rep1234')}
              >
                <span>🔵 <strong>Sales Rep</strong> (Own pipeline logs)</span>
                <span>rep1@crm.com / rep1234</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  hintItem: {
    display: 'flex',
    justifyContent: 'space-between',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    border: '1px solid rgba(255, 255, 255, 0.02)'
  }
};

export default Login;
