const EVENT_TITLE = 'Manas & Rupa Sri - Marriage Ceremony';
const EVENT_LOCATION = 'Atithi Venue, 9060 Independence Parkway, Plano, TX 75025';
const EVENT_DETAILS = [
  'Join us to celebrate the marriage of Manas and Rupa Sri!',
  '',
  'Breakfast & Lunch will be served.',
  'Attire: Indian Traditional',
].join('\n');

export function getGoogleCalendarUrl() {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: EVENT_TITLE,
    dates: '20260905T080000/20260905T140000',
    details: EVENT_DETAILS,
    location: EVENT_LOCATION,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadCalendarInvite() {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Manas & Rupa Sri Marriage//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'DTSTART:20260905T080000',
    'DTEND:20260905T140000',
    `SUMMARY:${EVENT_TITLE}`,
    `DESCRIPTION:${EVENT_DETAILS.replace(/\n/g, '\\n')}`,
    `LOCATION:${EVENT_LOCATION.replace(/,/g, '\\,')}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Manas & Rupa Sri Marriage - Tomorrow!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'manas-rupa-sri-marriage.ics';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
