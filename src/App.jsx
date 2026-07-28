import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar  from './components/Navbar';
import EnvelopeSplash from './components/EnvelopeSplash';
import Home    from './pages/Home';
import Schedule from './pages/Schedule';
import RSVP   from './pages/RSVP';
import Admin   from './pages/Admin';

const DEFAULT_ADMIN_PATH = '/owner-rsvp-mr-2026';

function normalizeAdminPath(path) {
  const cleanPath = String(path || '').trim();
  if (!cleanPath) return DEFAULT_ADMIN_PATH;
  return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
}

const ADMIN_PATH = normalizeAdminPath(import.meta.env.VITE_ADMIN_PATH);

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppLayout() {
  const { pathname } = useLocation();
  const isAdmin = pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);

  return (
    <>
      <EnvelopeSplash />
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/"        element={<Navigate to="/wedding" replace />} />
        <Route path="/schedule" element={<Navigate to="/wedding/venue" replace />} />
        <Route path="/rsvp"    element={<Navigate to="/wedding/rsvp" replace />} />
        <Route path="/marriage/celebrations"          element={<Home invitationMode="full" />}     />
        <Route path="/marriage/celebrations/schedule" element={<Schedule invitationMode="full" />} />
        <Route path="/marriage/celebrations/rsvp"     element={<RSVP invitationMode="full" />}     />
        <Route path="/wedding"          element={<Home invitationMode="wedding-only" />}     />
        <Route path="/wedding/venue"    element={<Schedule invitationMode="wedding-only" />} />
        <Route path="/wedding/schedule" element={<Navigate to="/wedding/venue" replace />} />
        <Route path="/wedding/rsvp"     element={<RSVP invitationMode="wedding-only" />}     />
        <Route path={ADMIN_PATH} element={<Admin />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
