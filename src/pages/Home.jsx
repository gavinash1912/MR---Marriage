import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, MapPin } from 'lucide-react';
import { useVisitAnalytics } from '../utils/analytics';
import { useScrollReveal } from '../utils/scrollReveal';
import { WEDDING_EVENT_ID, getInvitationConfig } from '../utils/events';

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
    const id = setInterval(() => setTime(calc), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function CountdownBlock({ value, label }) {
  return (
    <div className="countdown-block">
      <span className="countdown-digit">{String(value).padStart(2, '0')}</span>
      <span>{label}</span>
    </div>
  );
}

function RsvpStrip({ rsvpPath }) {
  return (
    <div className="home-rsvp-strip">
      <Link to={rsvpPath} className="btn-primary home-rsvp-button" aria-label="RSVP for the wedding">
        <span>RSVP Now</span>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function HomeVenueDetails({ event, venuePath, primaryLabel = 'Venue Details', venueGroups = [], onVenueChange = null }) {
  const hasVenueGroups = venueGroups.length > 0;
  const [activeVenueIndex, setActiveVenueIndex] = useState(0);
  const swipeStartXRef = useRef(null);
  const swipeMovedRef = useRef(false);
  const details = hasVenueGroups
    ? venueGroups
    : [
        {
          label: 'Address',
          title: event.address,
        },
        {
          label: 'Wedding day timing',
          title: 'Evening 7:00 PM onwards · Muhurtham 9:30 PM',
          icon: Clock,
        },
      ];
  const venueCount = details.length;

  const showVenue = (index) => {
    if (!hasVenueGroups || venueCount === 0) return;
    const nextIndex = (index + venueCount) % venueCount;
    setActiveVenueIndex(nextIndex);
    onVenueChange?.(details[nextIndex], nextIndex, 'select');
  };

  const advanceVenue = (direction) => {
    if (!hasVenueGroups || venueCount === 0) return;
    setActiveVenueIndex(current => {
      const nextIndex = (current + direction + venueCount) % venueCount;
      onVenueChange?.(details[nextIndex], nextIndex, direction > 0 ? 'next' : 'previous');
      return nextIndex;
    });
  };

  const handleSwipeStart = (clientX) => {
    if (!hasVenueGroups || typeof clientX !== 'number') return;
    swipeStartXRef.current = clientX;
    swipeMovedRef.current = false;
  };

  const handleSwipeEnd = (clientX) => {
    if (!hasVenueGroups || typeof clientX !== 'number' || swipeStartXRef.current === null) return;
    const distance = clientX - swipeStartXRef.current;
    if (Math.abs(distance) > 36) {
      swipeMovedRef.current = true;
      advanceVenue(distance < 0 ? 1 : -1);
    }
    swipeStartXRef.current = null;
  };

  const getDeckPosition = (index) => {
    const offset = (index - activeVenueIndex + venueCount) % venueCount;
    if (offset === 0) return 'active';
    if (offset === 1) return 'next';
    return 'previous';
  };

  return (
    <section data-analytics-section="Venue Details" className="home-venue-section" data-reveal="fade-up">
      <p className="invite-kicker">Venue details</p>
      <h2 className="section-title">{hasVenueGroups ? 'Celebration Venues' : event.venue}</h2>

      <div className={`home-venue-card ${hasVenueGroups ? 'home-venue-card--multi' : ''}`}>
        {hasVenueGroups ? (
          <>
            <div
              className="venue-card-deck"
              role="region"
              aria-label="Celebration venues"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') advanceVenue(1);
                if (event.key === 'ArrowLeft') advanceVenue(-1);
              }}
              onPointerDown={(event) => {
                if (event.pointerType === 'mouse' && event.button !== 0) return;
                event.currentTarget.setPointerCapture?.(event.pointerId);
                handleSwipeStart(event.clientX);
              }}
              onPointerUp={(event) => handleSwipeEnd(event.clientX)}
              onPointerCancel={() => { swipeStartXRef.current = null; }}
            >
              {details.map(({ label, title, description, mapUrl, icon: Icon = MapPin }, index) => (
                <div
                  key={label}
                  className={`home-venue-detail venue-deck-card is-${getDeckPosition(index)}`}
                  onClick={() => {
                    if (swipeMovedRef.current) {
                      swipeMovedRef.current = false;
                      return;
                    }
                    showVenue(index);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      showVenue(index);
                    }
                  }}
                  role="button"
                  tabIndex={index === activeVenueIndex ? 0 : -1}
                  aria-label={`${label}: ${title}`}
                  aria-current={index === activeVenueIndex ? 'true' : undefined}
                >
                  <Icon className="w-5 h-5 venue-deck-card__icon" aria-hidden="true" />
                  <div className="venue-deck-card__content">
                    <span>{label}</span>
                    <p>{title}</p>
                    {description && <small>{description}</small>}
                    {mapUrl && index === activeVenueIndex && (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="venue-deck-map-link"
                        onClick={(event) => event.stopPropagation()}
                      >
                        Open Maps
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="venue-deck-dots" aria-label="Venue card selector">
              <span className="venue-deck-cue venue-deck-cue--left" aria-hidden="true" />
              {details.map(({ label }, index) => (
                <button
                  key={label}
                  type="button"
                  className={index === activeVenueIndex ? 'is-active' : ''}
                  onClick={() => showVenue(index)}
                  aria-label={`Show ${label}`}
                  aria-current={index === activeVenueIndex ? 'true' : undefined}
                />
              ))}
              <span className="venue-deck-cue venue-deck-cue--right" aria-hidden="true" />
            </div>
          </>
        ) : (
          <div className="home-venue-card__details">
            {details.map(({ label, title, description, icon: Icon = MapPin }) => (
              <div key={label} className="home-venue-detail">
                <Icon className="w-5 h-5" aria-hidden="true" />
                <div>
                  <span>{label}</span>
                  <p>{title}</p>
                  {description && <small>{description}</small>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="home-venue-card__actions">
          <Link to={venuePath} className="btn-primary home-venue-card__primary">
            {primaryLabel} <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          {!hasVenueGroups && (
            <a
              href={event.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary home-venue-card__secondary"
            >
              Open Maps
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Home({ invitationMode = 'full' }) {
  const invitation = getInvitationConfig(invitationMode);
  const weddingEvent = invitation.events.find(event => event.id === WEDDING_EVENT_ID) || invitation.events[0];
  const ranchHouseEvent = invitation.events.find(event => event.venue === 'Ranch House');
  const vrathamEvent = invitation.events.find(event => event.id === 'vratham');
  const fullInviteVenueGroups = invitation.showAllEvents
    ? [
        {
          label: 'Wedding ceremony',
          title: weddingEvent.venue,
          description: weddingEvent.address,
          mapUrl: weddingEvent.mapUrl,
        },
        {
          label: 'Pre-wedding events',
          title: ranchHouseEvent?.venue || 'Ranch House',
          description: ranchHouseEvent?.address || '708 Sam Davis Rd, Argyle, TX 76226',
          mapUrl: ranchHouseEvent?.mapUrl || 'https://maps.google.com/?q=708+Sam+Davis+Rd+Argyle+TX+76226',
        },
        {
          label: 'Vratham',
          title: vrathamEvent?.venue || "Groom's House",
          description: vrathamEvent?.address || '2845 Hale Rd, Celina, TX 75009',
          mapUrl: vrathamEvent?.mapUrl || 'https://maps.google.com/?q=2845+Hale+Rd+Celina+TX+75009',
        },
      ]
    : [];
  const countdown = useCountdown('2026-09-05T19:00:00');
  const homeSections = [
    'Hero',
    'Countdown',
    'Venue Details',
    ...(!invitation.showAllEvents ? ['Bottom RSVP'] : []),
  ];

  const { trackAction, handleTrackedClick } = useVisitAnalytics({
    sections: homeSections,
    metadata: {
      invitationMode: invitation.mode,
      invitationLabel: invitation.label,
      inviteHomePath: invitation.homePath,
    },
  });
  useScrollReveal();

  return (
    <div className={`home-page ${invitation.showAllEvents ? 'full-invite-page' : ''}`} onClickCapture={handleTrackedClick}>

      <section data-analytics-section="Hero" className="invitation-page">
        <main className="invitation-card">
          <img
            src="/images/poster-marriage.png"
            alt=""
            aria-hidden="true"
            className="invitation-card__bg"
            draggable="false"
          />

        </main>
      </section>

      <RsvpStrip rsvpPath={invitation.rsvpPath} />

      <section data-analytics-section="Countdown" className="home-countdown" data-reveal="fade-up">
        <p className="invite-kicker">The countdown begins</p>
        <h2 className="section-title">September 5, 2026</h2>
        <div className="countdown-panel" aria-label="Countdown to wedding">
          <CountdownBlock value={countdown.days}    label="Days"    />
          <CountdownBlock value={countdown.hours}   label="Hours"   />
          <CountdownBlock value={countdown.minutes} label="Minutes" />
          <CountdownBlock value={countdown.seconds} label="Seconds" />
        </div>
      </section>

      <HomeVenueDetails
        event={weddingEvent}
        venuePath={invitation.schedulePath}
        primaryLabel={invitation.showAllEvents ? 'View Timeline' : 'Venue Details'}
        venueGroups={fullInviteVenueGroups}
        onVenueChange={(venue, index, method) => {
          trackAction('venue_card_changed', `Viewed ${venue.label} venue card`, {
            venueLabel: venue.label,
            venueName: venue.title,
            venueIndex: index,
            method,
            invitationMode: invitation.mode,
          });
        }}
      />

      {!invitation.showAllEvents && (
        <section data-analytics-section="Bottom RSVP">
          <RsvpStrip rsvpPath={invitation.rsvpPath} />
        </section>
      )}

      <footer className="invite-footer">
        <p className="font-serif italic text-mauve-400 text-sm">
          Manas &amp; Rupa Sree &nbsp;&middot;&nbsp; September 5, 2026
        </p>
      </footer>

    </div>
  );
}
