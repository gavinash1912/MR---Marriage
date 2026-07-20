import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FloralLeft, FloralRight, FloralTopBanner, FloralSprig } from '../components/FloralDecor';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { useVisitAnalytics } from '../utils/analytics';
import { useScrollReveal } from '../utils/scrollReveal';
import { WEDDING_EVENT_ID, getInvitationConfig } from '../utils/events';

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

// ── Main Home page ───────────────────────────────────────────────────────────
export default function Home({ invitationMode = 'full' }) {
  const MARRIAGE_DATE = '2026-09-05T08:00:00';
  const invitation = getInvitationConfig(invitationMode);
  const countdown = useCountdown(MARRIAGE_DATE);
  const analyticsSections = [
    'Hero',
    'Blessing',
    ...(invitation.showAllEvents ? ['All Events'] : []),
    'Event Details',
    'Couple Photo',
    'RSVP',
    'Things To Know',
    'Countdown',
  ];
  const { handleTrackedClick } = useVisitAnalytics({
    sections: analyticsSections,
  });
  useScrollReveal();

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
            <Link to={invitation.rsvpPath} className="btn-primary">
              RSVP
            </Link>
            <Link to={invitation.schedulePath} className="btn-secondary">
              Schedule
            </Link>
          </div>
        </div>

        <div className="city2-traffic city2-traffic--hero" aria-hidden="true">
          <span className="city2-car city2-car--rose">
            <span className="city2-car__wheel city2-car__wheel--back" />
            <span className="city2-car__wheel city2-car__wheel--front" />
          </span>
          <span className="city2-car city2-car--mint city2-car--reverse">
            <span className="city2-car__wheel city2-car__wheel--back" />
            <span className="city2-car__wheel city2-car__wheel--front" />
          </span>
        </div>

        <div className="invite-hero__peek" aria-hidden="true">
          <span>Hindu Wedding</span>
          <span>Plano, Texas</span>
          <span>September 5, 2026</span>
        </div>
      </section>

      <section data-analytics-section="Blessing" className="invite-section city2-blessing">
        <div className="invite-section__inner max-w-3xl">
          <div className="city2-invite-card" data-reveal="arch">
            <p className="city2-mantra">Om Sri Ganeshaya Namah</p>
            <p className="city2-small-copy">With the heavenly blessings of their families</p>
            <div className="city2-rule" />
            <p className="invite-kicker">Invite</p>
            <p className="city2-large-copy">
              You to join us {invitation.showAllEvents ? 'in the wedding celebrations of' : 'for the marriage ceremony of'}
            </p>
            <h2>Manas <span>&amp;</span> Rupa Sri</h2>
            <p className="city2-small-copy">
              {invitation.showAllEvents ? 'Across the following events' : 'On the following event'}
            </p>
          </div>
        </div>
      </section>

      {invitation.showAllEvents && (
        <section data-analytics-section="All Events" className="invite-section city2-all-events">
          <div className="invite-section__inner">
            <div className="section-heading-row" data-reveal="fade-up">
              <div>
                <p className="invite-kicker">Wedding weekend</p>
                <h2 className="section-title text-left">All Events</h2>
              </div>
              <p className="section-lede">
                Please RSVP for each event below. Dates and Grandion venue details are placeholders until finalized.
              </p>
            </div>

            <div className="city2-event-tile-grid">
              {invitation.events.map((event, index) => (
                <article
                  key={event.id}
                  className={`city2-event-tile ${event.id === WEDDING_EVENT_ID ? 'is-featured' : ''}`}
                  data-reveal="card"
                  style={{ '--reveal-delay': `${index * 80}ms` }}
                >
                  <p className="city2-event-tile__kicker">{event.category}</p>
                  <h3>{event.name}</h3>
                  <dl>
                    <div>
                      <dt>Date</dt>
                      <dd>{event.dateLabel}</dd>
                    </div>
                    <div>
                      <dt>Time</dt>
                      <dd>{event.timeLabel}</dd>
                    </div>
                    <div>
                      <dt>Venue</dt>
                      <dd>{event.venue}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Invitation event section ────────────────────────── */}
      <section data-analytics-section="Event Details" className="invite-section invite-section--sage city2-events">
        <div className="invite-section__inner">
          <div className="text-center max-w-2xl mx-auto mb-10" data-reveal="fade-up">
            <p className="invite-kicker">Wedding day</p>
            <h2 className="section-title">Marriage Ceremony</h2>
            <p className="section-lede mx-auto mt-4">
              One joyful morning of blessings, rituals, photos, and lunch.
            </p>
          </div>

          <div className="city2-traffic city2-traffic--event" aria-hidden="true" data-reveal="fade-up" style={{ '--reveal-delay': '80ms' }}>
            <span className="city2-car city2-car--gold">
              <span className="city2-car__wheel city2-car__wheel--back" />
              <span className="city2-car__wheel city2-car__wheel--front" />
            </span>
            <span className="city2-car city2-car--teal city2-car--reverse">
              <span className="city2-car__wheel city2-car__wheel--back" />
              <span className="city2-car__wheel city2-car__wheel--front" />
            </span>
          </div>

          <div className="city2-event-card" data-reveal="scale-up" style={{ '--reveal-delay': '100ms' }}>
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
            {inviteCards.map(({ title, copy, icon: Icon }, index) => (
              <article
                key={title}
                className="invite-card"
                data-reveal="card"
                style={{ '--reveal-delay': `${index * 90}ms` }}
              >
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

      {/* ── Couple photo section ───────────────────────────── */}
      <section data-analytics-section="Couple Photo" className="invite-section bg-[#fffaf4]">
        <div className="invite-section__inner max-w-5xl">
          <div className="section-heading-row" data-reveal="fade-up">
            <div>
              <p className="invite-kicker">Meet the</p>
              <h2 className="section-title text-left">Bride and Groom</h2>
            </div>
            <p className="section-lede">
              We are delighted that you are able to join us in celebrating one of the happiest days of our lives.
            </p>
          </div>
          <figure className="city2-photo-frame" data-reveal="photo" style={{ '--reveal-delay': '120ms' }}>
            <img
              src="/videos/DSC00833.jpg"
              alt="Manas and Rupa Sri holding hands on a bridge"
            />
            <figcaption>Manas &amp; Rupa Sri</figcaption>
          </figure>
        </div>
      </section>

      <section data-analytics-section="RSVP" className="invite-section city2-rsvp-strip">
        <div className="invite-section__inner max-w-2xl text-center" data-reveal="fade-up">
          <p className="invite-kicker">Please</p>
          <h2 className="section-title">RSVP</h2>
          <p className="section-lede mx-auto mt-4">
            {invitation.showAllEvents
              ? 'Confirm your wedding attendance, add accompanying guests, and respond for each celebration.'
              : 'Confirm your attendance and add any accompanying guests.'}
          </p>
          <Link to={invitation.rsvpPath} className="btn-primary mt-7">
            Submit RSVP
          </Link>
        </div>
      </section>

      <section data-analytics-section="Things To Know" className="invite-section city2-know">
        <div className="invite-section__inner">
          <div className="section-heading-row" data-reveal="fade-up">
            <div>
              <p className="invite-kicker">Things to know</p>
              <h2 className="section-title text-left">For the day</h2>
            </div>
            <p className="section-lede">
              A few helpful details for guests before arriving at Atithi Venue.
            </p>
          </div>

          <div className="city2-info-grid">
            <article data-reveal="card">
              <h3>Venue</h3>
              <p>
                {invitation.showAllEvents
                  ? 'Wedding day is at Atithi Venue. Other event venue details are placeholders at Grandion until finalized.'
                  : 'Atithi Venue, 9060 Independence Parkway, Plano, TX 75025.'}
              </p>
            </article>
            <article data-reveal="card" style={{ '--reveal-delay': '90ms' }}>
              <h3>Timing</h3>
              <p>
                {invitation.showAllEvents
                  ? 'The wedding ceremony begins at 8:00 AM. Sub-event times are listed above and may be updated.'
                  : 'The ceremony begins at 8:00 AM. Breakfast and lunch will be served.'}
              </p>
            </article>
            <article data-reveal="card" style={{ '--reveal-delay': '180ms' }}>
              <h3>RSVP</h3>
              <p>
                {invitation.showAllEvents
                  ? 'Please respond for each event individually so we can plan each gathering.'
                  : 'Please confirm your attendance and add any accompanying guests.'}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section data-analytics-section="Countdown" className="invite-section city2-countdown">
        <div className="invite-section__inner max-w-3xl text-center" data-reveal="fade-up">
          <p className="invite-kicker">The countdown begins</p>
          <h2 className="section-title">September 5, 2026</h2>
          <div className="countdown-panel mt-8" aria-label="Countdown to wedding" data-reveal="scale-up" style={{ '--reveal-delay': '110ms' }}>
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
