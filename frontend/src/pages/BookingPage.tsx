import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import PublicLayout from '../layouts/PublicLayout';
import BookingAuthGate from '../components/BookingAuthGate';
import type { TeeTimeSlot } from '../types';
import { fetchTeeTimesForDate, createBooking } from '../api';
import { useAuth } from '../contexts/AuthContext';
import './BookingPage.css';

const BookingPage: React.FC = () => {
  const { slotId } = useParams<{ slotId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [slot, setSlot] = useState<TeeTimeSlot | null>(null);
  const [players, setPlayers] = useState(1);
  const [cartRequested, setCartRequested] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracks whether the user has completed auth via the inline gate
  const [gateCleared, setGateCleared] = useState(false);

  // Load today's slots to find the one matching our slotId
  useEffect(() => {
    // We need to search across upcoming dates — for simplicity, we load from API
    // In a full implementation you'd have a GET /tee-times/:id endpoint
    const today = format(new Date(), 'yyyy-MM-dd');
    fetchTeeTimesForDate(today)
      .then((res) => {
        const found = (res.data.slots as TeeTimeSlot[]).find(
          (s) => s.id === Number(slotId)
        );
        setSlot(found ?? null);
      })
      .catch(() => {});
  }, [slotId]);

  // Calculate total cost for the booking preview
  const pricePerPlayer = parseFloat(slot?.price_per_player ?? '0');
  const cartFee = parseFloat(slot?.cart_fee ?? '0');
  const cartTotal = cartRequested ? cartFee * players : 0;
  const total = pricePerPlayer * players + cartTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) return;

    setLoading(true);
    setError(null);

    try {
      await createBooking({
        tee_time_slot_id: slot.id,
        players,
        cart_requested: cartRequested,
        notes,
      });

      navigate('/my-bookings', { state: { success: true } });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!slot) {
    return (
      <PublicLayout>
        <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
          <div className="spinner" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="booking-page">
        <div className="container">
          <div className="page-header">
            <h1>Book Tee Time</h1>
          </div>

          {/* Show auth gate if the user isn't logged in yet */}
          {!user && !gateCleared && (
            <div className="booking-gate-wrapper">
              <BookingAuthGate onAuthenticated={() => setGateCleared(true)} />
            </div>
          )}

          {/* Booking form — only shown once authenticated */}
          {(user || gateCleared) && (
          <div className="booking-layout">
            {/* Booking form */}
            <form className="booking-form card" onSubmit={handleSubmit}>
              {/* Player count */}
              <div className="form-group">
                <label>Number of Players</label>
                <select
                  value={players}
                  onChange={(e) => setPlayers(Number(e.target.value))}
                >
                  {Array.from({ length: slot.spots_remaining }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'player' : 'players'}</option>
                  ))}
                </select>
              </div>

              {/* Cart option */}
              {parseFloat(slot.cart_fee) > 0 && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={cartRequested}
                      onChange={(e) => setCartRequested(e.target.checked)}
                    />
                    Add golf cart (+${slot.cart_fee}/player)
                  </label>
                </div>
              )}

              {/* Notes */}
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests?"
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Booking…' : 'Confirm Booking'}
              </button>
            </form>

            {/* Booking summary sidebar */}
            <div className="booking-summary card">
              <h2>Booking Summary</h2>
              <div className="summary-row">
                <span>Date</span>
                <span>{format(parseISO(slot.date), 'MMMM d, yyyy')}</span>
              </div>
              <div className="summary-row">
                <span>Time</span>
                <span>{format(parseISO(`2000-01-01T${slot.start_time}`), 'h:mm a')}</span>
              </div>
              <div className="summary-row">
                <span>Players</span>
                <span>{players}</span>
              </div>
              <div className="summary-row">
                <span>Green Fee</span>
                <span>${(pricePerPlayer * players).toFixed(2)}</span>
              </div>
              {cartRequested && (
                <div className="summary-row">
                  <span>Cart Fee</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default BookingPage;
