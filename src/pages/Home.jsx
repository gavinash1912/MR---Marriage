import { useState, useEffect } from 'react';
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

function HomeVenueDetails({ event, venuePath, primaryLabel = 'Venue Details' }) {
  return (
    <section data-analytics-section="Venue Details" className="home-venue-section" data-reveal="fade-up">
      <p className="invite-kicker">Venue details</p>
      <h2 className="section-title">{event.venue}</h2>

      <div className="home-venue-card">
        <div className="home-venue-card__details">
          <div className="home-venue-detail">
            <MapPin className="w-5 h-5" aria-hidden="true" />
            <div>
              <span>Address</span>
              <p>{event.address}</p>
            </div>
          </div>

          <div className="home-venue-detail">
            <Clock className="w-5 h-5" aria-hidden="true" />
            <div>
              <span>Wedding day timing</span>
              <p>Evening 7:00 PM onwards · Muhurtham 9:30 PM</p>
            </div>
          </div>
        </div>

        <div className="home-venue-card__actions">
          <Link to={venuePath} className="btn-primary home-venue-card__primary">
            {primaryLabel} <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <a
            href={event.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary home-venue-card__secondary"
          >
            Open Maps
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Home({ invitationMode = 'full' }) {
  const invitation = getInvitationConfig(invitationMode);
  const weddingEvent = invitation.events.find(event => event.id === WEDDING_EVENT_ID) || invitation.events[0];
  const countdown = useCountdown('2026-09-05T19:00:00');
  const homeSections = [
    'Hero',
    'Countdown',
    'Venue Details',
    ...(!invitation.showAllEvents ? ['Bottom RSVP'] : []),
  ];

  const { handleTrackedClick } = useVisitAnalytics({
    sections: homeSections,
    metadata: {
      invitationMode: invitation.mode,
      invitationLabel: invitation.label,
      inviteHomePath: invitation.homePath,
    },
  });
  useScrollReveal();

  return (
    <div className="home-page" onClickCapture={handleTrackedClick}>

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
