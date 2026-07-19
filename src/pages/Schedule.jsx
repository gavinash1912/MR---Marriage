import { FloralSprig, FloralTopBanner } from '../components/FloralDecor';
import { Calendar, Clock, MapPin, Utensils, Music, Star, CalendarPlus } from 'lucide-react';
import { downloadCalendarInvite, getGoogleCalendarUrl } from '../utils/calendar';
import { useVisitAnalytics } from '../utils/analytics';
import { useScrollReveal } from '../utils/scrollReveal';

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

// ── Schedule page ─────────────────────────────────────────────────────────────
export default function Schedule() {
  const { handleTrackedClick } = useVisitAnalytics({
    sections: ['Schedule Header', 'Ceremony Program', 'Calendar Links', 'Venue Details'],
  });
  useScrollReveal();

  return (
    <div className="city2-page min-h-screen bg-[#fffaf4]" onClickCapture={handleTrackedClick}>
      {/* Top floral */}
      <section data-analytics-section="Schedule Header" className="invite-subhero">
        <FloralTopBanner className="invite-subhero__banner" />
        <div className="invite-subhero__inner" data-reveal="fade-up">
          <p className="invite-kicker">September 5, 2026</p>
          <h1>Wedding Day Schedule</h1>
          <p>
            Ceremony, family blessings, photos, and lunch at Atithi Venue in Plano, Texas.
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

      {/* Timeline */}
      <section data-analytics-section="Ceremony Program" className="invite-section pt-8">
        <div className="invite-section__inner max-w-4xl">
          <div className="schedule-shell">
            <div className="schedule-shell__intro" data-reveal="slide-right">
              <p className="invite-kicker">Ceremony program</p>
              <h2>Morning Celebration</h2>
              <p>
                Please arrive early enough to settle in before the ceremony begins. Breakfast and lunch will be served.
              </p>
            </div>

            <div className="schedule-shell__timeline">
              <TimelineEvent
                time="8:00 AM"
                title="Marriage Ceremony Begins"
                description="Family blessings and traditional wedding rituals begin."
                icon={Star}
                accent
                delay="80ms"
              />
              <TimelineEvent
                time="10:00 AM"
                title="Muhurtham and Wedding Rituals"
                description="Manas and Rupa Sri are joined in marriage with blessings from family and friends."
                icon={Star}
                accent
                delay="170ms"
              />
              <TimelineEvent
                time="10:30 AM"
                title="Photography and Celebrations"
                description="Group photos, family portraits, and celebrations."
                icon={Music}
                accent
                delay="260ms"
              />
              <TimelineEvent
                time="11:30 AM"
                title="Lunch Served"
                description="Buffet lunch with a variety of Indian delicacies."
                icon={Utensils}
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
          <FloralSprig className="mb-5" />
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
              className="flex items-center justify-center gap-2 btn-secondary text-sm px-6 py-3"
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

      {/* Venue map & details */}
      <section data-analytics-section="Venue Details" className="invite-section">
        <div className="max-w-xl mx-auto text-center px-4" data-reveal="fade-up">
          <p className="invite-kicker">Getting there</p>
          <h2 className="font-serif text-3xl md:text-4xl text-mauve-800 mb-6">Atithi Venue</h2>
          <div className="invite-card text-left space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-mauve-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-serif text-lg text-mauve-800">Atithi Venue</p>
                <p className="font-sans text-sm text-mauve-600">9060 Independence Parkway, Plano, TX 75025</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-mauve-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-sans text-sm text-mauve-600">
                  <strong className="text-mauve-700">Doors open at 8:00 AM</strong>
                </p>
              </div>
            </div>
            <a
              href="https://maps.google.com/?q=Atithi+Venue+9060+Independence+Parkway+Plano+TX+75025"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full btn-secondary text-sm mt-2"
            >
              <MapPin className="w-4 h-4" />
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="invite-footer">
        <FloralSprig className="mb-3" />
        <p className="font-serif italic text-mauve-400 text-sm">
          Manas &amp; Rupa Sri &nbsp;·&nbsp; September 5, 2026
        </p>
      </footer>
    </div>
  );
}
