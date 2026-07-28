import { Calendar, Clock, MapPin, Utensils, Music, Star, CalendarPlus } from 'lucide-react';
import { downloadCalendarInvite, getGoogleCalendarUrl } from '../utils/calendar';
import { useVisitAnalytics } from '../utils/analytics';
import { useScrollReveal } from '../utils/scrollReveal';
import { WEDDING_EVENT_ID, getInvitationConfig } from '../utils/events';

// ── Timeline event component ─────────────────────────────────────────────────
function TimelineEvent({ time, title, description, icon: Icon, accent = false, last = false, delay = '0ms' }) {
  return (
    <div className="program-row" data-reveal="timeline" style={{ '--reveal-delay': delay }}>
      {/* Time column */}
      <div className="program-row__time">
        <span className={accent ? 'text-mauve-700' : 'text-mauve-400'}>
          {time}
        </span>
      </div>

      {/* Line + dot */}
      <div className="program-row__rail">
        <div className={`program-row__dot ${
          accent ? 'bg-mauve-600 border-mauve-600' : 'bg-white border-mauve-300'
        }`} />
        {!last && <div className="program-row__line" />}
      </div>

      {/* Content */}
      <div className="program-row__content">
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${accent ? 'text-mauve-600' : 'text-mauve-400'}`} />}
          <h3>
            {title}
          </h3>
        </div>
        {description && (
          <p>{description}</p>
        )}
      </div>
    </div>
  );
}

function VenueDetailsPanel({ event }) {
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
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}

function WeddingVenuePage({ event, handleTrackedClick }) {
  return (
    <div className="city2-page venue-page min-h-screen" onClickCapture={handleTrackedClick}>
      <section data-analytics-section="Venue Header" className="inv-subpage-hero venue-hero">
        <img src="/images/invitation-card.png" alt="" className="inv-subpage-hero__img" aria-hidden="true" />
        <div className="inv-subpage-hero__content" data-reveal="fade-up">
          <p className="invite-kicker">Venue</p>
          <h1>{event.venue}</h1>
          <div className="venue-hero__address">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <a
              href={event.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {event.address}
            </a>
          </div>
        </div>
      </section>

      <section data-analytics-section="Venue Details" className="invite-section venue-priority-section">
        <div className="invite-section__inner">
          <VenueDetailsPanel event={event} />
        </div>
      </section>

      <section data-analytics-section="Calendar Links" className="invite-section">
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
            >
              <CalendarPlus className="w-4 h-4" />
              Google Calendar
            </a>

            <button
              onClick={downloadCalendarInvite}
              className="flex items-center justify-center gap-2 btn-calendar-download text-sm px-6 py-3"
            >
              <Calendar className="w-4 h-4" />
              Apple / Outlook
            </button>
          </div>
        </div>
      </section>

      <footer className="invite-footer">
        <p className="font-serif italic text-mauve-400 text-sm">
          Manas &amp; Rupa Sree &nbsp;·&nbsp; September 5, 2026
        </p>
      </footer>
    </div>
  );
}

// ── Schedule page ─────────────────────────────────────────────────────────────
export default function Schedule({ invitationMode = 'full' }) {
  const invitation = getInvitationConfig(invitationMode);
  const weddingEvent = invitation.events.find(event => event.id === WEDDING_EVENT_ID) || invitation.events[0];
  const analyticsSections = invitation.showAllEvents
    ? [
        'Schedule Header',
        'All Events Schedule',
        'Venue Details',
        'Ceremony Program',
        'Calendar Links',
      ]
    : [
        'Venue Header',
        'Venue Details',
        'Calendar Links',
      ];
  const analyticsMetadata = {
    invitationMode: invitation.mode,
    invitationLabel: invitation.label,
    inviteHomePath: invitation.homePath,
  };
  const { handleTrackedClick } = useVisitAnalytics({
    sections: analyticsSections,
    metadata: analyticsMetadata,
  });
  useScrollReveal();

  if (!invitation.showAllEvents) {
    return (
      <WeddingVenuePage
        event={weddingEvent}
        handleTrackedClick={handleTrackedClick}
      />
    );
  }

  return (
    <div className="city2-page min-h-screen" onClickCapture={handleTrackedClick}>
      <section data-analytics-section="Schedule Header" className="inv-subpage-hero">
        <img src="/images/invitation-card.png" alt="" className="inv-subpage-hero__img" aria-hidden="true" />
        <div className="inv-subpage-hero__content" data-reveal="fade-up">
          <p className="invite-kicker">September 5, 2026</p>
          <h1>Wedding Events and Venue</h1>
          <p>
            RSVP covers each celebration separately. Wedding-day venue details are below, and each event card lists its location.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2 text-mauve-500">
            <MapPin className="w-4 h-4" />
            <a
              href="https://maps.google.com/?q=Atithi+Venue+9060+Independence+Parkway+Plano+TX+75025"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-sm hover:text-mauve-700 underline underline-offset-2"
            >
              9060 Independence Parkway, Plano, TX 75025
            </a>
          </div>
        </div>
      </section>

      {invitation.showAllEvents && (
        <section data-analytics-section="All Events Schedule" className="invite-section pt-8">
          <div className="invite-section__inner">
            <div className="section-heading-row" data-reveal="fade-up">
              <div>
                <p className="invite-kicker">Full invitation</p>
                <h2 className="section-title text-left">Events Around the Wedding</h2>
              </div>
              <p className="section-lede">
                Each event card lists its date, time, and location. RSVP will ask for every event separately.
              </p>
            </div>

            <div className="city2-schedule-event-grid">
              {invitation.events.map((event, index) => (
                <article
                  key={event.id}
                  className={`city2-schedule-event ${event.id === WEDDING_EVENT_ID ? 'is-featured' : ''}`}
                  data-reveal="card"
                  style={{ '--reveal-delay': `${index * 80}ms` }}
                >
                  <p className="city2-event-tile__kicker">{event.category}</p>
                  <h3>{event.name}</h3>
                  <p>{event.dateLabel}</p>
                  <p>{event.timeLabel}</p>
                  <p>{event.venue}</p>
                  {event.description && <span>{event.description}</span>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section data-analytics-section="Venue Details" className="invite-section venue-priority-section">
        <div className="invite-section__inner">
          <VenueDetailsPanel event={weddingEvent} />
        </div>
      </section>

      {/* Timeline */}
      <section data-analytics-section="Ceremony Program" className="invite-section pt-8">
        <div className="invite-section__inner max-w-4xl">
          <div className="schedule-shell">
            <div className="schedule-shell__intro" data-reveal="slide-right">
              <p className="invite-kicker">Ceremony program</p>
              <h2>Evening Celebration</h2>
              <p>
                Please arrive early enough to settle in before the ceremony begins. Dinner begins at 8:00 PM with South Indian vegetarian cuisine.
              </p>
            </div>

            <div className="schedule-shell__timeline">
              <TimelineEvent
                time="7:00 PM"
                title="Marriage Ceremony Begins"
                description="Family blessings and traditional wedding rituals begin."
                icon={Star}
                accent
                delay="80ms"
              />
              <TimelineEvent
                time="8:00 PM"
                title="Dinner Served"
                description="South Indian vegetarian cuisine."
                icon={Utensils}
                accent
                delay="170ms"
              />
              <TimelineEvent
                time="9:30 PM"
                title="Muhurtham and Wedding Rituals"
                description="Manas and Rupa Sree are joined in marriage with blessings from family and friends."
                icon={Star}
                accent
                delay="260ms"
              />
              <TimelineEvent
                time="After"
                title="Blessings and Portraits"
                description="Group photos, family portraits, and celebrations."
                icon={Music}
                accent
                last
                delay="350ms"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Calendar invite section */}
      <section data-analytics-section="Calendar Links" className="invite-section invite-section--sage">
        <div className="max-w-md mx-auto text-center px-4" data-reveal="fade-up">
          <p className="invite-kicker">Save the date</p>
          <h2 className="font-serif text-3xl md:text-4xl text-mauve-800 mb-3">Add it to your calendar</h2>
          <p className="section-lede mb-8">
            Add the marriage ceremony to your calendar so you don't miss it.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {/* Google Calendar */}
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 btn-primary text-sm px-6 py-3"
            >
              <CalendarPlus className="w-4 h-4" />
              Google Calendar
            </a>

            {/* Download .ics */}
            <button
              onClick={downloadCalendarInvite}
              className="flex items-center justify-center gap-2 btn-calendar-download text-sm px-6 py-3"
            >
              <Calendar className="w-4 h-4" />
              Apple / Outlook
            </button>
          </div>

          <p className="font-sans text-xs text-mauve-400 mt-4">
            Apple Calendar, Outlook, and most calendar apps accept the .ics format.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="invite-footer">
        <p className="font-serif italic text-mauve-400 text-sm">
          Manas &amp; Rupa Sree &nbsp;·&nbsp; September 5, 2026
        </p>
      </footer>
    </div>
  );
}
