import React from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import PublicLayout from '../layouts/PublicLayout';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { tenant, loading } = useTenant();
  const course = tenant?.course;

  if (loading) return <div className="spinner" />;

  return (
    <PublicLayout>
      {/* ── Hero section ── */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="hero-subtitle">Welcome to</p>
          <h1 className="hero-title">{course?.name ?? tenant?.name}</h1>
          {course?.description && (
            <p className="hero-desc">{course.description}</p>
          )}
          <div className="hero-actions">
            <Link to="/tee-times" className="btn btn-accent">
              Book a Tee Time
            </Link>
            <a href="#course-info" className="btn btn-outline">
              Course Info
            </a>
          </div>
          {/* Quick stats bar */}
          <div className="hero-stats">
            {course?.holes && (
              <div className="hero-stat">
                <span className="hero-stat-value">{course.holes}</span>
                <span className="hero-stat-label">Holes</span>
              </div>
            )}
            {course?.par && (
              <div className="hero-stat">
                <span className="hero-stat-value">{course.par}</span>
                <span className="hero-stat-label">Par</span>
              </div>
            )}
            {course?.address && (
              <div className="hero-stat">
                <span className="hero-stat-value">📍</span>
                <span className="hero-stat-label">{course.city}, {course.state}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Course info section ── */}
      <section id="course-info" className="section">
        <div className="container">
          <div className="grid-2">
            {/* Details card */}
            <div className="card">
              <h2>Course Details</h2>
              {course?.address && (
                <div className="info-row">
                  <span className="info-label">Address</span>
                  <a
                    className="info-value info-link"
                    href={`https://maps.google.com/?q=${encodeURIComponent(course.address + ' ' + (course.city ?? ''))}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {course.address}, {course.city}, {course.state} {course.zip}
                  </a>
                </div>
              )}
              {course?.phone && (
                <div className="info-row">
                  <span className="info-label">Phone</span>
                  <a className="info-value info-link" href={`tel:${course.phone}`}>{course.phone}</a>
                </div>
              )}
              {course?.email && (
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <a className="info-value info-link" href={`mailto:${course.email}`}>{course.email}</a>
                </div>
              )}
              {course?.website && (
                <div className="info-row">
                  <span className="info-label">Website</span>
                  <a className="info-value info-link" href={course.website} target="_blank" rel="noreferrer">
                    {course.website}
                  </a>
                </div>
              )}
            </div>

            {/* Amenities card */}
            {course?.amenities && course.amenities.length > 0 && (
              <div className="card">
                <h2>Amenities</h2>
                <ul className="amenities-list">
                  {course.amenities.map((item, i) => (
                    <li key={i} className="amenity-item">✓ {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Hours of operation */}
          {course?.hours && (
            <div className="card hours-card">
              <h2>Hours of Operation</h2>
              <div className="hours-grid">
                {Object.entries(course.hours).map(([day, hours]) => (
                  <div key={day} className="hours-row">
                    <span className="hours-day">{day}</span>
                    <span className="hours-time">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="cta-banner card">
            <h2>Ready to Play?</h2>
            <p>Check availability and book your tee time in minutes.</p>
            <Link to="/tee-times" className="btn btn-primary">
              View Available Tee Times →
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default HomePage;
