import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { register as apiRegister } from '../api';
import './BookingAuthGate.css';

interface BookingAuthGateProps {
  // Called after successful sign-in or registration so the booking can proceed
  onAuthenticated: () => void;
}

const BookingAuthGate: React.FC<BookingAuthGateProps> = ({ onAuthenticated }) => {
  // Track which tab is active: 'login' or 'register'
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const { login } = useAuth();

  // ── Login form state ──────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // ── Register form state ───────────────────────────────────────────────────
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  const setReg = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setRegForm((f) => ({ ...f, [field]: e.target.value }));

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      await login(loginEmail, loginPassword);
      onAuthenticated();
    } catch {
      setLoginError('Invalid email or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError(null);
    try {
      const res = await apiRegister(regForm);
      // Store the token that comes back from registration
      localStorage.setItem('auth_token', res.data.token);
      // Re-hydrate auth context by logging in with the returned token
      await login(regForm.email, regForm.password);
      onAuthenticated();
    } catch (err: any) {
      setRegError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="auth-gate">
      {/* Explanatory prompt */}
      <div className="auth-gate-header">
        <span className="auth-gate-icon">🔒</span>
        <h2 className="auth-gate-title">Sign in to complete your booking</h2>
        <p className="auth-gate-sub">
          We need your details so the course can confirm your reservation.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="auth-gate-tabs">
        <button
          className={`auth-gate-tab ${tab === 'login' ? 'active' : ''}`}
          onClick={() => setTab('login')}
        >
          Sign In
        </button>
        <button
          className={`auth-gate-tab ${tab === 'register' ? 'active' : ''}`}
          onClick={() => setTab('register')}
        >
          Create Account
        </button>
      </div>

      {/* ── Sign In form ── */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} className="auth-gate-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </div>
          {loginError && <p className="form-error">{loginError}</p>}
          <button
            type="submit"
            className="btn btn-primary auth-gate-btn"
            disabled={loginLoading}
          >
            {loginLoading ? 'Signing in…' : 'Sign In & Continue'}
          </button>
          <p className="auth-gate-switch">
            No account?{' '}
            <button type="button" className="auth-link-btn" onClick={() => setTab('register')}>
              Create one free
            </button>
          </p>
        </form>
      )}

      {/* ── Create Account form ── */}
      {tab === 'register' && (
        <form onSubmit={handleRegister} className="auth-gate-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              required
              placeholder="Jane Smith"
              onChange={setReg('name')}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              placeholder="you@email.com"
              onChange={setReg('email')}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              onChange={setReg('password')}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              onChange={setReg('password_confirmation')}
            />
          </div>
          {regError && <p className="form-error">{regError}</p>}
          <button
            type="submit"
            className="btn btn-primary auth-gate-btn"
            disabled={regLoading}
          >
            {regLoading ? 'Creating account…' : 'Create Account & Continue'}
          </button>
          <p className="auth-gate-switch">
            Already have an account?{' '}
            <button type="button" className="auth-link-btn" onClick={() => setTab('login')}>
              Sign in
            </button>
          </p>
        </form>
      )}
    </div>
  );
};

export default BookingAuthGate;
