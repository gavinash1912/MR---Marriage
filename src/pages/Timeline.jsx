import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CalendarPlus, ChevronRight } from 'lucide-react';
import EventModal from '../components/EventModal';
import { useVisitAnalytics } from '../utils/analytics';
import { addGoogleCalendarInvite, downloadCalendarInvite } from '../utils/calendar';
import { useScrollReveal } from '../utils/scrollReveal';
import { getInvitationConfig } from '../utils/events';

function groupEventsByDate(events) {
  const groups = {};
  for (const event of events) {
    const dateKey = event.dateTime.split('T')[0];
    if (!groups[dateKey]) {
      groups[dateKey] = { dateLabel: event.dateLabel, events: [] };
    }
    groups[dateKey].events.push(event);
  }
  return Object.values(groups);
}

export default function Timeline({ invitationMode = 'full' }) {
  const invitation = getInvitationConfig(invitationMode);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { trackAction, handleTrackedClick } = useVisitAnalytics({
    sections: ['Timeline Header', 'Events Timeline', 'Calendar Links', 'Timeline RSVP'],
    metadata: {
      invitationMode: invitation.mode,
      invitationLabel: invitation.label,
      inviteHomePath: invitation.homePath,
    },
  });
  useScrollReveal();

  const dateGroups = groupEventsByDate(invitation.events);
  const isSingleEventTimeline = dateGroups.length === 1 && dateGroups[0].events.length === 1;
  const openEventDetails = (event) => {
    trackAction('event_details_opened', `Opened ${event.name} details`, {
      eventId: event.id,
      eventName: event.name,
      venue: event.venue,
      invitationMode: invitation.mode,
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
    });
  };

  return (
    <div className={`home-page timeline-page ${invitation.showAllEvents ? 'full-invite-page' : ''}`} onClickCapture={handleTrackedClick}>
      <section data-analytics-section="Timeline Header" className="inv-subpage-hero">
        <div className="inv-subpage-hero__content" data-reveal="fade-up">
          <p className="invite-kicker">Full invitation</p>
          <h1>Wedding Timeline</h1>
          <p>
            Event dates, times, and locations for the celebrations around the wedding.
          </p>
        </div>
      </section>

      <section data-analytics-section="Events Timeline" className="event-timeline timeline-page__events">
        <h2 className="section-title" data-reveal="fade-up">Events Around the Wedding</h2>

        <div className={`timeline-track ${isSingleEventTimeline ? 'timeline-track--single' : ''}`}>
          {dateGroups.map((group) => (
            <div key={group.dateLabel} className="timeline-date-group" data-reveal="fade-up">
              <div className="timeline-date-label">{group.dateLabel}</div>

              {group.events.map((event) => (
                <div
                  key={event.id}
                  className="timeline-event"
                  data-reveal="card"
                  onClick={() => openEventDetails(event)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openEventDetails(event); }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${event.name} - ${event.timeLabel}. Tap for details.`}
                >
                  <span className="timeline-event__time">{event.timeLabel}</span>
                  <span className="timeline-event__name">{event.name}</span>
                  <span className="timeline-event__venue">{event.venue}</span>
                  <span className="timeline-event__tap">
                    View details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {invitation.showAllEvents && (
        <section data-analytics-section="Calendar Links" className="invite-section invite-section--sage timeline-calendar-section">
          <div className="max-w-md mx-auto text-center px-4" data-reveal="fade-up">
            <p className="invite-kicker">Save the dates</p>
            <h2 className="font-serif text-3xl md:text-4xl text-mauve-800 mb-3">Add the full celebration</h2>
            <p className="section-lede mx-auto mb-8">
              Download one calendar invite with every event in the full invitation.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  trackCalendarAction('google', invitation.events);
                  addGoogleCalendarInvite(invitation.events, {
                    filename: 'manas-rupa-sree-full-celebration-google.ics',
                    calendarName: 'Manas & Rupa Sree Full Celebration',
                  });
                }}
                className="flex items-center justify-center gap-2 btn-primary text-sm px-6 py-3"
              >
                <CalendarPlus className="w-4 h-4" />
                Google Calendar
              </button>
              <button
                type="button"
                onClick={() => {
                  trackCalendarAction('apple_outlook', invitation.events);
                  downloadCalendarInvite(invitation.events, {
                    filename: 'manas-rupa-sree-full-celebration.ics',
                    calendarName: 'Manas & Rupa Sree Full Celebration',
                  });
                }}
                className="flex items-center justify-center gap-2 btn-calendar-download text-sm px-6 py-3"
              >
                <Calendar className="w-4 h-4" />
                Apple / Outlook
              </button>
            </div>

            <p className="font-sans text-xs text-mauve-400 mt-4">
              Google Calendar can import the downloaded file; Apple Calendar and Outlook open it directly.
            </p>
          </div>
        </section>
      )}

      <section data-analytics-section="Timeline RSVP" className="home-rsvp-strip">
        <Link to={invitation.rsvpPath} className="btn-primary home-rsvp-button" aria-label="RSVP for the wedding events">
          <span>RSVP Now</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </section>

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
