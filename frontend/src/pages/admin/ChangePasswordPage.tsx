import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { changePassword } from '../../api';
import './AdminLoginPage.css';

// Shown immediately after admin login when must_change_password is true
const ChangePasswordPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await changePassword({ password, password_confirmation: confirmation });
      // Redirect to admin dashboard after a successful change
      navigate('/admin');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    // Log the user out if they dismiss the change — security requirement
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <span className="admin-login-logo">🔑</span>
          <h1 className="admin-login-title">Set Your Password</h1>
          <p className="admin-login-sub">
            Welcome, {user?.name}! Please choose a new password before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary admin-login-btn"
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Set Password & Continue'}
          </button>
        </form>

        {/* Escape hatch — logs the user out */}
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
          <button
            type="button"
            className="auth-link-btn"
            style={{ color: 'var(--color-text-muted)' }}
            onClick={handleCancel}
          >
            Cancel and sign out
          </button>
        </p>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
