import { Link } from 'react-router-dom';
import { FloralSprig, FloralTopBanner } from '../components/FloralDecor';
import { Calendar, Clock, MapPin, Utensils, Music, Star, CalendarPlus } from 'lucide-react';

// ── Calendar invite helpers ───────────────────────────────────────────────────

function toICSDate(dateStr) {
  // dateStr like '20260708T080000'
  return dateStr;
}

function downloadICS() {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Avinash & Ananya Engagement//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'DTSTART:20260708T080000',
    'DTEND:20260708T140000',
    'SUMMARY:Avinash & Ananya - Engagement Ceremony',
    'DESCRIPTION:Join us to celebrate the engagement of Avinash and Ananya!\\n\\nBreakfast & Lunch will be served.\\n\\nAttire: Indian Traditional',
    'LOCATION:Grandion Event Center\\, 1810 Parkwood Blvd\\, Frisco\\, TX 75034',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Avinash & Ananya Engagement - Tomorrow!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'avinash-ananya-engagement.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getGoogleCalendarUrl() {
  const base   = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({
    action:   'TEMPLATE',
    text:     'Avinash & Ananya — Engagement Ceremony',
    dates:    '20260708T080000/20260708T140000',
    details:  'Join us to celebrate the engagement of Avinash and Ananya!\n\nBreakfast & Lunch will be served.\nAttire: Indian Traditional',
    location: 'Grandion Event Center, 1810 Parkwood Blvd, Frisco, TX 75034',
  });
  return `${base}?${params.toString()}`;
}

// ── Timeline event component ─────────────────────────────────────────────────
function TimelineEvent({ time, title, description, icon: Icon, accent = false, last = false }) {
  return (
    <div className="flex gap-5 md:gap-8">
      {/* Time column */}
      <div className="flex flex-col items-end w-20 md:w-28 flex-shrink-0 pt-1">
        <span className={`font-sans text-xs tracking-wider ${accent ? 'text-mauve-700 font-semibold' : 'text-mauve-400'}`}>
          {time}
        </span>
      </div>

      {/* Line + dot */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 mt-0.5 ${
          accent ? 'bg-mauve-600 border-mauve-600' : 'bg-white border-mauve-300'
        }`} />
        {!last && <div className="w-px flex-1 bg-mauve-200 mt-1" />}
      </div>

      {/* Content */}
      <div className={`pb-10 ${last ? '' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${accent ? 'text-mauve-600' : 'text-mauve-400'}`} />}
          <h3 className={`font-serif text-lg md:text-xl ${accent ? 'text-mauve-800' : 'text-mauve-700'}`}>
            {title}
          </h3>
        </div>
        {description && (
          <p className="font-sans text-sm text-mauve-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

// ── Schedule page ─────────────────────────────────────────────────────────────
export default function Schedule() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top floral */}
      <div className="pt-16 md:pt-20 relative overflow-hidden">
        <FloralTopBanner className="absolute top-0 left-0 right-0 opacity-60" />
        <div className="relative z-10 py-16 px-4 text-center">
          <p className="font-sans text-xs tracking-widest3 uppercase text-mauve-400 mb-3">July 8, 2026</p>
          <h1 className="font-serif text-5xl md:text-6xl tracking-widest2 text-mauve-800 uppercase mb-3">
            Schedule
          </h1>
          <p className="font-serif italic text-mauve-500 text-lg">
            Grandion Event Center &nbsp;·&nbsp; Frisco, TX
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-mauve-500">
            <MapPin className="w-4 h-4" />
            <a
              href="https://maps.google.com/?q=1810+Parkwood+Blvd+Frisco+TX+75034"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-sm hover:text-mauve-700 underline underline-offset-2"
            >
              1810 Parkwood Blvd, Frisco, TX 75034
            </a>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <section className="max-w-2xl mx-auto px-4 pb-12">
        <TimelineEvent
          time="8:00 AM"
          title="Doors Open"
          description="Guests arrive & are welcomed"
          icon={Star}
          accent
        />
        <TimelineEvent
          time="8:00 AM"
          title="Breakfast Served"
          description="Traditional South Indian breakfast spread"
          icon={Utensils}
          accent
        />
        <TimelineEvent
          time="9:30 AM"
          title="Engagement Ceremony Begins"
          description="The formal engagement ceremony with family blessings"
          icon={Star}
          accent
        />
        <TimelineEvent
          time="11:00 AM"
          title="Ring Exchange"
          description="The official exchange of rings by Avinash &amp; Ananya"
          icon={Star}
          accent
        />
        <TimelineEvent
          time="11:30 AM"
          title="Photography & Celebrations"
          description="Group photos, family portraits, and celebrations"
          icon={Music}
        />
        <TimelineEvent
          time="12:30 PM"
          title="Lunch Served"
          description="Buffet lunch with a variety of Indian delicacies"
          icon={Utensils}
          accent
        />
        <TimelineEvent
          time="2:00 PM"
          title="Farewell"
          description="Thank you for celebrating with us!"
          icon={Star}
          last
        />
      </section>

      {/* Calendar invite section */}
      <section className="py-14 px-4 bg-mauve-50/50">
        <div className="max-w-md mx-auto text-center">
          <div className="floral-divider mb-6">
            <FloralSprig />
          </div>
          <h2 className="font-serif text-2xl md:text-3xl text-mauve-800 mb-2">Save the Date</h2>
          <p className="font-sans text-sm text-mauve-500 mb-8">
            Add the engagement ceremony to your calendar so you don't miss it.
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
              onClick={downloadICS}
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
      <section className="py-14 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-serif text-2xl md:text-3xl text-mauve-800 mb-6">Getting There</h2>
          <div className="card text-left space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-mauve-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-serif text-lg text-mauve-800">Grandion Event Center</p>
                <p className="font-sans text-sm text-mauve-600">1810 Parkwood Blvd, Frisco, TX 75034</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-mauve-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-sans text-sm text-mauve-600">
                  <strong className="text-mauve-700">Doors open at 8:00 AM</strong>
                  <br />Please plan to arrive a few minutes early
                </p>
              </div>
            </div>
            <a
              href="https://maps.google.com/?q=1810+Parkwood+Blvd+Frisco+TX+75034"
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
      <footer className="py-10 text-center border-t border-mauve-100">
        <FloralSprig className="mb-3" />
        <p className="font-serif italic text-mauve-400 text-sm">
          Avinash &amp; Ananya &nbsp;·&nbsp; July 8, 2026
        </p>
      </footer>
    </div>
  );
}
