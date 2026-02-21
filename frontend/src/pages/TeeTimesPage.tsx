import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, addDays, parseISO } from 'date-fns';
import PublicLayout from '../layouts/PublicLayout';
import type { TeeTimeSlot } from '../types';
import { fetchTeeTimesForDate, fetchClosuresForMonth } from '../api';
import './TeeTimesPage.css';

const TeeTimesPage: React.FC = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState<TeeTimeSlot[]>([]);
  const [closedDates, setClosedDates] = useState<string[]>([]);
  const [closed, setClosed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Build a 14-day date picker for easy browsing
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i);
    return { value: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE MMM d') };
  });

  // Fetch closures for current month so we can mark them on the date picker
  useEffect(() => {
    const [year, month] = selectedDate.split('-');
    fetchClosuresForMonth(Number(year), Number(month))
      .then((res) => setClosedDates(res.data))
      .catch(() => {});
  }, [selectedDate]);

  // Fetch available tee times whenever selected date changes
  useEffect(() => {
    setLoading(true);
    setClosed(false);
    fetchTeeTimesForDate(selectedDate)
      .then((res) => {
        setClosed(res.data.closed);
        setSlots(res.data.slots ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedDate]);

  return (
    <PublicLayout>
      <div className="tee-times-page">
        <div className="container">
          {/* Header */}
          <div className="page-header">
            <h1>Available Tee Times</h1>
            <p className="page-subtitle">Select a date to view available slots</p>
          </div>

          {/* Date picker strip */}
          <div className="date-strip">
            {dateOptions.map((d) => {
              const isClosed = closedDates.includes(d.value);
              return (
                <button
                  key={d.value}
                  className={[
                    'date-btn',
                    selectedDate === d.value ? 'active' : '',
                    isClosed ? 'closed' : '',
                  ].join(' ')}
                  onClick={() => setSelectedDate(d.value)}
                  title={isClosed ? 'Course closed' : undefined}
                >
                  {d.label.split(' ').map((part, i) => (
                    <span key={i} className={i === 0 ? 'date-day' : 'date-date'}>{part}</span>
                  ))}
                  {isClosed && <span className="date-closed-tag">Closed</span>}
                </button>
              );
            })}
          </div>

          {/* Slot results */}
          <div className="slots-area">
            {loading && <div className="spinner" />}

            {!loading && closed && (
              <div className="closed-notice card">
                <span className="closed-icon">⛳</span>
                <h2>Course Closed</h2>
                <p>The course is not available on this date. Please select another day.</p>
              </div>
            )}

            {!loading && !closed && slots.length === 0 && (
              <div className="closed-notice card">
                <span className="closed-icon">📭</span>
                <h2>No Available Tee Times</h2>
                <p>There are no open tee times for this date. Try another day.</p>
              </div>
            )}

            {!loading && !closed && slots.length > 0 && (
              <div className="slots-grid">
                {slots.map((slot) => (
                  <div key={slot.id} className="slot-card card">
                    <div className="slot-time">{format(parseISO(`2000-01-01T${slot.start_time}`), 'h:mm a')}</div>
                    <div className="slot-details">
                      <span className={`badge ${slot.spots_remaining <= 1 ? 'badge-yellow' : 'badge-green'}`}>
                        {slot.spots_remaining} {slot.spots_remaining === 1 ? 'spot' : 'spots'} left
                      </span>
                      {slot.walking_allowed && (
                        <span className="badge badge-gray">Walking OK</span>
                      )}
                    </div>
                    <div className="slot-pricing">
                      <div className="slot-price">
                        ${slot.price_per_player}
                        <span className="slot-price-label">/player</span>
                      </div>
                      {parseFloat(slot.cart_fee) > 0 && (
                        <div className="slot-cart-fee">+${slot.cart_fee} cart</div>
                      )}
                    </div>
                    <Link
                      to={`/book/${slot.id}`}
                      className="btn btn-primary slot-book-btn"
                    >
                      Book
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default TeeTimesPage;
