import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FloralLeft, FloralRight, FloralTopBanner, FloralSprig } from '../components/FloralDecor';
import {
  Calendar, MapPin, Clock, Play, Pause, Volume1, Volume2, VolumeX,
  Settings, Maximize
} from 'lucide-react';
import { trackEvent, useVisitAnalytics } from '../utils/analytics';

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
    <div className="countdown-block">
      <span className="countdown-digit">{String(value).padStart(2, '0')}</span>
      <span>{label}</span>
    </div>
  );
}

// ── Streaming-style video player ─────────────────────────────────────────────
function WelcomeVideo({ visitId, onAction = () => {} }) {
  const wrapperRef = useRef(null);
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const draggingRef = useRef(false);
  const lastVolumeRef = useRef(1);
  const fullscreenStateRef = useRef(false);
  const watchedMilestonesRef = useRef(new Set());

  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [hasTrackedPlay, setHasTrackedPlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [hoverTime, setHoverTime] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetch('/videos/welcome.mp4', { method: 'HEAD' })
      .then(r => { if (r.ok) setHasVideo(true); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (hasVideo && videoRef.current) {
      videoRef.current.play().catch(() => setPlaying(false));
    }
  }, [hasVideo]);

  useEffect(() => {
    const video = videoRef.current;
    const updateFullscreenState = (nextFullscreen, mode) => {
      if (fullscreenStateRef.current === nextFullscreen) return;

      fullscreenStateRef.current = nextFullscreen;
      setIsFullscreen(nextFullscreen);
      onAction(
        nextFullscreen ? 'video_fullscreen_enter' : 'video_fullscreen_exit',
        nextFullscreen ? 'Entered video fullscreen' : 'Exited video fullscreen',
        {
          mode,
          currentTime: Math.round(videoRef.current?.currentTime || 0),
        }
      );
    };

    const handleFullscreenChange = () => {
      updateFullscreenState(document.fullscreenElement === wrapperRef.current, 'browser');
    };
    const handleWebkitBeginFullscreen = () => updateFullscreenState(true, 'native');
    const handleWebkitEndFullscreen = () => updateFullscreenState(false, 'native');

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    video?.addEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen);
    video?.addEventListener('webkitendfullscreen', handleWebkitEndFullscreen);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      video?.removeEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen);
      video?.removeEventListener('webkitendfullscreen', handleWebkitEndFullscreen);
    };
  }, [hasVideo, onAction]);

  useEffect(() => () => clearTimeout(controlsTimerRef.current), []);

  useEffect(() => {
    clearTimeout(controlsTimerRef.current);

    if (!playing || settingsOpen || isDragging) {
      setControlsVisible(true);
      return undefined;
    }

    controlsTimerRef.current = setTimeout(() => setControlsVisible(false), 2600);
    return () => clearTimeout(controlsTimerRef.current);
  }, [playing, settingsOpen, isDragging]);

  const formatTime = (time) => {
    if (!Number.isFinite(time) || time < 0) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    const minutePart = hours ? String(minutes).padStart(2, '0') : String(minutes);

    return `${hours ? `${hours}:` : ''}${minutePart}:${String(seconds).padStart(2, '0')}`;
  };

  const revealControls = () => {
    setControlsVisible(true);
    clearTimeout(controlsTimerRef.current);

    if (playing && !settingsOpen && !draggingRef.current) {
      controlsTimerRef.current = setTimeout(() => setControlsVisible(false), 2600);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isDragging) {
      setCurrentTime(videoRef.current.currentTime);
      const watchedPercent = videoRef.current.duration
        ? Math.floor((videoRef.current.currentTime / videoRef.current.duration) * 100)
        : 0;

      [25, 50, 75, 100].forEach(milestone => {
        const reachedMilestone = milestone === 100 ? watchedPercent >= 95 : watchedPercent >= milestone;
        if (reachedMilestone && !watchedMilestonesRef.current.has(milestone)) {
          watchedMilestonesRef.current.add(milestone);
          onAction('video_watch_percent', `Watched video ${milestone}%`, { percent: milestone });
        }
      });

      if (!hasTrackedPlay && videoRef.current.currentTime >= 10) {
        trackEvent('video_play', {
          visitId,
          actionName: 'video_play',
          actionLabel: 'Watched welcome video for 10 seconds',
          metadata: { currentTime: Math.round(videoRef.current.currentTime) },
        });
        setHasTrackedPlay(true);
      }
    }
  };

  const handleProgress = () => {
    const video = videoRef.current;
    if (!video?.duration || !video.buffered.length) return;

    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    setBufferedPercent(Math.min(100, (bufferedEnd / video.duration) * 100));
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      videoRef.current.volume = volume;
    }
  };

  const getSeekTime = (clientX) => {
    if (!duration || !progressRef.current) return 0;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return percent * duration;
  };

  const seekToClientX = (clientX) => {
    if (!videoRef.current) return;
    const nextTime = getSeekTime(clientX);
    videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleProgressPointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    draggingRef.current = true;
    setIsDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    seekToClientX(e.clientX);
    revealControls();
  };

  const handleProgressPointerMove = (e) => {
    if (e.pointerType === 'mouse') {
      setHoverTime(getSeekTime(e.clientX));
    }
    if (draggingRef.current) {
      seekToClientX(e.clientX);
    }
  };

  const handleProgressPointerUp = (e) => {
    e.stopPropagation();
    if (draggingRef.current && videoRef.current) {
      seekToClientX(e.clientX);
      onAction('video_seek', `Seeked video to ${formatTime(videoRef.current.currentTime)}`, {
        toSeconds: Math.round(videoRef.current.currentTime),
      });
    }
    draggingRef.current = false;
    setIsDragging(false);
    revealControls();
  };

  const handleProgressPointerCancel = () => {
    draggingRef.current = false;
    setIsDragging(false);
    revealControls();
  };

  const toggleMute = (e) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !muted && volume > 0;

    if (!nextMuted && volume === 0) {
      const restoredVolume = lastVolumeRef.current || 1;
      videoRef.current.volume = restoredVolume;
      setVolume(restoredVolume);
    }

    videoRef.current.muted = nextMuted;
    onAction(muted ? 'video_unmute' : 'video_mute', muted ? 'Unmuted welcome video' : 'Muted welcome video');
    setMuted(nextMuted);
    revealControls();
  };

  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const nextVolume = Number(e.target.value);
    if (!videoRef.current) return;

    videoRef.current.volume = nextVolume;
    videoRef.current.muted = nextVolume === 0;
    setVolume(nextVolume);
    setMuted(nextVolume === 0);
    if (nextVolume > 0) lastVolumeRef.current = nextVolume;
  };

  const togglePlay = (e) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    setSettingsOpen(false);
    if (!videoRef.current.paused) {
      onAction('video_pause', 'Paused welcome video');
      videoRef.current.pause();
      setPlaying(false);
      setControlsVisible(true);
    } else {
      onAction('video_resume', 'Resumed welcome video');
      videoRef.current.play().catch(() => setPlaying(false));
      revealControls();
    }
  };

  const changePlaybackRate = (rate) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setSettingsOpen(false);
    onAction('video_playback_rate', `Changed playback speed to ${rate}x`, { rate });
    revealControls();
  };

  const toggleFullscreen = async (e) => {
    e?.stopPropagation();
    setSettingsOpen(false);

    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
      return;
    }

    if (wrapperRef.current?.requestFullscreen) {
      await wrapperRef.current.requestFullscreen();
    } else if (videoRef.current?.webkitEnterFullscreen) {
      videoRef.current.webkitEnterFullscreen();
    }
    revealControls();
  };

  const skipBy = (seconds) => {
    if (!videoRef.current) return;
    const nextTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
    onAction('video_seek', `${seconds > 0 ? 'Skipped forward' : 'Skipped back'} ${Math.abs(seconds)} seconds`, {
      toSeconds: Math.round(nextTime),
    });
    revealControls();
  };

  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    const key = e.key.toLowerCase();
    if ([' ', 'k', 'm', 'f', 'arrowleft', 'arrowright'].includes(key)) {
      e.preventDefault();
    }

    if (key === ' ' || key === 'k') togglePlay();
    if (key === 'm') toggleMute();
    if (key === 'f') toggleFullscreen();
    if (key === 'arrowleft') skipBy(-5);
    if (key === 'arrowright') skipBy(5);
  };

  const handleProgressKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      skipBy(-5);
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      skipBy(5);
    }
  };

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const playedPercent = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const chromeVisible = controlsVisible || !playing || settingsOpen || isDragging;

  const handleVideoSurfaceClick = (e) => {
    e.stopPropagation();

    if (!chromeVisible) {
      revealControls();
      return;
    }

    togglePlay();
  };

  if (!hasVideo) {
    return (
      <div className="video-wrapper">
        <div className="aspect-video bg-mauve-100 flex flex-col items-center justify-center gap-4">
          <FloralSprig />
          <p className="font-serif text-lg text-mauve-500 italic">Wedding invitation video coming soon…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={`video-wrapper stream-player ${chromeVisible ? 'stream-player--active' : ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={revealControls}
      onPointerMove={(e) => {
        if (e.pointerType === 'mouse') revealControls();
      }}
      onMouseLeave={() => {
        if (playing && !settingsOpen && !draggingRef.current) setControlsVisible(false);
      }}
      aria-label="Wedding invitation video player"
    >
      <video
        ref={videoRef}
        src="/videos/welcome.mp4"
        autoPlay
        muted={muted}
        loop
        playsInline
        className="w-full block"
        onPlay={() => setPlaying(true)}
        onPause={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onClick={handleVideoSurfaceClick}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onLoadedMetadata={handleLoadedMetadata}
      />

      <div className={`stream-top-chrome ${chromeVisible ? 'is-visible' : ''}`}>
        <p className="stream-video-title">Manas &amp; Rupa Sri</p>
        <p className="stream-video-subtitle">Wedding Invitation</p>
      </div>

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          className="stream-center-play"
          aria-label="Play video"
          title="Play"
        >
          <Play className="w-8 h-8 ml-1" fill="currentColor" />
        </button>
      )}

      <div className={`stream-bottom-chrome ${chromeVisible ? 'is-visible' : ''}`}>
        <div
          ref={progressRef}
          className="stream-progress"
          role="slider"
          tabIndex={0}
          aria-label="Video progress"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration || 0)}
          aria-valuenow={Math.round(currentTime)}
          onKeyDown={handleProgressKeyDown}
          onPointerDown={handleProgressPointerDown}
          onPointerMove={handleProgressPointerMove}
          onPointerUp={handleProgressPointerUp}
          onPointerCancel={handleProgressPointerCancel}
          onPointerLeave={() => {
            if (!draggingRef.current) setHoverTime(null);
          }}
        >
          <div className="stream-progress__track">
            <div className="stream-progress__buffered" style={{ width: `${bufferedPercent}%` }} />
            <div className="stream-progress__played" style={{ width: `${playedPercent}%` }} />
            <div className="stream-progress__thumb" style={{ left: `${playedPercent}%` }} />
          </div>
          {hoverTime !== null && (
            <span
              className="stream-progress__tooltip"
              style={{ left: `${duration ? (hoverTime / duration) * 100 : 0}%` }}
            >
              {formatTime(hoverTime)}
            </span>
          )}
        </div>

        <div className="stream-controls">
          <div className="stream-controls__group">
            <button
              type="button"
              onClick={togglePlay}
              className="stream-control-button"
              aria-label={playing ? 'Pause video' : 'Play video'}
              title={playing ? 'Pause' : 'Play'}
            >
              {playing
                ? <Pause className="w-5 h-5" fill="currentColor" />
                : <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
              }
            </button>

            <div className="stream-volume">
              <button
                type="button"
                onClick={toggleMute}
                className="stream-control-button"
                aria-label={muted ? 'Unmute video' : 'Mute video'}
                title={muted ? 'Unmute' : 'Mute'}
              >
                <VolumeIcon className="w-5 h-5" />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onClick={e => e.stopPropagation()}
                onChange={handleVolumeChange}
                onPointerUp={() => onAction('video_volume', `Changed video volume to ${Math.round(volume * 100)}%`, {
                  volume: Math.round(volume * 100),
                })}
                className="stream-volume__slider"
                aria-label="Video volume"
              />
            </div>

            <span className="stream-time">
              {formatTime(currentTime)} <span>/</span> {formatTime(duration)}
            </span>
          </div>

          <div className="stream-controls__group">
            <div className="stream-settings-wrap">
              {settingsOpen && (
                <div className="stream-settings-menu" onClick={e => e.stopPropagation()}>
                  <p className="stream-settings-menu__title">Playback speed</p>
                  {[0.75, 1, 1.25, 1.5, 2].map(rate => (
                    <button
                      type="button"
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={playbackRate === rate ? 'is-active' : ''}
                    >
                      <span>{rate === 1 ? 'Normal' : `${rate}x`}</span>
                      {playbackRate === rate && <span aria-hidden="true">✓</span>}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSettingsOpen(open => !open);
                  setControlsVisible(true);
                }}
                className={`stream-control-button ${settingsOpen ? 'is-active' : ''}`}
                aria-label="Playback settings"
                aria-expanded={settingsOpen}
                title="Playback settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="stream-control-button"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Main Home page ───────────────────────────────────────────────────────────
export default function Home() {
  const MARRIAGE_DATE = '2026-09-05T08:00:00';
  const countdown = useCountdown(MARRIAGE_DATE);
  const { visitId, trackAction, handleTrackedClick } = useVisitAnalytics({
    sections: ['Hero', 'Blessing', 'Event Details', 'Video', 'RSVP', 'Things To Know', 'Countdown'],
  });

  const inviteCards = [
    {
      title: 'Marriage Ceremony',
      copy: 'Saturday, September 5, 2026',
      icon: Calendar,
    },
    {
      title: 'Atithi Venue',
      copy: '9060 Independence Parkway, Plano, TX 75025',
      icon: MapPin,
    },
    {
      title: '8:00 AM Onwards',
      copy: 'Breakfast and lunch will be served',
      icon: Clock,
    },
  ];

  return (
    <div className="city2-page min-h-screen bg-[#fffaf4] text-mauve-900" onClickCapture={handleTrackedClick}>

      {/* ── Hero section ───────────────────────────────────── */}
      <section
        data-analytics-section="Hero"
        className="invite-hero"
      >
        <FloralTopBanner className="invite-hero__banner" />

        <div className="invite-hero__side invite-hero__side--left">
          <FloralLeft className="w-full h-full" />
        </div>
        <div className="invite-hero__side invite-hero__side--right">
          <FloralRight className="w-full h-full" />
        </div>

        <div className="invite-hero__content">
          <p className="invite-kicker animate-fade-in-up delay-200">Save the date</p>

          <div className="invite-hero__names animate-fade-in-up delay-300">
            <h1>Manas</h1>
            <div className="invite-hero__amp">
              <span>Weds</span>
            </div>
            <h1>Rupa Sri</h1>
          </div>

          <p className="invite-hero__copy animate-fade-in-up delay-400">
            September 5, 2026 · Plano, Texas
          </p>

          <div className="invite-meta animate-fade-in-up delay-500" aria-label="Wedding details">
            <span><Calendar className="w-4 h-4" /> September 5, 2026</span>
            <span><Clock className="w-4 h-4" /> 8:00 AM - 2:00 PM</span>
            <span><MapPin className="w-4 h-4" /> Atithi Venue, Plano</span>
          </div>

          <div className="invite-hero__actions animate-fade-in-up delay-600">
            <Link to="/rsvp" className="btn-primary">
              RSVP
            </Link>
            <Link to="/schedule" className="btn-secondary">
              Schedule
            </Link>
          </div>
        </div>

        <div className="invite-hero__peek" aria-hidden="true">
          <span>Hindu Wedding</span>
          <span>Plano, Texas</span>
          <span>September 5, 2026</span>
        </div>
      </section>

      <section data-analytics-section="Blessing" className="invite-section city2-blessing">
        <div className="invite-section__inner max-w-3xl">
          <div className="city2-invite-card">
            <p className="city2-mantra">Om Sri Ganeshaya Namah</p>
            <p className="city2-small-copy">With the heavenly blessings of their families</p>
            <div className="city2-rule" />
            <p className="invite-kicker">Invite</p>
            <p className="city2-large-copy">
              You to join us in the wedding celebrations of
            </p>
            <h2>Manas <span>&amp;</span> Rupa Sri</h2>
            <p className="city2-small-copy">On the following event</p>
          </div>
        </div>
      </section>

      {/* ── Invitation event section ────────────────────────── */}
      <section data-analytics-section="Event Details" className="invite-section invite-section--sage city2-events">
        <div className="invite-section__inner">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="invite-kicker">On the following event</p>
            <h2 className="section-title">Marriage Ceremony</h2>
            <p className="section-lede mx-auto mt-4">
              One joyful morning of blessings, rituals, photos, and lunch.
            </p>
          </div>

          <div className="city2-event-card">
            <div className="city2-event-card__image" aria-hidden="true">
              <span>MR</span>
            </div>
            <div className="city2-event-card__content">
              <p className="invite-kicker">Shaadi</p>
              <h3>Marriage Ceremony</h3>
              <p>Saturday, September 5, 2026</p>
              <p>Atithi Venue, Plano</p>
              <p>8:00 AM Onwards</p>
              <a
                href="https://maps.google.com/?q=Atithi+Venue+9060+Independence+Parkway+Plano+TX+75025"
                target="_blank"
                rel="noopener noreferrer"
              >
                See the route
              </a>
            </div>
          </div>

          <div className="invite-card-grid mt-5">
            {inviteCards.map(({ title, copy, icon: Icon }) => (
              <article key={title} className="invite-card">
                <div className="invite-card__icon">
                  <Icon className="w-5 h-5" />
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Welcome video section ───────────────────────────── */}
      <section data-analytics-section="Video" className="invite-section bg-[#fffaf4]">
        <div className="invite-section__inner max-w-5xl">
          <div className="section-heading-row">
            <div>
              <p className="invite-kicker">Meet the</p>
              <h2 className="section-title text-left">Bride and Groom</h2>
            </div>
            <p className="section-lede">
              We are delighted that you are able to join us in celebrating one of the happiest days of our lives.
            </p>
          </div>
          <WelcomeVideo visitId={visitId} onAction={trackAction} />
        </div>
      </section>

      <section data-analytics-section="RSVP" className="invite-section city2-rsvp-strip">
        <div className="invite-section__inner max-w-2xl text-center">
          <p className="invite-kicker">Please</p>
          <h2 className="section-title">RSVP</h2>
          <p className="section-lede mx-auto mt-4">
            Confirm your attendance and add any accompanying guests.
          </p>
          <Link to="/rsvp" className="btn-primary mt-7">
            Submit RSVP
          </Link>
        </div>
      </section>

      <section data-analytics-section="Things To Know" className="invite-section city2-know">
        <div className="invite-section__inner">
          <div className="section-heading-row">
            <div>
              <p className="invite-kicker">Things to know</p>
              <h2 className="section-title text-left">For the day</h2>
            </div>
            <p className="section-lede">
              A few helpful details for guests before arriving at Atithi Venue.
            </p>
          </div>

          <div className="city2-info-grid">
            <article>
              <h3>Venue</h3>
              <p>Atithi Venue, 9060 Independence Parkway, Plano, TX 75025.</p>
            </article>
            <article>
              <h3>Timing</h3>
              <p>The ceremony begins at 8:00 AM. Breakfast and lunch will be served.</p>
            </article>
            <article>
              <h3>RSVP</h3>
              <p>Please confirm your attendance and add any accompanying guests.</p>
            </article>
          </div>
        </div>
      </section>

      <section data-analytics-section="Countdown" className="invite-section city2-countdown">
        <div className="invite-section__inner max-w-3xl text-center">
          <p className="invite-kicker">The countdown begins</p>
          <h2 className="section-title">September 5, 2026</h2>
          <div className="countdown-panel mt-8" aria-label="Countdown to wedding">
            <CountdownBlock value={countdown.days}    label="Days"    />
            <CountdownBlock value={countdown.hours}   label="Hours"   />
            <CountdownBlock value={countdown.minutes} label="Minutes" />
            <CountdownBlock value={countdown.seconds} label="Seconds" />
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="invite-footer">
        <FloralSprig className="mb-4" />
        <p className="font-serif italic text-mauve-500 text-base">
          Manas &amp; Rupa Sri &nbsp;·&nbsp; September 5, 2026
        </p>
        <p className="font-sans text-xs text-mauve-300 mt-2">Plano, Texas</p>
      </footer>

    </div>
  );
}
