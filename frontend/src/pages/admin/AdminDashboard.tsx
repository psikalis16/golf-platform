import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { adminFetchBookings, adminFetchClosures } from '../../api';
import type { Booking, CourseClosure } from '../../types';
import { useTenant } from '../../contexts/TenantContext';
import { format } from 'date-fns';
import './AdminPage.css';

const AdminDashboard: React.FC = () => {
  const { tenant } = useTenant();
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [upcomingClosures, setUpcomingClosures] = useState<CourseClosure[]>([]);

  useEffect(() => {
    // Load a quick snapshot for the dashboard
    adminFetchBookings({ status: 'confirmed' }).then((res) => {
      setRecentBookings(res.data.data?.slice(0, 5) ?? []);
    }).catch(() => {});

    adminFetchClosures().then((res) => {
      // Show only upcoming closures
      const today = format(new Date(), 'yyyy-MM-dd');
      setUpcomingClosures(
        res.data.filter((c: CourseClosure) => c.date >= today).slice(0, 5)
      );
    }).catch(() => {});
  }, []);

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1>{tenant?.name} — Admin Dashboard</h1>
        <p className="admin-subtitle">Manage your course, tee times, and bookings below.</p>

        {/* Quick action cards */}
        <div className="dash-cards grid-3">
          <a href="/admin/tee-times" className="dash-card card">
            <span className="dash-icon">🕐</span>
            <h3>Tee Times</h3>
            <p>Create and manage your tee time schedule</p>
          </a>
          <a href="/admin/bookings" className="dash-card card">
            <span className="dash-icon">📅</span>
            <h3>Bookings</h3>
            <p>View and manage player reservations</p>
          </a>
          <a href="/admin/closures" className="dash-card card">
            <span className="dash-icon">🚫</span>
            <h3>Closures</h3>
            <p>Block off days the course is closed</p>
          </a>
          <a href="/admin/pricing" className="dash-card card">
            <span className="dash-icon">💰</span>
            <h3>Pricing</h3>
            <p>Set green fees and cart rates</p>
          </a>
          <a href="/admin/course" className="dash-card card">
            <span className="dash-icon">📋</span>
            <h3>Course Info</h3>
            <p>Update your course details and description</p>
          </a>
          <a href="/admin/settings" className="dash-card card">
            <span className="dash-icon">⚙️</span>
            <h3>Settings</h3>
            <p>Branding, colors, and contact info</p>
          </a>
        </div>

        {/* Recent bookings snapshot */}
        {recentBookings.length > 0 && (
          <div className="dash-section">
            <h2>Recent Confirmed Bookings</h2>
            <div className="card table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Players</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.id}>
                      <td>{b.booker_name ?? b.guest_name ?? 'Guest'}</td>
                      <td>{b.tee_time_slot?.date}</td>
                      <td>{b.tee_time_slot?.start_time}</td>
                      <td>{b.players}</td>
                      <td>${b.total_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Upcoming closures snapshot */}
        {upcomingClosures.length > 0 && (
          <div className="dash-section">
            <h2>Upcoming Closures</h2>
            <div className="closures-list">
              {upcomingClosures.map((c) => (
                <div key={c.id} className="closure-item card">
                  <span className="closure-date">{c.date}</span>
                  <span className="closure-reason">{c.reason ?? 'No reason given'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
