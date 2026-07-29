const RESEND_EMAIL_ENDPOINT = 'https://api.resend.com/emails';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FALLBACK_EMAIL_FROM = 'Wedding RSVP <onboarding@resend.dev>';
const FALLBACK_EMAIL_TO = ['manaschoudary@gmail.com'];
const FALLBACK_EMAIL_CC = ['gavinash1912@gmail.com'];
const FALLBACK_SUBJECT_PREFIX = 'RSVP backup';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '[Unable to serialize RSVP payload]';
  }
}

function normalizePayload(payload) {
  if (typeof payload !== 'string') return payload || {};

  try {
    return JSON.parse(payload);
  } catch {
    return { rawPayload: payload };
  }
}

function guestName(primaryGuest = {}) {
  return [primaryGuest.firstName, primaryGuest.lastName].filter(Boolean).join(' ') || 'Unknown guest';
}

function formatEventAttendance(events = []) {
  if (!Array.isArray(events) || events.length === 0) return 'No event attendance details provided.';

  return events.map(event => {
    const guests = Array.isArray(event.guestResponses)
      ? event.guestResponses
          .map(guest => `${guest.name || [guest.firstName, guest.lastName].filter(Boolean).join(' ') || 'Guest'}: ${guest.attending || 'unknown'}`)
          .join(', ')
      : '';

    return [
      `${event.name || event.id || 'Event'}: ${event.attending || 'unknown'} (${event.guestCount || 0} attending)`,
      event.dateLabel ? `Date: ${event.dateLabel}` : '',
      event.timeLabel ? `Time: ${event.timeLabel}` : '',
      event.venue ? `Venue: ${event.venue}` : '',
      guests ? `Guests: ${guests}` : '',
    ].filter(Boolean).join('\n');
  }).join('\n\n');
}

function buildFallbackEmail(payload, error) {
  const primaryGuest = payload.primaryGuest || {};
  const name = guestName(primaryGuest);
  const subject = `[${FALLBACK_SUBJECT_PREFIX}] ${name} - ${payload.invitationLabel || payload.invitationMode || 'Wedding RSVP'}`;
  const serverError = error?.message || 'Unknown server error';
  const eventAttendance = formatEventAttendance(payload.eventAttendance);
  const additionalGuests = Array.isArray(payload.additionalGuests) && payload.additionalGuests.length
    ? payload.additionalGuests.map(guest => guest.name || [guest.firstName, guest.lastName].filter(Boolean).join(' ')).filter(Boolean).join(', ')
    : 'None';
  const rawJson = safeJson(payload);

  const text = [
    'MongoDB save failed, so this RSVP was sent by email fallback.',
    '',
    `Guest: ${name}`,
    `Attending wedding ceremony: ${primaryGuest.attending || 'unknown'}`,
    `Invitation: ${payload.invitationLabel || payload.invitationMode || 'unknown'}`,
    `Submitted at: ${payload.submittedAt || 'unknown'}`,
    `Client submission ID: ${payload.clientSubmissionId || 'none'}`,
    `Phone: ${primaryGuest.phone || 'none'}`,
    `Email: ${primaryGuest.email || 'none'}`,
    `Notes: ${primaryGuest.notes || 'none'}`,
    `Additional guests: ${additionalGuests}`,
    '',
    'Event attendance:',
    eventAttendance,
    '',
    `Server error: ${serverError}`,
    '',
    'Raw RSVP JSON:',
    rawJson,
  ].join('\n');

  const html = `
    <div style="font-family: Georgia, serif; color: #5f1023; line-height: 1.55;">
      <h1 style="margin: 0 0 12px;">RSVP email backup</h1>
      <p>MongoDB save failed, so this RSVP was sent by email fallback.</p>
      <table cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif; color: #5f1023;">
        <tr><td><strong>Guest</strong></td><td>${escapeHtml(name)}</td></tr>
        <tr><td><strong>Attending wedding ceremony</strong></td><td>${escapeHtml(primaryGuest.attending || 'unknown')}</td></tr>
        <tr><td><strong>Invitation</strong></td><td>${escapeHtml(payload.invitationLabel || payload.invitationMode || 'unknown')}</td></tr>
        <tr><td><strong>Submitted at</strong></td><td>${escapeHtml(payload.submittedAt || 'unknown')}</td></tr>
        <tr><td><strong>Client submission ID</strong></td><td>${escapeHtml(payload.clientSubmissionId || 'none')}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${escapeHtml(primaryGuest.phone || 'none')}</td></tr>
        <tr><td><strong>Email</strong></td><td>${escapeHtml(primaryGuest.email || 'none')}</td></tr>
        <tr><td><strong>Notes</strong></td><td>${escapeHtml(primaryGuest.notes || 'none')}</td></tr>
        <tr><td><strong>Additional guests</strong></td><td>${escapeHtml(additionalGuests)}</td></tr>
      </table>
      <h2 style="margin: 24px 0 8px;">Event attendance</h2>
      <pre style="white-space: pre-wrap; background: #fff8ed; border: 1px solid #ead29b; padding: 12px; border-radius: 8px;">${escapeHtml(eventAttendance)}</pre>
      <h2 style="margin: 24px 0 8px;">Server error</h2>
      <pre style="white-space: pre-wrap; background: #fff8ed; border: 1px solid #ead29b; padding: 12px; border-radius: 8px;">${escapeHtml(serverError)}</pre>
      <h2 style="margin: 24px 0 8px;">Raw RSVP JSON</h2>
      <pre style="white-space: pre-wrap; background: #fff8ed; border: 1px solid #ead29b; padding: 12px; border-radius: 8px;">${escapeHtml(rawJson)}</pre>
    </div>
  `;

  return {
    subject,
    text,
    html,
    replyTo: primaryGuest.email || '',
  };
}

export function emailFallbackConfigured() {
  return Boolean(RESEND_API_KEY && FALLBACK_EMAIL_FROM && FALLBACK_EMAIL_TO.length);
}

export async function sendRsvpFallbackEmail(payload, error) {
  if (!emailFallbackConfigured()) {
    return { sent: false, reason: 'RSVP fallback email is not configured.' };
  }

  const normalizedPayload = normalizePayload(payload);
  const email = buildFallbackEmail(normalizedPayload, error);
  const body = {
    from: FALLBACK_EMAIL_FROM,
    to: FALLBACK_EMAIL_TO,
    cc: FALLBACK_EMAIL_CC,
    subject: email.subject,
    text: email.text,
    html: email.html,
  };

  if (email.replyTo && email.replyTo.includes('@')) {
    body.reply_to = email.replyTo;
  }

  const response = await fetch(RESEND_EMAIL_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => '');
    throw new Error(`RSVP fallback email failed with HTTP ${response.status}: ${responseText}`);
  }

  return { sent: true, provider: 'resend' };
}
