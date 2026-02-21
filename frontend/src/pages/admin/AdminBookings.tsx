import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { adminFetchBookings, adminUpdateBooking } from '../../api';
import type { Booking } from '../../types';
import './AdminPage.css';

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = () => {
    setLoading(true);
    adminFetchBookings({
      date: filterDate || undefined,
      status: filterStatus || undefined,
    })
      .then((res) => setBookings(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterDate, filterStatus]);

  const updateStatus = async (id: number, status: string) => {
    await adminUpdateBooking(id, { status });
    load();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'badge-green',
      pending: 'badge-yellow',
      cancelled: 'badge-red',
      completed: 'badge-gray',
    };
    return map[status] ?? 'badge-gray';
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1>Bookings</h1>
        <p className="admin-subtitle">View and manage all tee time reservations.</p>

        {/* Filters */}
        <div className="admin-actions" style={{ marginBottom: '1.5rem' }}>
          <input
            type="date"
            className="filter-input"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{ background: 'var(--color-surface-2)', border: '1.5px solid var(--color-border)', color: 'var(--color-text)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontFamily: 'Inter, sans-serif' }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ background: 'var(--color-surface-2)', border: '1.5px solid var(--color-border)', color: 'var(--color-text)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontFamily: 'Inter, sans-serif' }}
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          {(filterDate || filterStatus) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setFilterDate(''); setFilterStatus(''); }}>
              Clear Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="spinner" />
        ) : (
          <div className="card table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Booker</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Players</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No bookings found.</td></tr>
                )}
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.booker_name ?? b.guest_name ?? 'Guest'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{b.guest_email}</div>
                    </td>
                    <td>{b.tee_time_slot?.date}</td>
                    <td>{b.tee_time_slot?.start_time}</td>
                    <td>{b.players}</td>
                    <td>${b.total_price}</td>
                    <td><span className={`badge ${statusBadge(b.status)}`}>{b.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {b.status !== 'cancelled' && (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => updateStatus(b.id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        )}
                        {b.status === 'confirmed' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => updateStatus(b.id, 'completed')}
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBookings;
