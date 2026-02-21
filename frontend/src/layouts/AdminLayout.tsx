import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import './AdminLayout.css';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenant } = useTenant();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Sidebar navigation items
  const navItems = [
    { to: '/admin', label: '⛳ Dashboard', end: true },
    { to: '/admin/course', label: '📋 Course Info' },
    { to: '/admin/tee-times', label: '🕐 Tee Times' },
    { to: '/admin/bookings', label: '📅 Bookings' },
    { to: '/admin/closures', label: '🚫 Closures' },
    { to: '/admin/pricing', label: '💰 Pricing' },
    { to: '/admin/settings', label: '⚙️ Settings' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <Link to="/" className="admin-logo">
          <span className="admin-logo-name">{tenant?.name ?? 'Admin'}</span>
          <span className="admin-logo-tag">Admin Panel</span>
        </Link>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-link">← View Site</Link>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
