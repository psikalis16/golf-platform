import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { adminFetchPricing, adminCreatePricing, adminDeletePricing } from '../../api';
import type { PricingRule } from '../../types';
import './AdminPage.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AdminPricing: React.FC = () => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    date: '',
    day_of_week: '',
    price_per_player: '',
    cart_fee: '0',
    priority: '10',
  });

  const load = () => {
    adminFetchPricing().then((res) => setRules(res.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminCreatePricing({
        ...form,
        day_of_week: form.day_of_week !== '' ? Number(form.day_of_week) : null,
        date: form.date || null,
        priority: Number(form.priority),
      });
      setForm({ name: '', date: '', day_of_week: '', price_per_player: '', cart_fee: '0', priority: '10' });
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1>Pricing Rules</h1>
        <p className="admin-subtitle">Set green fees and cart rates. Specific date rules override day-of-week rules.</p>

        {/* Add rule form */}
        <div className="card admin-form-section" style={{ marginBottom: '2rem' }}>
          <h2>Add Pricing Rule</h2>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-group">
                <label>Rule Name</label>
                <input type="text" placeholder="e.g. Weekend Rate" value={form.name} onChange={set('name')} />
              </div>
              <div className="form-group">
                <label>Day of Week (or leave blank for all days)</label>
                <select value={form.day_of_week} onChange={set('day_of_week')}>
                  <option value="">All Days</option>
                  {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Specific Date override (optional)</label>
                <input type="date" value={form.date} onChange={set('date')} />
              </div>
              <div className="form-group">
                <label>Priority (lower = higher priority)</label>
                <input type="number" min="1" max="100" value={form.priority} onChange={set('priority')} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Green Fee (per player) *</label>
                <input type="number" min="0" step="0.01" required value={form.price_per_player} onChange={set('price_per_player')} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Cart Fee (per player)</label>
                <input type="number" min="0" step="0.01" value={form.cart_fee} onChange={set('cart_fee')} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Add Rule'}
            </button>
          </form>
        </div>

        {/* Existing rules */}
        <h2>Current Pricing Rules</h2>
        {rules.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No pricing rules configured.</p>
        ) : (
          <div className="card table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Applies To</th>
                  <th>Green Fee</th>
                  <th>Cart Fee</th>
                  <th>Priority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.name ?? '—'}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>
                      {r.date ? r.date : r.day_of_week !== null ? DAYS[r.day_of_week] : 'All Days'}
                    </td>
                    <td>${r.price_per_player}</td>
                    <td>${r.cart_fee}</td>
                    <td>{r.priority}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => adminDeletePricing(r.id).then(load)}
                      >
                        Delete
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

export default AdminPricing;
