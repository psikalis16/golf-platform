import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TenantProvider } from './contexts/TenantContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Public pages
import HomePage from './pages/HomePage';
import TeeTimesPage from './pages/TeeTimesPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import ChangePasswordPage from './pages/admin/ChangePasswordPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourse from './pages/admin/AdminCourse';
import AdminTeeTimes from './pages/admin/AdminTeeTimes';
import AdminBookings from './pages/admin/AdminBookings';
import AdminClosures from './pages/admin/AdminClosures';
import AdminPricing from './pages/admin/AdminPricing';
import AdminSettings from './pages/admin/AdminSettings';

// Guard component — redirects unauthenticated golfers to home
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

// Guard component — redirects non-admin users to home
// Also redirects admins who still need to change their password
const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.must_change_password) return <Navigate to="/admin/change-password" replace />;
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
};

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<HomePage />} />
    <Route path="/tee-times" element={<TeeTimesPage />} />
    <Route path="/book/:slotId" element={<BookingPage />} />

    {/* Authenticated golfer routes */}
    <Route path="/my-bookings" element={
      <RequireAuth><MyBookingsPage /></RequireAuth>
    } />

    {/* Admin login — standalone page, not linked from the public site */}
    <Route path="/admin/login" element={<AdminLoginPage />} />

    {/* Force password change — shown on first login */}
    <Route path="/admin/change-password" element={<ChangePasswordPage />} />

    {/* Admin routes */}
    <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
    <Route path="/admin/course" element={<RequireAdmin><AdminCourse /></RequireAdmin>} />
    <Route path="/admin/tee-times" element={<RequireAdmin><AdminTeeTimes /></RequireAdmin>} />
    <Route path="/admin/bookings" element={<RequireAdmin><AdminBookings /></RequireAdmin>} />
    <Route path="/admin/closures" element={<RequireAdmin><AdminClosures /></RequireAdmin>} />
    <Route path="/admin/pricing" element={<RequireAdmin><AdminPricing /></RequireAdmin>} />
    <Route path="/admin/settings" element={<RequireAdmin><AdminSettings /></RequireAdmin>} />

    {/* Catch-all — redirect to home */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App: React.FC = () => (
  <BrowserRouter>
    <TenantProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </TenantProvider>
  </BrowserRouter>
);

export default App;
