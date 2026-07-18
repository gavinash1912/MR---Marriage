import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    // Set initial state in case page loads mid-scroll
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  const links = [
    { to: '/',         label: 'Home'     },
    { to: '/schedule', label: 'Schedule' },
    { to: '/rsvp',     label: 'RSVP'     },
  ];

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'pt-2' : 'pt-4'
      }`}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="nav-shell">

          {/* Couple name – links to home */}
          <Link
            to="/"
            className="nav-brand"
          >
            Manas &amp; Rupa Sri
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link ${isActive(to) ? 'is-active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="nav-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={`block w-6 h-0.5 bg-current transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-current transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-current transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="nav-mobile-menu">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`font-sans text-sm tracking-wider py-3 border-b border-mauve-100 last:border-0 ${
                isActive(to)
                  ? 'text-mauve-800 font-medium'
                  : 'text-mauve-600 hover:text-mauve-800'
              } transition-colors`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
