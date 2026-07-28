import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useVisitAnalytics } from '../utils/analytics';
import { useScrollReveal } from '../utils/scrollReveal';
import { getInvitationConfig } from '../utils/events';
import EventModal from '../components/EventModal';

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
      <Link to={rsvpPath} className="btn-primary">RSVP</Link>
      <Link to={rsvpPath} className="btn-secondary">Decline</Link>
    </div>
  );
}

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

export default function Home({ invitationMode = 'full' }) {
  const invitation = getInvitationConfig(invitationMode);
  const countdown = useCountdown('2026-09-05T19:00:00');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { handleTrackedClick } = useVisitAnalytics({
    sections: ['Hero', 'Countdown', 'Timeline', 'Bottom RSVP'],
    metadata: {
      invitationMode: invitation.mode,
      invitationLabel: invitation.label,
      inviteHomePath: invitation.homePath,
    },
  });
  useScrollReveal();

  const dateGroups = groupEventsByDate(invitation.events);

  return (
    <div className="home-page" onClickCapture={handleTrackedClick}>

      <section data-analytics-section="Hero" className="invitation-page">
        <main className="invitation-card">
          <img
            src="/images/invitation-card.png"
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

      <section data-analytics-section="Timeline" className="event-timeline">
        <h2 className="section-title" data-reveal="fade-up">Wedding Events</h2>

        <div className="timeline-track">
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
                  aria-label={`${event.name} — ${event.timeLabel}. Tap for details.`}
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

      <section data-analytics-section="Bottom RSVP">
        <RsvpStrip rsvpPath={invitation.rsvpPath} />
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
