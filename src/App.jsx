import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar  from './components/Navbar';
import Home    from './pages/Home';
import Schedule from './pages/Schedule';
import RSVP   from './pages/RSVP';
import Admin   from './pages/Admin';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppLayout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/"        element={<Navigate to="/wedding" replace />} />
        <Route path="/schedule" element={<Navigate to="/wedding/schedule" replace />} />
        <Route path="/rsvp"    element={<Navigate to="/wedding/rsvp" replace />} />
        <Route path="/mr-celebrations"          element={<Home invitationMode="full" />}     />
        <Route path="/mr-celebrations/schedule" element={<Schedule invitationMode="full" />} />
        <Route path="/mr-celebrations/rsvp"     element={<RSVP invitationMode="full" />}     />
        <Route path="/wedding"          element={<Home invitationMode="wedding-only" />}     />
        <Route path="/wedding/schedule" element={<Schedule invitationMode="wedding-only" />} />
        <Route path="/wedding/rsvp"     element={<RSVP invitationMode="wedding-only" />}     />
        {/* Admin at hidden URL — change this slug before going live */}
        <Route path="/admin-mr-2026" element={<Admin />} />
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
