import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FloralLeft, FloralRight, FloralTopBanner, FloralSprig } from '../components/FloralDecor';
import { Calendar, MapPin, Clock, Play, Pause } from 'lucide-react';

// ── Countdown hook ──────────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ── Countdown block ─────────────────────────────────────────────────────────
function CountdownBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="countdown-digit">{String(value).padStart(2, '0')}</span>
      <span className="font-sans text-xs tracking-widest uppercase text-mauve-500">{label}</span>
    </div>
  );
}

// ── Video player — autoplay muted, click to unmute/pause ────────────────────
function WelcomeVideo() {
  const videoRef             = useRef(null);
  const [muted,   setMuted]  = useState(true);
  const [playing, setPlaying]= useState(true);
  const [hasVideo, setHasVideo] = useState(false);

  // Check if video file exists
  useEffect(() => {
    fetch('/videos/welcome.mp4', { method: 'HEAD' })
      .then(r => { if (r.ok) setHasVideo(true); })
      .catch(() => {});
  }, []);

  // Autoplay once we know video exists
  useEffect(() => {
    if (hasVideo && videoRef.current) {
      videoRef.current.play().catch(() => setPlaying(false));
    }
  }, [hasVideo]);

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(m => !m);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else         { videoRef.current.play();  setPlaying(true);  }
  };

  if (!hasVideo) {
    return (
      <div className="video-wrapper">
        <div className="aspect-video bg-mauve-100 flex flex-col items-center justify-center gap-4">
          <FloralSprig />
          <p className="font-serif text-lg text-mauve-500 italic">Welcome video coming soon…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-wrapper group cursor-pointer" onClick={togglePlay}>
      <video
        ref={videoRef}
        src="/videos/welcome.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="w-full block"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Controls overlay — visible on hover */}
      <div className="absolute inset-0 flex items-end justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/20 to-transparent">
        {/* Play/pause */}
        <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow">
          {playing
            ? <Pause className="w-4 h-4 text-mauve-700" />
            : <Play  className="w-4 h-4 text-mauve-700 ml-0.5" />
          }
        </div>

        {/* Mute/unmute button */}
        <button
          onClick={toggleMute}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow text-mauve-700 hover:bg-white transition-colors"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? (
            // Muted icon
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          ) : (
            // Unmuted icon
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z"/>
              <path d="M19.07 4.93a10 10 0 010 14.14"/>
              <path d="M15.54 8.46a5 5 0 010 7.07"/>
            </svg>
          )}
        </button>
      </div>

      {/* Paused overlay */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-mauve-700 ml-1" />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Home page ───────────────────────────────────────────────────────────
export default function Home() {
  const ENGAGEMENT_DATE = '2026-07-05T08:00:00';
  const countdown = useCountdown(ENGAGEMENT_DATE);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero section ───────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center overflow-hidden bg-white">

        {/* Floral top banner */}
        <FloralTopBanner className="absolute top-0 left-0 right-0 z-0" />

        {/* Side florals – narrow on mobile, full width on desktop */}
        <div className="absolute left-0 top-0 w-10 sm:w-20 lg:w-44 h-full z-0">
          <FloralLeft className="w-full h-full" />
        </div>
        <div className="absolute right-0 top-0 w-10 sm:w-20 lg:w-44 h-full z-0">
          <FloralRight className="w-full h-full" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 pt-20 sm:pt-28 lg:pt-44 xl:pt-56 pb-12 px-12 sm:px-24 lg:px-52 text-center">
          <h1 className="animate-fade-in-up delay-200 font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-widest2 text-mauve-800 uppercase leading-none mb-2">
            Avinash
          </h1>

          <div className="animate-fade-in-up delay-300 flex items-center gap-3 my-2">
            <FloralSprig />
            <p className="font-serif text-xl md:text-2xl text-mauve-500 italic">and</p>
            <FloralSprig />
          </div>

          <h1 className="animate-fade-in-up delay-400 font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-widest2 text-mauve-800 uppercase leading-none mb-8">
            Ananya
          </h1>

          <div className="animate-fade-in-up delay-500 flex items-center gap-3 text-mauve-600 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="font-serif text-lg md:text-xl tracking-wider">July 5, 2026</span>
          </div>

          <div className="animate-fade-in-up delay-600 flex items-center gap-3 text-mauve-500 mb-6">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="font-sans text-sm md:text-base">
              Grandion Event Center &nbsp;·&nbsp; Frisco, TX
            </span>
          </div>

          {/* Floral divider before countdown */}
          <div className="animate-fade-in-up floral-divider mb-6">
            <FloralSprig />
          </div>

          {/* Countdown */}
          <div className="animate-fade-in-up delay-700 flex items-center gap-6 sm:gap-10 mb-10">
            <CountdownBlock value={countdown.days}    label="Days"    />
            <span className="text-mauve-300 font-serif text-4xl mb-4">·</span>
            <CountdownBlock value={countdown.hours}   label="Hours"   />
            <span className="text-mauve-300 font-serif text-4xl mb-4">·</span>
            <CountdownBlock value={countdown.minutes} label="Minutes" />
            <span className="text-mauve-300 font-serif text-4xl mb-4">·</span>
            <CountdownBlock value={countdown.seconds} label="Seconds" />
          </div>

          {/* CTA */}
          <Link to="/rsvp" className="animate-fade-in-up delay-800 btn-primary text-base px-12 py-4">
            RSVP
          </Link>
        </div>

        {/* Floral sprig divider */}
        <div className="relative z-10 pb-8">
          <FloralSprig />
        </div>
      </section>

      {/* ── Welcome video section ───────────────────────────── */}
      <section className="py-20 px-4 bg-mauve-50/40">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-sans text-xs tracking-widest3 uppercase text-mauve-400 mb-3">A message from</p>
          <h2 className="section-title mb-3">Avinash &amp; Ananya</h2>
          <div className="floral-divider my-6">
            <FloralSprig />
          </div>
          <p className="font-serif italic text-mauve-600 text-lg mb-10 max-w-lg mx-auto">
            We are so grateful to have you in our lives and celebrate this special moment together. Watch our welcome invitation below.
          </p>
          <WelcomeVideo />
        </div>
      </section>

      {/* ── Event details section ───────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="floral-divider mb-8">
            <FloralSprig />
          </div>
          <p className="font-sans text-xs tracking-widest3 uppercase text-mauve-400 mb-3">The celebration</p>
          <h2 className="section-title mb-8">Engagement Ceremony</h2>

          <div className="card text-left space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-mauve-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar className="w-5 h-5 text-mauve-600" />
              </div>
              <div>
                <p className="form-label">Date</p>
                <p className="font-serif text-xl text-mauve-800">Sunday, July 5, 2026</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-mauve-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-5 h-5 text-mauve-600" />
              </div>
              <div>
                <p className="form-label">Time</p>
                <p className="font-serif text-xl text-mauve-800">8:00 AM — 2:00 PM</p>
                <p className="font-sans text-sm text-mauve-500 mt-1">Breakfast &amp; Lunch will be served</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-mauve-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-mauve-600" />
              </div>
              <div>
                <p className="form-label">Venue</p>
                <p className="font-serif text-xl text-mauve-800">Grandion Event Center</p>
                <p className="font-sans text-sm text-mauve-600 mt-0.5">1810 Parkwood Blvd, Frisco, TX 75034</p>
                <a
                  href="https://maps.google.com/?q=1810+Parkwood+Blvd+Frisco+TX+75034"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 font-sans text-xs tracking-wider uppercase text-mauve-600 hover:text-mauve-800 underline underline-offset-2"
                >
                  View on Maps →
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/rsvp" className="btn-primary">
              RSVP Now
            </Link>
            <Link to="/schedule" className="btn-secondary">
              View Schedule
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="py-12 text-center border-t border-mauve-100">
        <FloralSprig className="mb-4" />
        <p className="font-serif italic text-mauve-500 text-base">
          Avinash &amp; Ananya &nbsp;·&nbsp; July 5, 2026
        </p>
        <p className="font-sans text-xs text-mauve-300 mt-2">Frisco, Texas</p>
      </footer>

    </div>
  );
}
