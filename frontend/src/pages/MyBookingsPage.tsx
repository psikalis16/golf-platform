import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import PublicLayout from '../layouts/PublicLayout';
import { fetchMyBookings } from '../api';
import type { Booking } from '../types';

const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings()
      .then((res) => setBookings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
    <PublicLayout>
      <div style={{ padding: '0 0 4rem' }}>
        <div className="container">
          <div className="page-header">
            <h1>My Bookings</h1>
          </div>

          {loading && <div className="spinner" />}

          {!loading && bookings.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                You don't have any bookings yet.
              </p>
              <a href="/tee-times" className="btn btn-primary">Browse Tee Times</a>
            </div>
          )}

          {!loading && bookings.length > 0 && (
            <div className="card table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Players</th>
                    <th>Cart</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        {b.tee_time_slot?.date
                          ? format(parseISO(b.tee_time_slot.date), 'MMM d, yyyy')
                          : '—'}
                      </td>
                      <td>
                        {b.tee_time_slot?.start_time
                          ? format(parseISO(`2000-01-01T${b.tee_time_slot.start_time}`), 'h:mm a')
                          : '—'}
                      </td>
                      <td>{b.players}</td>
                      <td>{b.cart_requested ? '✓' : '—'}</td>
                      <td>${b.total_price}</td>
                      <td>
                        <span className={`badge ${statusBadge(b.status)}`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default MyBookingsPage;
