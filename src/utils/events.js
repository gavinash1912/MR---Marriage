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
  dateLabel: 'Saturday, September 5, 2026',
  dateTime: '2026-09-05T08:00:00',
  timeLabel: '8:00 AM - 2:00 PM',
  venue: 'Atithi Venue',
  address: '9060 Independence Parkway, Plano, TX 75025',
  city: 'Plano, Texas',
  mapUrl: 'https://maps.google.com/?q=Atithi+Venue+9060+Independence+Parkway+Plano+TX+75025',
  description: 'Family blessings, traditional wedding rituals, photos, breakfast, and lunch.',
};

export const ADDITIONAL_EVENT_DETAILS = [
  {
    id: 'mehandi',
    name: 'Mehandi',
    shortName: 'Mehandi',
    category: 'Pre-wedding',
    dateLabel: 'Thursday, September 3, 2026',
    dateTime: '2026-09-03T18:00:00',
    timeLabel: '6:00 PM - 9:00 PM',
    venue: 'Grandion',
    address: 'Grandion',
    city: 'Plano, Texas',
    mapUrl: '',
    description: 'An evening of henna, music, family, and relaxed celebration.',
  },
  {
    id: 'haldi',
    name: 'Haldi',
    shortName: 'Haldi',
    category: 'Pre-wedding',
    dateLabel: 'Friday, September 4, 2026',
    dateTime: '2026-09-04T10:00:00',
    timeLabel: '10:00 AM - 12:00 PM',
    venue: 'Grandion',
    address: 'Grandion',
    city: 'Plano, Texas',
    mapUrl: '',
    description: 'A bright morning ceremony with turmeric blessings and family photos.',
  },
  {
    id: 'vratham',
    name: 'Vratham',
    shortName: 'Vratham',
    category: 'Pre-wedding',
    dateLabel: 'Friday, September 4, 2026',
    dateTime: '2026-09-04T16:00:00',
    timeLabel: '4:00 PM - 6:00 PM',
    venue: 'Grandion',
    address: 'Grandion',
    city: 'Plano, Texas',
    mapUrl: '',
    description: 'Traditional family rituals and blessings before the wedding day.',
  },
  {
    id: 'pelli-kuthuru-koduku',
    name: 'Pelli Kuthuru / Pelli Koduku Events',
    shortName: 'Pelli Events',
    category: 'Wedding weekend',
    dateLabel: 'Sunday, September 6, 2026',
    dateTime: '2026-09-06T10:30:00',
    timeLabel: '10:30 AM - 1:00 PM',
    venue: 'Grandion',
    address: 'Grandion',
    city: 'Plano, Texas',
    mapUrl: '',
    description: 'Post-wedding family rituals and blessings with close family and friends.',
  },
];

export const FULL_EVENT_DETAILS = [
  ADDITIONAL_EVENT_DETAILS[0],
  ADDITIONAL_EVENT_DETAILS[1],
  ADDITIONAL_EVENT_DETAILS[2],
  WEDDING_EVENT,
  ADDITIONAL_EVENT_DETAILS[3],
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
    schedulePath: weddingOnly ? `${WEDDING_ONLY_BASE_PATH}/schedule` : `${FULL_INVITE_BASE_PATH}/schedule`,
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
