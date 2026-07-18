import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
        <Route path="/"        element={<Home />}     />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/rsvp"    element={<RSVP />}     />
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
