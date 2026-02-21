import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { adminUpdateSettings } from '../../api';
import { useTenant } from '../../contexts/TenantContext';
import './AdminPage.css';

const AdminSettings: React.FC = () => {
  const { tenant } = useTenant();
  const [form, setForm] = useState({
    name: '',
    logo_url: '',
    email: '',
    phone: '',
    primary: '',
    secondary: '',
    accent: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Pre-fill form from loaded tenant data
  useEffect(() => {
    if (tenant) {
      setForm({
        name: tenant.name ?? '',
        logo_url: tenant.logo_url ?? '',
        email: tenant.email ?? '',
        phone: tenant.phone ?? '',
        primary: tenant.colors?.primary ?? '#1a7a3c',
        secondary: tenant.colors?.secondary ?? '#155e30',
        accent: tenant.colors?.accent ?? '#f0a500',
      });
    }
  }, [tenant]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateSettings({
        name: form.name,
        logo_url: form.logo_url || null,
        email: form.email || null,
        phone: form.phone || null,
        colors: {
          primary: form.primary,
          secondary: form.secondary,
          accent: form.accent,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1>Site Settings</h1>
        <p className="admin-subtitle">Manage your course branding, contact info, and colors.</p>

        <form className="admin-form-section" onSubmit={handleSave}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2>Branding</h2>
            <div className="form-group">
              <label>Course / Site Name</label>
              <input type="text" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label>Logo URL</label>
              <input type="url" value={form.logo_url} onChange={set('logo_url')} placeholder="https://…" />
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2>Brand Colors</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Primary Color</label>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <input type="color" value={form.primary} onChange={set('primary')} style={{ width: 44, height: 44, padding: 2, cursor: 'pointer' }} />
                  <input type="text" value={form.primary} onChange={set('primary')} style={{ flex: 1 }} />
                </div>
              </div>
              <div className="form-group">
                <label>Secondary Color</label>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <input type="color" value={form.secondary} onChange={set('secondary')} style={{ width: 44, height: 44, padding: 2, cursor: 'pointer' }} />
                  <input type="text" value={form.secondary} onChange={set('secondary')} style={{ flex: 1 }} />
                </div>
              </div>
            </div>
            <div className="form-group" style={{ maxWidth: 300 }}>
              <label>Accent Color</label>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <input type="color" value={form.accent} onChange={set('accent')} style={{ width: 44, height: 44, padding: 2, cursor: 'pointer' }} />
                <input type="text" value={form.accent} onChange={set('accent')} style={{ flex: 1 }} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2>Contact Info</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={form.phone} onChange={set('phone')} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={set('email')} />
              </div>
            </div>
          </div>

          <div className="admin-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
            {saved && <span className="success-msg">✓ Settings saved</span>}
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
