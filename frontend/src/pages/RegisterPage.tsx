import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../api';
import PublicLayout from '../layouts/PublicLayout';
import './AuthPage.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiRegister(form);
      localStorage.setItem('auth_token', res.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="auth-page">
        <div className="auth-card card">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-sub">Create a free account to manage your tee time bookings.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" required placeholder="Jane Smith" onChange={set('name')} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" required placeholder="you@email.com" onChange={set('email')} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" required placeholder="••••••••" onChange={set('password')} />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" required placeholder="••••••••" onChange={set('password_confirmation')} />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary auth-btn"
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};

export default RegisterPage;
