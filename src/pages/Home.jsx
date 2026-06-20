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
    <div className="flex flex-col items-center gap-1">
      <span className="countdown-digit">{String(value).padStart(2, '0')}</span>
      <span className="font-sans text-xs tracking-widest uppercase text-mauve-500">{label}</span>
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
      const video = videoRef.current;

      video.play().catch(() => {
        video.muted = true;
        setMuted(true);
        video.play().catch(() => setPlaying(false));
      });
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
    <div
      ref={wrapperRef}
      className={`video-wrapper stream-player ${chromeVisible ? 'stream-player--active' : ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={revealControls}
      onPointerMove={revealControls}
      onMouseLeave={() => {
        if (playing && !settingsOpen && !draggingRef.current) setControlsVisible(false);
      }}
      aria-label="Welcome invitation video player"
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
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onLoadedMetadata={handleLoadedMetadata}
      />

      <div className={`stream-top-chrome ${chromeVisible ? 'is-visible' : ''}`}>
        <p className="stream-video-title">Avinash &amp; Ananya</p>
        <p className="stream-video-subtitle">Welcome Invitation</p>
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

      {!chromeVisible && (
        <button
          type="button"
          className="stream-tap-layer"
          onClick={(e) => {
            e.stopPropagation();
            revealControls();
          }}
          aria-label="Show video controls"
        />
      )}
    </div>
  );
}

// ── Main Home page ───────────────────────────────────────────────────────────
export default function Home() {
  const ENGAGEMENT_DATE = '2026-07-05T08:00:00';
  const countdown = useCountdown(ENGAGEMENT_DATE);
  const { visitId, trackAction, handleTrackedClick } = useVisitAnalytics({
    sections: ['Hero', 'Video', 'Event Details'],
  });

  return (
    <div className="min-h-screen bg-white" onClickCapture={handleTrackedClick}>

      {/* ── Hero section ───────────────────────────────────── */}
      <section
        data-analytics-section="Hero"
        className="relative min-h-fit sm:min-h-screen flex flex-col items-center overflow-hidden bg-white"
      >

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
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 pt-10 sm:pt-16 lg:pt-28 xl:pt-40 pb-4 sm:pb-12 px-12 sm:px-24 lg:px-52 text-center">
          <h1 className="animate-fade-in-up delay-200 font-allura text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] text-mauve-800 leading-none mb-2">
            Avinash
          </h1>

          <div className="animate-fade-in-up delay-300 flex items-center gap-3 my-2">
            <FloralSprig />
            <p className="font-allura text-3xl md:text-4xl text-mauve-500">and</p>
            <FloralSprig />
          </div>

          <h1 className="animate-fade-in-up delay-400 font-allura text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] text-mauve-800 leading-none mb-8">
            Ananya
          </h1>

          <div className="animate-fade-in-up delay-500 flex items-center gap-3 text-mauve-600 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="font-serif text-lg md:text-xl tracking-wider">July 5, 2026</span>
          </div>

          <div className="animate-fade-in-up delay-600 flex items-center gap-3 text-mauve-500 mb-6">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="font-sans text-sm md:text-base">
              Grandion Event Venue &nbsp;·&nbsp; Frisco, TX
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

      </section>

      {/* ── Welcome video section ───────────────────────────── */}
      <section data-analytics-section="Video" className="pt-2 pb-20 px-4 bg-mauve-50/40">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-sans text-xs tracking-widest3 uppercase text-mauve-400 mb-3">A message from</p>
          <h2 className="section-title mb-3">Avinash &amp; Ananya</h2>
          <div className="floral-divider my-6">
            <FloralSprig />
          </div>
          <p className="font-serif italic text-mauve-600 text-lg mb-10 max-w-lg mx-auto">
            We are so grateful to have you in our lives and celebrate this special moment together. Watch our welcome invitation below.
          </p>
          <WelcomeVideo visitId={visitId} onAction={trackAction} />
        </div>
      </section>

      {/* ── Event details section ───────────────────────────── */}
      <section data-analytics-section="Event Details" className="py-20 px-4">
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
                <p className="font-serif text-xl text-mauve-800">Grandion Event Venue</p>
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
