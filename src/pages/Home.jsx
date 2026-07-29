import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CalendarPlus, ChevronRight, Clock, MapPin, Star, Utensils } from 'lucide-react';
import EventModal from '../components/EventModal';
import { useVisitAnalytics } from '../utils/analytics';
import { useScrollReveal } from '../utils/scrollReveal';
import { WEDDING_EVENT_ID, getInvitationConfig } from '../utils/events';
import { downloadCalendarInvite, getGoogleCalendarUrl } from '../utils/calendar';
import { FullCalendarInviteSection, TimelineEventsSection } from '../components/TimelineSections';

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

function RsvpStrip({ rsvpPath, showVenueButton = false, onVenueClick = null }) {
  return (
    <div className={`home-rsvp-strip ${showVenueButton ? 'home-rsvp-strip--paired' : ''}`}>
      <Link to={rsvpPath} className="btn-primary home-rsvp-button" aria-label="RSVP for the wedding">
        <span>RSVP Now</span>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </Link>
      {showVenueButton && (
        <button
          type="button"
          className="btn-secondary home-rsvp-button home-rsvp-button--secondary"
          onClick={onVenueClick}
          aria-label="View wedding venue details"
        >
          <span>Venue</span>
          <MapPin className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function VenueDetailsPanel({ event, onMapOpen = null }) {
  return (
    <div className="venue-priority-panel">
      <div className="venue-priority-panel__copy" data-reveal="slide-right">
        <p className="invite-kicker">Getting there</p>
        <h2>{event.venue}</h2>
        <p>
          Please use the main entrance at {event.venue}. The address and map link are below for easy navigation.
        </p>
      </div>

      <div className="venue-detail-list" data-reveal="card">
        <div className="venue-detail-item">
          <MapPin className="w-5 h-5" aria-hidden="true" />
          <div>
            <span>Address</span>
            <p>{event.address}</p>
          </div>
        </div>

        <div className="venue-detail-item">
          <Clock className="w-5 h-5" aria-hidden="true" />
          <div>
            <span>Arrival</span>
            <p>Evening 7:00 PM onwards</p>
          </div>
        </div>

        <div className="venue-detail-item">
          <Utensils className="w-5 h-5" aria-hidden="true" />
          <div>
            <span>Dinner</span>
            <p>8:00 PM · South Indian vegetarian cuisine</p>
          </div>
        </div>

        <div className="venue-detail-item">
          <Star className="w-5 h-5" aria-hidden="true" />
          <div>
            <span>Muhurtham</span>
            <p>9:30 PM</p>
          </div>
        </div>

        <a
          href={event.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary venue-map-button"
          onClick={() => onMapOpen?.(event, 'venue_detail_card')}
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}

function WeddingHomeVenueSection({ event, onMapOpen = null, onCalendarAction = null }) {
  return (
    <>
      <section
        id="wedding-venue"
        data-analytics-section="Venue Details"
        className="invite-section venue-priority-section home-wedding-venue-section"
      >
        <div className="invite-section__inner">
          <div className="home-wedding-venue-heading" data-reveal="fade-up">
            <p className="invite-kicker">Venue</p>
            <h2 className="section-title">{event.venue}</h2>
            <a
              href={event.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onMapOpen?.(event, 'venue_heading_address')}
            >
              <MapPin className="w-4 h-4" aria-hidden="true" />
              {event.address}
            </a>
          </div>
          <VenueDetailsPanel event={event} onMapOpen={onMapOpen} />
        </div>
      </section>

      <section data-analytics-section="Calendar Links" className="invite-section home-wedding-calendar-section">
        <div className="max-w-md mx-auto text-center px-4" data-reveal="fade-up">
          <p className="invite-kicker">Save the date</p>
          <h2 className="font-serif text-3xl md:text-4xl text-mauve-800 mb-3">Add it to your calendar</h2>
          <p className="section-lede mb-8">
            Add the marriage ceremony to your calendar so you don't miss it.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 btn-primary text-sm px-6 py-3"
              onClick={() => onCalendarAction?.('google', event, 'wedding_event')}
            >
              <CalendarPlus className="w-4 h-4" />
              Google Calendar
            </a>

            <button
              type="button"
              onClick={() => {
                onCalendarAction?.('apple_outlook', event, 'wedding_event');
                downloadCalendarInvite();
              }}
              className="flex items-center justify-center gap-2 btn-calendar-download text-sm px-6 py-3"
            >
              <Calendar className="w-4 h-4" />
              Apple / Outlook
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Home({ invitationMode = 'full' }) {
  const invitation = getInvitationConfig(invitationMode);
  const weddingEvent = invitation.events.find(event => event.id === WEDDING_EVENT_ID) || invitation.events[0];
  const [selectedEvent, setSelectedEvent] = useState(null);
  const countdown = useCountdown('2026-09-05T19:00:00');
  const homeSections = [
    'Hero',
    'Countdown',
    ...(invitation.showAllEvents ? ['Events Timeline', 'Calendar Links'] : ['Venue Details', 'Calendar Links']),
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

  const openEventDetails = (event) => {
    trackAction('event_details_opened', `Opened ${event.name} details`, {
      eventId: event.id,
      eventName: event.name,
      venue: event.venue,
      invitationMode: invitation.mode,
      source: 'home_timeline',
    });
    setSelectedEvent(event);
  };

  const trackCalendarAction = (provider, events, scope = 'all') => {
    const eventList = Array.isArray(events) ? events : [events].filter(Boolean);
    trackAction('calendar_invite_added', `${provider} calendar invite`, {
      provider,
      scope,
      eventCount: eventList.length,
      eventIds: eventList.map(event => event.id),
      invitationMode: invitation.mode,
      source: invitation.showAllEvents ? 'home_timeline' : 'home_calendar',
    });
  };

  const trackMapOpen = (event, source) => {
    trackAction('map_opened', `Opened map for ${event.venue}`, {
      eventId: event.id,
      eventName: event.name,
      venue: event.venue,
      mapUrl: event.mapUrl,
      invitationMode: invitation.mode,
      source,
    });
  };

  const scrollToVenueSection = () => {
    trackAction('venue_scroll_clicked', 'Clicked home venue button', {
      invitationMode: invitation.mode,
      source: 'home_rsvp_strip',
    });
    document.getElementById('wedding-venue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (invitation.showAllEvents || window.location.hash !== '#wedding-venue') return undefined;

    const id = window.setTimeout(() => {
      document.getElementById('wedding-venue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    return () => window.clearTimeout(id);
  }, [invitation.showAllEvents]);

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

      <RsvpStrip
        rsvpPath={invitation.rsvpPath}
        showVenueButton={!invitation.showAllEvents}
        onVenueClick={scrollToVenueSection}
      />

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

      {invitation.showAllEvents ? (
        <>
          <TimelineEventsSection
            events={invitation.events}
            onOpenEventDetails={openEventDetails}
            onOpenMap={(event) => trackMapOpen(event, 'home_timeline_card')}
          />
          <FullCalendarInviteSection events={invitation.events} onCalendarAction={trackCalendarAction} />
        </>
      ) : (
        <WeddingHomeVenueSection
          event={weddingEvent}
          onMapOpen={trackMapOpen}
          onCalendarAction={trackCalendarAction}
        />
      )}

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

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onCalendarAction={(provider, event) => trackCalendarAction(provider, event, 'single_event')}
        />
      )}

    </div>
  );
}
