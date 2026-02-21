import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { adminFetchTeeTimes, adminBulkCreateTeeTimes, adminUpdateTeeTime, adminDeleteTeeTime } from '../../api';
import type { TeeTimeSlot } from '../../types';
import { format, addDays } from 'date-fns';
import './AdminPage.css';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AdminTeeTimes: React.FC = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 6), 'yyyy-MM-dd'));
  const [slots, setSlots] = useState<TeeTimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulk, setBulk] = useState({
    start_date: today,
    end_date: format(addDays(new Date(), 6), 'yyyy-MM-dd'),
    first_tee_time: '07:00',
    last_tee_time: '17:00',
    interval_minutes: '10',
    max_players: '4',
    price_per_player: '',
    cart_fee: '0',
    days_of_week: [1, 2, 3, 4, 5, 6, 0],
  });
  const [bulkSaving, setBulkSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminFetchTeeTimes(startDate, endDate)
      .then((res) => setSlots(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [startDate, endDate]);

  const toggleDay = (day: number) => {
    setBulk((b) => ({
      ...b,
      days_of_week: b.days_of_week.includes(day)
        ? b.days_of_week.filter((d) => d !== day)
        : [...b.days_of_week, day],
    }));
  };

  const handleBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkSaving(true);
    try {
      await adminBulkCreateTeeTimes({ ...bulk, interval_minutes: Number(bulk.interval_minutes), max_players: Number(bulk.max_players) });
      setShowBulk(false);
      load();
    } finally {
      setBulkSaving(false);
    }
  };

  const toggleAvailable = async (slot: TeeTimeSlot) => {
    await adminUpdateTeeTime(slot.id, { is_available: !slot.is_available });
    load();
  };

  const deleteSlot = async (id: number) => {
    if (!confirm('Delete this tee time slot?')) return;
    await adminDeleteTeeTime(id);
    load();
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1>Tee Time Management</h1>
        <p className="admin-subtitle">Create, enable, and disable tee time slots.</p>

        {/* Date range filter */}
        <div className="admin-actions" style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>From</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            style={{ background: 'var(--color-surface-2)', border: '1.5px solid var(--color-border)', color: 'var(--color-text)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontFamily: 'Inter,sans-serif' }} />
          <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>To</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            style={{ background: 'var(--color-surface-2)', border: '1.5px solid var(--color-border)', color: 'var(--color-text)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontFamily: 'Inter,sans-serif' }} />
          <button className="btn btn-primary btn-sm" onClick={() => setShowBulk(!showBulk)}>
            + Bulk Add Tee Times
          </button>
        </div>

        {/* Bulk add form */}
        {showBulk && (
          <div className="card" style={{ marginBottom: '2rem', maxWidth: 720 }}>
            <h2>Bulk Add Tee Times</h2>
            <form onSubmit={handleBulk}>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" required value={bulk.start_date} onChange={(e) => setBulk((b) => ({ ...b, start_date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" required value={bulk.end_date} onChange={(e) => setBulk((b) => ({ ...b, end_date: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>First Tee Time</label>
                  <input type="time" required value={bulk.first_tee_time} onChange={(e) => setBulk((b) => ({ ...b, first_tee_time: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Last Tee Time</label>
                  <input type="time" required value={bulk.last_tee_time} onChange={(e) => setBulk((b) => ({ ...b, last_tee_time: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Interval (minutes)</label>
                  <select value={bulk.interval_minutes} onChange={(e) => setBulk((b) => ({ ...b, interval_minutes: e.target.value }))}>
                    {[8, 10, 12, 15, 20, 30].map((m) => <option key={m} value={m}>{m} min</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Max Players per Slot</label>
                  <select value={bulk.max_players} onChange={(e) => setBulk((b) => ({ ...b, max_players: e.target.value }))}>
                    {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Green Fee per Player ($)</label>
                  <input type="number" min="0" step="0.01" required value={bulk.price_per_player} onChange={(e) => setBulk((b) => ({ ...b, price_per_player: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Cart Fee per Player ($)</label>
                  <input type="number" min="0" step="0.01" value={bulk.cart_fee} onChange={(e) => setBulk((b) => ({ ...b, cart_fee: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label>Days of Week</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                  {DAYS_OF_WEEK.map((d, i) => (
                    <button
                      key={d}
                      type="button"
                      className={`btn btn-sm ${bulk.days_of_week.includes(i) ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => toggleDay(i)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="admin-actions">
                <button type="submit" className="btn btn-primary" disabled={bulkSaving}>
                  {bulkSaving ? 'Creating…' : 'Create Tee Times'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowBulk(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Slots table */}
        {loading ? (
          <div className="spinner" />
        ) : (
          <div className="card table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Max</th>
                  <th>Booked</th>
                  <th>Green Fee</th>
                  <th>Cart Fee</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No tee times for this range.</td></tr>
                )}
                {slots.map((s) => (
                  <tr key={s.id}>
                    <td>{s.date}</td>
                    <td>{s.start_time?.slice(0, 5)}</td>
                    <td>{s.max_players}</td>
                    <td>{s.booked_players}</td>
                    <td>${s.price_per_player}</td>
                    <td>${s.cart_fee}</td>
                    <td>
                      <span className={`badge ${s.is_available ? 'badge-green' : 'badge-gray'}`}>
                        {s.is_available ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => toggleAvailable(s)}
                        >
                          {s.is_available ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteSlot(s.id)}
                          disabled={s.booked_players > 0}
                          title={s.booked_players > 0 ? 'Cannot delete — has bookings' : undefined}
                        >
                          Delete
                        </button>
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

export default AdminTeeTimes;
