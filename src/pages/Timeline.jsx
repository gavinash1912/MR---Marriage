import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import EventModal from '../components/EventModal';
import { useVisitAnalytics } from '../utils/analytics';
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
  const { handleTrackedClick } = useVisitAnalytics({
    sections: ['Timeline Header', 'Events Timeline', 'Timeline RSVP'],
    metadata: {
      invitationMode: invitation.mode,
      invitationLabel: invitation.label,
      inviteHomePath: invitation.homePath,
    },
  });
  useScrollReveal();

  const dateGroups = groupEventsByDate(invitation.events);
  const isSingleEventTimeline = dateGroups.length === 1 && dateGroups[0].events.length === 1;

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
                  onClick={() => setSelectedEvent(event)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedEvent(event); }}
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
        />
      )}
    </div>
  );
}
