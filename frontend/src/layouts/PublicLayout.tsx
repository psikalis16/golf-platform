import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import './PublicLayout.css';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenant } = useTenant();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="public-layout">
      {/* Site header with course branding */}
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            {tenant?.logo_url && (
              <img src={tenant.logo_url} alt={tenant.name} className="logo-img" />
            )}
            <span className="logo-name">{tenant?.name ?? 'Golf Course'}</span>
          </Link>

          <nav className="site-nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/tee-times" className="nav-link">Tee Times</Link>
            {user ? (
              <>
                <Link to="/my-bookings" className="nav-link">My Bookings</Link>
                {isAdmin && (
                  <Link to="/admin" className="nav-link nav-link-admin">Admin</Link>
                )}
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                  Sign Out
                </button>
              </>
            ) : null}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="site-main">{children}</main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <span className="footer-name">{tenant?.name}</span>
          {tenant?.phone && <span>{tenant.phone}</span>}
          {tenant?.email && <span>{tenant.email}</span>}
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
