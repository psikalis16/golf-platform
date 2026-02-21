import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { adminFetchClosures, adminCreateClosure, adminDeleteClosure } from '../../api';
import type { CourseClosure } from '../../types';
import './AdminPage.css';

const AdminClosures: React.FC = () => {
  const [closures, setClosures] = useState<CourseClosure[]>([]);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    adminFetchClosures().then((res) => setClosures(res.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    setSaving(true);
    try {
      await adminCreateClosure({ date, reason });
      setDate('');
      setReason('');
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await adminDeleteClosure(id);
    load();
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1>Course Closures</h1>
        <p className="admin-subtitle">Mark dates when the course is closed. Golfers won't be able to book on closed days.</p>

        {/* Add closure form */}
        <div className="card admin-form-section" style={{ marginBottom: '2rem' }}>
          <h2>Add Closure Date</h2>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Reason (optional)</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Course maintenance"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Adding…' : 'Add Closure'}
            </button>
          </form>
        </div>

        {/* Existing closures list */}
        <h2>Scheduled Closures</h2>
        {closures.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No closures scheduled.</p>
        ) : (
          <div className="card table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {closures.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.date}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{c.reason ?? '—'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(c.id)}
                      >
                        Remove
                      </button>
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

export default AdminClosures;
