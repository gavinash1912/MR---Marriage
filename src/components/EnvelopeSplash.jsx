import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'envelope-opened';
const ANIMATION_DURATION = 1400;

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
        <div className="invite-splash__flap" />
        <div className="invite-splash__body">
          <svg className="invite-splash__floral invite-splash__floral--tl" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="35" cy="35" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="35" cy="35" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M55 20c8 4 12 12 10 22" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M60 45c-6 8-4 16 2 22" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <ellipse cx="80" cy="30" rx="10" ry="14" fill="none" stroke="currentColor" strokeWidth="1.1" transform="rotate(-20 80 30)" />
            <path d="M20 60c10-2 18 4 20 14" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <circle cx="28" cy="80" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="28" cy="80" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </svg>
          <svg className="invite-splash__floral invite-splash__floral--br" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="85" cy="85" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="85" cy="85" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M65 100c-8-4-12-12-10-22" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M60 75c6-8 4-16-2-22" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <ellipse cx="40" cy="90" rx="10" ry="14" fill="none" stroke="currentColor" strokeWidth="1.1" transform="rotate(20 40 90)" />
            <path d="M100 60c-10 2-18-4-20-14" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <circle cx="92" cy="40" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="92" cy="40" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </svg>
        </div>
        <div className="invite-splash__seal">
          <span className="invite-splash__seal-text">M&R</span>
        </div>
      </div>
      <p className="invite-splash__tagline">YOU ARE INVITED FOR OUR SPECIAL DAY</p>
      <p className="invite-splash__prompt">Tap to open</p>
    </div>
  );
}
