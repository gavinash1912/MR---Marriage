import { Calendar, CalendarPlus, ChevronRight, MapPin } from 'lucide-react';
import { addGoogleCalendarInvite, downloadCalendarInvite } from '../utils/calendar';

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

export function TimelineEventsSection({ events, onOpenEventDetails, onOpenMap }) {
  const dateGroups = groupEventsByDate(events);
  const isSingleEventTimeline = dateGroups.length === 1 && dateGroups[0].events.length === 1;

  return (
    <section data-analytics-section="Events Timeline" className="event-timeline timeline-page__events">
      <h2 className="section-title" data-reveal="fade-up">Events Around the Wedding</h2>

      <div className={`timeline-track ${isSingleEventTimeline ? 'timeline-track--single' : ''}`}>
        {dateGroups.map((group) => (
          <div key={group.dateLabel} className="timeline-date-group" data-reveal="fade-up">
            <div className="timeline-date-label">{group.dateLabel}</div>

            {group.events.map((event) => (
              <article
                key={event.id}
                className="timeline-event"
                data-reveal="card"
              >
                <span className="timeline-event__time">{event.timeLabel}</span>
                <span className="timeline-event__name">{event.name}</span>
                <span className="timeline-event__venue">{event.venue}</span>
                <div className="timeline-event__actions">
                  <button
                    type="button"
                    className="timeline-event__tap"
                    onClick={() => onOpenEventDetails(event)}
                    aria-label={`View details for ${event.name}`}
                  >
                    View details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  {event.mapUrl && (
                    <a
                      href={event.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="timeline-event__map"
                      aria-label={`Open Google Maps for ${event.venue}`}
                      onClick={() => onOpenMap?.(event)}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Google Maps
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export function FullCalendarInviteSection({ events, onCalendarAction }) {
  return (
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
              onCalendarAction?.('google', events, 'all');
              addGoogleCalendarInvite(events, {
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
              onCalendarAction?.('apple_outlook', events, 'all');
              downloadCalendarInvite(events, {
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
  );
}
