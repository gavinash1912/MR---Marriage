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

  const isHome = location.pathname === '/';
  // Hide navbar content when at the very top of the home page
  const ghost = isHome && !scrolled;

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
        ghost
          ? 'bg-transparent shadow-none'
          : scrolled
            ? 'bg-white/95 backdrop-blur-sm shadow-sm'
            : 'bg-white/80'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Couple name – links to home */}
          <Link
            to="/"
            className={`font-serif text-lg md:text-xl tracking-widest2 text-mauve-800 hover:text-mauve-600 transition-all duration-500 uppercase ${
              ghost ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            Avinash &amp; Ananya
          </Link>

          {/* Desktop nav */}
          <nav className={`hidden md:flex items-center gap-8 transition-all duration-500 ${
            ghost ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`font-sans text-sm tracking-wider text-mauve-700 hover:text-mauve-900 transition-colors pb-1 ${
                  isActive(to) ? 'border-b-2 border-mauve-700 font-medium' : 'border-b-2 border-transparent'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden flex flex-col gap-1.5 p-2 -mr-2 text-mauve-700 transition-all duration-500 ${
              ghost ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
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
          menuOpen ? 'max-h-48 border-t border-mauve-100' : 'max-h-0'
        } bg-white/98 backdrop-blur-sm`}
      >
        <nav className="flex flex-col py-2 px-6">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`font-sans text-sm tracking-wider py-3 border-b border-mauve-50 last:border-0 ${
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
