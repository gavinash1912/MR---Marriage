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
      className={`envelope-splash ${phase === 'opening' ? 'envelope-splash--opening' : ''}`}
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      aria-label="Tap to open invitation"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(); }}
    >
      <div className="envelope-splash__envelope">
        <div className="envelope-splash__body">
          <div className="envelope-splash__inner-flap" />
        </div>
        <div className="envelope-splash__seal">
          <span className="envelope-splash__seal-text">M&R</span>
        </div>
        <div className="envelope-splash__flap" />
      </div>
      <p className="envelope-splash__prompt">Tap to open</p>
    </div>
  );
}
