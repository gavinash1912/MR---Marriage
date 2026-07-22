import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getInvitationConfig, getInvitationModeFromPath } from '../utils/events';

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const invitation = getInvitationConfig(getInvitationModeFromPath(location.pathname));

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
    { to: invitation.homePath,     label: 'Home'     },
    { to: invitation.schedulePath, label: 'Schedule' },
    { to: invitation.rsvpPath,     label: 'RSVP'     },
  ];

  const isActive = (to) => {
    if (to === invitation.homePath) return location.pathname === invitation.homePath;
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
            to={invitation.homePath}
            className="nav-brand"
          >
            Manas &amp; Rupa Sree
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
            type="button"
            className="nav-menu-button md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <span className={`block w-6 h-0.5 bg-current transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-current transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-current transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile dropdown menu */}
        <div
          id="mobile-navigation"
          className={`nav-mobile-panel md:hidden ${menuOpen ? 'is-open' : ''}`}
          aria-hidden={!menuOpen}
        >
          <nav className="nav-mobile-menu" aria-label="Mobile navigation">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`nav-mobile-link ${isActive(to) ? 'is-active' : ''}`}
                tabIndex={menuOpen ? 0 : -1}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
