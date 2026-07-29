import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar  from './components/Navbar';
import EnvelopeSplash from './components/EnvelopeSplash';
import Home    from './pages/Home';
import RSVP   from './pages/RSVP';
import Admin   from './pages/Admin';
import { flushQueuedAnalytics } from './utils/analytics';
import { flushLocalRsvps } from './utils/offlineOutbox';

const DEFAULT_ADMIN_PATH = '/admin-mr-2026';

function normalizeAdminPath(path) {
  const cleanPath = String(path || '').trim();
  if (!cleanPath) return DEFAULT_ADMIN_PATH;
  return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
}

const ADMIN_PATHS = Array.from(new Set([
  normalizeAdminPath(import.meta.env.VITE_ADMIN_PATH),
  DEFAULT_ADMIN_PATH,
].map(normalizeAdminPath)));

function isAdminPath(pathname) {
  return ADMIN_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function OfflineOutboxSync() {
  useEffect(() => {
    const flushQueuedWrites = () => {
      flushLocalRsvps().catch(() => {});
      flushQueuedAnalytics().catch(() => {});
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        flushQueuedWrites();
      }
    };

    flushQueuedWrites();
    window.addEventListener('online', flushQueuedWrites);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const interval = window.setInterval(flushQueuedWrites, 30000);

    return () => {
      window.removeEventListener('online', flushQueuedWrites);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}

function AppLayout() {
  const { pathname } = useLocation();
  const isAdmin = isAdminPath(pathname);

  return (
    <>
      {!isAdmin && <EnvelopeSplash />}
      <ScrollToTop />
      <OfflineOutboxSync />
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/"        element={<Navigate to="/wedding" replace />} />
        <Route path="/marriage/celebrations"          element={<Home invitationMode="full" />}     />
        <Route path="/marriage/celebrations/rsvp"     element={<RSVP invitationMode="full" />}     />
        <Route path="/wedding"          element={<Home invitationMode="wedding-only" />}     />
        <Route path="/wedding/rsvp"     element={<RSVP invitationMode="wedding-only" />}     />
        {ADMIN_PATHS.map(path => (
          <Route key={path} path={`${path}/*`} element={<Admin />} />
        ))}
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
