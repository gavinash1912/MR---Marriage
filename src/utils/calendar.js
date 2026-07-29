import { WEDDING_EVENT } from './events';

const CALENDAR_TIMEZONE = 'America/Chicago';
const DEFAULT_CALENDAR_NAME = 'Manas & Rupa Sree Wedding Celebrations';
const DEFAULT_FILENAME = 'manas-rupa-sree-marriage.ics';

function normalizeEvents(events) {
  if (!events || typeof events.preventDefault === 'function') return [WEDDING_EVENT];
  return (Array.isArray(events) ? events : [events]).filter(Boolean);
}

function compactDateTime(value) {
  return String(value || '').replace(/[-:]/g, '');
}

function utcStamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function foldIcsLine(line) {
  const limit = 75;
  if (line.length <= limit) return line;

  const chunks = [];
  let remaining = line;
  while (remaining.length > limit) {
    chunks.push(remaining.slice(0, limit));
    remaining = remaining.slice(limit);
  }
  chunks.push(remaining);
  return chunks.join('\r\n ');
}

function titleForEvent(event) {
  return `Manas & Rupa Sree - ${event.name || WEDDING_EVENT.name}`;
}

function locationForEvent(event) {
  return [event.venue, event.address].filter(Boolean).join(', ');
}

function detailsForEvent(event) {
  return [
    event.description,
    '',
    event.dateLabel && event.timeLabel ? `${event.dateLabel} · ${event.timeLabel}` : '',
    event.venue ? `Venue: ${event.venue}` : '',
    event.address ? `Address: ${event.address}` : '',
    event.id === WEDDING_EVENT.id ? 'Dinner: 8:00 PM · South Indian vegetarian cuisine' : '',
    event.dressCode ? `Attire: ${event.dressCode}` : '',
    event.mapUrl ? `Map: ${event.mapUrl}` : '',
  ].filter(Boolean).join('\n');
}

function eventEndDateTime(event) {
  return event.endDateTime || WEDDING_EVENT.endDateTime;
}

function icsEventLines(event, stamp) {
  const summary = titleForEvent(event);

  return [
    'BEGIN:VEVENT',
    `UID:manas-rupa-sree-2026-${event.id || compactDateTime(event.dateTime)}@mr-marriage`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${CALENDAR_TIMEZONE}:${compactDateTime(event.dateTime)}`,
    `DTEND;TZID=${CALENDAR_TIMEZONE}:${compactDateTime(eventEndDateTime(event))}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(detailsForEvent(event))}`,
    `LOCATION:${escapeIcsText(locationForEvent(event))}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(`${summary} - Tomorrow!`)}`,
    'END:VALARM',
    'END:VEVENT',
  ];
}

function createCalendarInvite(events, options = {}) {
  const eventList = normalizeEvents(events);
  const stamp = utcStamp();
  const calendarName = options.calendarName || DEFAULT_CALENDAR_NAME;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Manas & Rupa Sree Marriage//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    `X-WR-TIMEZONE:${CALENDAR_TIMEZONE}`,
    ...eventList.flatMap(event => icsEventLines(event, stamp)),
    'END:VCALENDAR',
  ];

  return lines.map(foldIcsLine).join('\r\n');
}

export function getGoogleCalendarUrl(event = WEDDING_EVENT) {
  const calendarEvent = event || WEDDING_EVENT;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: titleForEvent(calendarEvent),
    dates: `${compactDateTime(calendarEvent.dateTime)}/${compactDateTime(eventEndDateTime(calendarEvent))}`,
    details: detailsForEvent(calendarEvent),
    location: locationForEvent(calendarEvent),
    ctz: CALENDAR_TIMEZONE,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function addGoogleCalendarInvite(events, options = {}) {
  const eventList = normalizeEvents(events);

  if (eventList.length === 1) {
    window.open(getGoogleCalendarUrl(eventList[0]), '_blank', 'noopener,noreferrer');
    return;
  }

  downloadCalendarInvite(eventList, {
    filename: 'manas-rupa-sree-google-calendar.ics',
    ...options,
  });
}

export function downloadCalendarInvite(events, options = {}) {
  const eventList = normalizeEvents(events);
  const filename = options.filename || (eventList.length > 1 ? 'manas-rupa-sree-celebrations.ics' : DEFAULT_FILENAME);
  const icsContent = createCalendarInvite(eventList, options);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
