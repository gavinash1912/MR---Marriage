import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'envelope-opened';
const ANIMATION_DURATION = 1600;

function getInitialPhase() {
  if (typeof window === 'undefined') return 'done';
  const alreadyOpened = sessionStorage.getItem(STORAGE_KEY);
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  return (alreadyOpened || !isMobile) ? 'done' : 'closed';
}

export default function EnvelopeSplash() {
  const [phase, setPhase] = useState(getInitialPhase);

  useEffect(() => {
    if (phase === 'closed') {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'opening') {
      const timer = setTimeout(() => {
        setPhase('done');
        document.body.style.overflow = '';
      }, ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleOpen = useCallback(() => {
    if (phase !== 'closed') return;
    sessionStorage.setItem(STORAGE_KEY, '1');
    setPhase('opening');
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      className={`invite-splash ${phase === 'opening' ? 'invite-splash--opening' : ''}`}
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      aria-label="Tap to open invitation"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(); }}
    >
      <div className="invite-splash__envelope">
        <div className="invite-splash__body">
          <svg className="invite-splash__floral invite-splash__floral--tl" viewBox="0 0 160 160" aria-hidden="true">
            <path d="M30 80c0-20 16-36 36-36s36 16 36 36" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="48" cy="44" r="12" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="48" cy="44" r="5" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <path d="M80 30c12 6 18 18 14 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <ellipse cx="105" cy="45" rx="11" ry="16" fill="none" stroke="currentColor" strokeWidth="1.1" transform="rotate(-15 105 45)" />
            <path d="M25 100c14-4 24 4 28 18" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <circle cx="38" cy="120" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="38" cy="120" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <path d="M60 105c8-2 14 3 16 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <path d="M110 70c-4 14-14 20-28 18" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <ellipse cx="130" cy="90" rx="8" ry="12" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(20 130 90)" />
          </svg>
          <svg className="invite-splash__floral invite-splash__floral--tr" viewBox="0 0 160 160" aria-hidden="true">
            <path d="M130 80c0-20-16-36-36-36s-36 16-36 36" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="112" cy="44" r="12" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="112" cy="44" r="5" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <path d="M80 30c-12 6-18 18-14 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <ellipse cx="55" cy="45" rx="11" ry="16" fill="none" stroke="currentColor" strokeWidth="1.1" transform="rotate(15 55 45)" />
            <path d="M135 100c-14-4-24 4-28 18" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <circle cx="122" cy="120" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="122" cy="120" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </svg>
          <svg className="invite-splash__floral invite-splash__floral--bl" viewBox="0 0 160 160" aria-hidden="true">
            <circle cx="50" cy="60" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="50" cy="60" r="6" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <path d="M70 40c10 6 14 16 10 28" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M30 90c12-2 22 6 24 18" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <ellipse cx="100" cy="80" rx="10" ry="14" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(-10 100 80)" />
            <path d="M80 110c-8-6-6-16 2-22" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <svg className="invite-splash__floral invite-splash__floral--br" viewBox="0 0 160 160" aria-hidden="true">
            <circle cx="110" cy="60" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="110" cy="60" r="6" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <path d="M90 40c-10 6-14 16-10 28" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M130 90c-12-2-22 6-24 18" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <ellipse cx="60" cy="80" rx="10" ry="14" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(10 60 80)" />
            <path d="M80 110c8-6 6-16-2-22" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>
        <div className="invite-splash__flap" />
        <div className="invite-splash__seal">
          <span className="invite-splash__seal-text">M&R</span>
        </div>
      </div>
      <p className="invite-splash__tagline">You are invited for our special day</p>
      <p className="invite-splash__prompt">Tap to open</p>
    </div>
  );
}
