import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar  from './components/Navbar';
import Home    from './pages/Home';
import Schedule from './pages/Schedule';
import RSVP   from './pages/RSVP';
import Admin   from './pages/Admin';

const SITE_INACTIVE = import.meta.env.VITE_SITE_INACTIVE !== 'false';

function InactiveSite({ status, onUnlock }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        setError('Invalid owner code.');
        return;
      }

      onUnlock();
    } catch {
      setError('Unable to verify access. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-mauve-50 flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-sm rounded-lg bg-white border border-mauve-100 shadow-xl p-6 text-center">
        <p className="font-sans text-xs tracking-widest uppercase text-mauve-400 mb-3">
          Avinash &amp; Ananya
        </p>
        <h1 className="font-serif text-3xl text-mauve-800 mb-3">
          This site is currently inactive
        </h1>
        <p className="font-sans text-sm text-mauve-500 mb-6">
          Public access has been turned off.
        </p>

        {status === 'checking' ? (
          <p className="font-sans text-sm text-mauve-500">Checking owner access...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            <label className="form-label" htmlFor="owner-code">Owner Access</label>
            <input
              id="owner-code"
              type="password"
              className="form-input"
              value={code}
              onChange={event => setCode(event.target.value)}
              placeholder="Enter owner code"
              autoComplete="current-password"
            />
            {error && (
              <p className="font-sans text-xs text-red-600 text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting || !code.trim()}
              className={`btn-primary w-full flex items-center justify-center ${submitting || !code.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Checking...' : 'Unlock Site'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppLayout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const [accessStatus, setAccessStatus] = useState(SITE_INACTIVE ? 'checking' : 'unlocked');

  useEffect(() => {
    if (!SITE_INACTIVE) return undefined;

    let cancelled = false;

    fetch('/api/access')
      .then(response => response.ok ? response.json() : { authenticated: false })
      .then(data => {
        if (!cancelled) setAccessStatus(data.authenticated ? 'unlocked' : 'locked');
      })
      .catch(() => {
        if (!cancelled) setAccessStatus('locked');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (SITE_INACTIVE && accessStatus !== 'unlocked') {
    return (
      <InactiveSite
        status={accessStatus}
        onUnlock={() => setAccessStatus('unlocked')}
      />
    );
  }

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/"        element={<Home />}     />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/rsvp"    element={<RSVP />}     />
        {/* Admin at hidden URL — change this slug before going live */}
        <Route path="/admin-aa-2026" element={<Admin />} />
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
