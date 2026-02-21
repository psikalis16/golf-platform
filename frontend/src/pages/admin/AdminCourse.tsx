import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { adminFetchCourse, adminUpdateCourse } from '../../api';
import type { Course } from '../../types';
import './AdminPage.css';

const AMENITY_OPTIONS = [
  'Pro Shop', 'Driving Range', 'Putting Green', 'Chipping Area',
  'Restaurant', 'Snack Bar', 'Locker Rooms', 'Club Rental', 'Lessons Available',
];

const AdminCourse: React.FC = () => {
  const [course, setCourse] = useState<Partial<Course>>({});
  const [amenities, setAmenities] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminFetchCourse().then((res) => {
      const c = res.data.course ?? {};
      setCourse(c);
      setAmenities(c.amenities ?? []);
    }).catch(() => {});
  }, []);

  const set = (field: keyof Course) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setCourse((c) => ({ ...c, [field]: e.target.value }));

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateCourse({ ...course, amenities });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1>Course Information</h1>
        <p className="admin-subtitle">Update your course details, description, and amenities.</p>

        <form className="admin-form-section" onSubmit={handleSave}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2>Basic Info</h2>
            <div className="form-group">
              <label>Course Name</label>
              <input type="text" value={course.name ?? ''} onChange={set('name')} placeholder="Pine Valley Golf Club" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={4} value={course.description ?? ''} onChange={set('description')} placeholder="Tell golfers about your course…" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Holes</label>
                <select value={course.holes ?? 18} onChange={set('holes')}>
                  {[9, 18, 27, 36].map((n) => <option key={n} value={n}>{n} holes</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Par</label>
                <input type="number" min="60" max="80" value={course.par ?? 72} onChange={set('par')} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2>Contact & Location</h2>
            <div className="form-group">
              <label>Street Address</label>
              <input type="text" value={course.address ?? ''} onChange={set('address')} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" value={course.city ?? ''} onChange={set('city')} />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" value={course.state ?? ''} onChange={set('state')} maxLength={2} placeholder="AZ" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={course.phone ?? ''} onChange={set('phone')} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={course.email ?? ''} onChange={set('email')} />
              </div>
            </div>
            <div className="form-group">
              <label>Website</label>
              <input type="url" value={course.website ?? ''} onChange={set('website')} placeholder="https://…" />
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2>Amenities</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.75rem' }}>
              {AMENITY_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`btn btn-sm ${amenities.includes(a) ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => toggleAmenity(a)}
                >
                  {amenities.includes(a) ? '✓ ' : ''}{a}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            {saved && <span className="success-msg">✓ Saved successfully</span>}
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminCourse;
