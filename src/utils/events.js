export const INVITATION_MODES = {
  FULL: 'full',
  WEDDING_ONLY: 'wedding-only',
};

export const WEDDING_EVENT_ID = 'wedding';
export const FULL_INVITE_BASE_PATH = '/marriage/celebrations';
export const WEDDING_ONLY_BASE_PATH = '/wedding';

export const WEDDING_EVENT = {
  id: WEDDING_EVENT_ID,
  name: 'Marriage Ceremony',
  shortName: 'Wedding',
  category: 'Wedding day',
  dateLabel: 'Friday, September 5, 2026',
  dateTime: '2026-09-05T19:00:00',
  timeLabel: 'Evening 7:00 PM onwards (Muhurtham: 9:30 PM)',
  venue: 'Atithi Venue',
  address: '9060 Independence Pkwy, Plano, TX 75025',
  city: 'Plano, Texas',
  mapUrl: 'https://maps.google.com/?q=Atithi+Venue+9060+Independence+Parkway+Plano+TX+75025',
  description: 'Join us for the marriage ceremony. Muhurtham is at 9:30 PM.',
  dressCode: 'Indian Traditional',
  poster: '/images/poster-marriage.png',
};

export const ADDITIONAL_EVENT_DETAILS = [
  {
    id: 'pelli-kuthuru-koduku',
    name: 'Pelli Koduku / Pelli Kuturu',
    shortName: 'Pelli Events',
    category: 'Pre-wedding',
    dateLabel: 'Thursday, September 4, 2026',
    dateTime: '2026-09-04T09:00:00',
    timeLabel: '9:00 AM',
    venue: 'Ranch House',
    address: '708 Sam Davis Rd, Argyle, TX 76226',
    city: 'Argyle, Texas',
    mapUrl: 'https://maps.google.com/?q=708+Sam+Davis+Rd+Argyle+TX+76226',
    description: 'Traditional pre-wedding rituals and blessings for the bride and groom.',
    dressCode: 'Indian Traditional',
    poster: null,
  },
  {
    id: 'haldi',
    name: 'Haldi',
    shortName: 'Haldi',
    category: 'Pre-wedding',
    dateLabel: 'Thursday, September 4, 2026',
    dateTime: '2026-09-04T10:00:00',
    timeLabel: '10:00 AM',
    venue: 'Ranch House',
    address: '708 Sam Davis Rd, Argyle, TX 76226',
    city: 'Argyle, Texas',
    mapUrl: 'https://maps.google.com/?q=708+Sam+Davis+Rd+Argyle+TX+76226',
    description: 'A bright ceremony with turmeric blessings and family photos.',
    dressCode: 'Whites & Yellows',
    poster: '/images/poster-haldi.png',
  },
  {
    id: 'mehandi',
    name: 'Mehandi',
    shortName: 'Mehandi',
    category: 'Pre-wedding',
    dateLabel: 'Thursday, September 4, 2026',
    dateTime: '2026-09-04T18:00:00',
    timeLabel: '6:00 PM',
    venue: 'Ranch House',
    address: '708 Sam Davis Rd, Argyle, TX 76226',
    city: 'Argyle, Texas',
    mapUrl: 'https://maps.google.com/?q=708+Sam+Davis+Rd+Argyle+TX+76226',
    description: 'An evening of henna, music, family, and relaxed celebration.',
    dressCode: 'Indian / Festive',
    poster: '/images/poster-mehandi.png',
  },
  {
    id: 'dj',
    name: 'DJ Night',
    shortName: 'DJ',
    category: 'Pre-wedding',
    dateLabel: 'Thursday, September 4, 2026',
    dateTime: '2026-09-04T20:00:00',
    timeLabel: '8:00 PM onwards',
    venue: 'Ranch House',
    address: '708 Sam Davis Rd, Argyle, TX 76226',
    city: 'Argyle, Texas',
    mapUrl: 'https://maps.google.com/?q=708+Sam+Davis+Rd+Argyle+TX+76226',
    description: 'Dance the night away with music and celebrations.',
    dressCode: 'Party Wear',
    poster: null,
  },
];

export const FULL_EVENT_DETAILS = [
  ADDITIONAL_EVENT_DETAILS[0],
  ADDITIONAL_EVENT_DETAILS[1],
  ADDITIONAL_EVENT_DETAILS[2],
  ADDITIONAL_EVENT_DETAILS[3],
  WEDDING_EVENT,
  {
    id: 'vratham',
    name: 'Vratham',
    shortName: 'Vratham',
    category: 'Post-wedding',
    dateLabel: 'Saturday, September 6, 2026',
    dateTime: '2026-09-06T10:00:00',
    timeLabel: '10:00 AM',
    venue: "Groom's House",
    address: '2845 Hale Rd, Celina, TX 75009',
    city: 'Celina, Texas',
    mapUrl: 'https://maps.google.com/?q=2845+Hale+Rd+Celina+TX+75009',
    description: 'Post-wedding ritual and blessings at the groom\'s home.',
    dressCode: 'Indian Traditional',
    poster: '/images/poster-vratham.png',
  },
];

export function getInvitationModeFromPath(pathname = '') {
  return pathname === FULL_INVITE_BASE_PATH || pathname.startsWith(`${FULL_INVITE_BASE_PATH}/`)
    ? INVITATION_MODES.FULL
    : INVITATION_MODES.WEDDING_ONLY;
}

export function getInvitationConfig(mode = INVITATION_MODES.FULL) {
  const weddingOnly = mode === INVITATION_MODES.WEDDING_ONLY;

  return {
    mode: weddingOnly ? INVITATION_MODES.WEDDING_ONLY : INVITATION_MODES.FULL,
    label: weddingOnly ? 'Wedding-only invite' : 'Full celebration invite',
    showAllEvents: !weddingOnly,
    homePath: weddingOnly ? WEDDING_ONLY_BASE_PATH : FULL_INVITE_BASE_PATH,
    schedulePath: weddingOnly ? `${WEDDING_ONLY_BASE_PATH}/venue` : `${FULL_INVITE_BASE_PATH}/schedule`,
    rsvpPath: weddingOnly ? `${WEDDING_ONLY_BASE_PATH}/rsvp` : `${FULL_INVITE_BASE_PATH}/rsvp`,
    events: weddingOnly ? [WEDDING_EVENT] : FULL_EVENT_DETAILS,
    additionalEvents: weddingOnly ? [] : ADDITIONAL_EVENT_DETAILS,
  };
}

export function getAttendanceText(value) {
  if (value === 'yes') return 'Attending';
  if (value === 'no') return 'Not attending';
  return 'No response';
}

export function normalizeEventAttendance(rsvp) {
  if (Array.isArray(rsvp?.eventAttendance) && rsvp.eventAttendance.length > 0) {
    return rsvp.eventAttendance.map(event => {
      const guestResponses = Array.isArray(event.guestResponses) ? event.guestResponses : [];
      const inferredGuestCount = (event.attending === 'yes' ? 1 : 0) +
        guestResponses.filter(guest => guest.attending === 'yes').length;
      const storedGuestCount = Number(event.guestCount);

      return {
        ...event,
        guestResponses,
        guestCount: Number.isFinite(storedGuestCount) ? storedGuestCount : inferredGuestCount,
      };
    });
  }

  const attending = rsvp?.primaryGuest?.attending || '';
  return [{
    id: WEDDING_EVENT.id,
    name: WEDDING_EVENT.name,
    dateLabel: WEDDING_EVENT.dateLabel,
    timeLabel: WEDDING_EVENT.timeLabel,
    venue: WEDDING_EVENT.venue,
    attending,
    guestCount: attending === 'yes'
      ? 1 + (rsvp?.additionalGuests?.filter(guest => guest.firstName)?.length || 0)
      : 0,
  }];
}
