import { Fragment, useRef, useState } from 'react';
import axios from 'axios';
import { FloralSprig, FloralTopBanner } from '../components/FloralDecor';
import { Check, ChevronRight, Users, Phone, Mail, MessageSquare, Calendar, CalendarPlus } from 'lucide-react';
import { useVisitAnalytics } from '../utils/analytics';
import { downloadCalendarInvite, getGoogleCalendarUrl } from '../utils/calendar';
import { useScrollReveal } from '../utils/scrollReveal';
import { WEDDING_EVENT_ID, getAttendanceText, getInvitationConfig } from '../utils/events';

// ── Step indicator ──────────────────────────────────────────────────────────
function StepDot({ step, current, label }) {
  const done   = step < current;
  const active = step === current;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 font-sans text-xs font-bold
        ${done   ? 'bg-mauve-600 text-white' :
          active ? 'bg-[#fffaf4] border-2 border-mauve-600 text-mauve-700' :
                   'bg-mauve-100 text-mauve-300'}`}>
        {done ? <Check className="w-4 h-4" /> : step}
      </div>
      <span className={`text-xs font-sans hidden sm:block ${active ? 'text-mauve-700 font-medium' : 'text-mauve-300'}`}>
        {label}
      </span>
    </div>
  );
}

function StepLine({ done }) {
  return (
    <div className={`flex-1 h-0.5 mb-5 transition-all duration-500 ${done ? 'bg-mauve-500' : 'bg-mauve-100'}`} />
  );
}

// ── Attend option ───────────────────────────────────────────────────────────
function AttendOption({ value, label, sub, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`choice-card
        ${selected
          ? 'is-selected'
          : ''}`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
        ${selected ? 'border-mauve-600 bg-mauve-600' : 'border-mauve-300'}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <div>
        <p className={`font-sans text-sm font-medium ${selected ? 'text-mauve-800' : 'text-mauve-600'}`}>{label}</p>
        {sub && <p className="font-sans text-xs text-mauve-400 mt-0.5">{sub}</p>}
      </div>
    </button>
  );
}

// ── Main RSVP page ───────────────────────────────────────────────────────────
const blankGuest = () => ({ firstName: '', lastName: '' });

export default function RSVP({ invitationMode = 'full' }) {
  const invitation = getInvitationConfig(invitationMode);
  const stepLabels = invitation.showAllEvents
    ? ['Your Info', 'Events', 'Submit']
    : ['Your Info', 'Submit'];
  const submitStep = invitation.showAllEvents ? 3 : 2;
  const { trackAction, handleTrackedClick } = useVisitAnalytics({
    sections: ['RSVP Header', 'RSVP Form'],
  });
  useScrollReveal();
  const startedRef = useRef(false);
  const formStartRef = useRef(null);
  const additionalGuestsRef = useRef(null);
  const [step,          setStep]         = useState(1);
  const [firstName,     setFirstName]    = useState('');
  const [lastName,      setLastName]     = useState('');
  const [attending,     setAttending]    = useState('');
  const [additionalNum, setAdditionalNum]= useState(0);
  const [additionals,   setAdditionals]  = useState([]);
  const [eventResponses, setEventResponses] = useState(() =>
    Object.fromEntries(invitation.additionalEvents.map(event => [event.id, '']))
  );
  const [showGuestConfirm, setShowGuestConfirm] = useState(false);
  const [confirmedSolo, setConfirmedSolo] = useState(false);
  const [contact,       setContact]      = useState({ phone: '', email: '', notes: '' });
  const [submitting,    setSubmitting]   = useState(false);
  const [submitted,     setSubmitted]    = useState(false);
  const [error,         setError]        = useState('');

  const trackRsvpStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackAction('rsvp_started', 'Started RSVP form');
  };

  const handleAdditionalNumChange = (n) => {
    trackRsvpStarted();
    const num = Math.max(0, Math.min(8, n));
    setConfirmedSolo(false);
    setAdditionalNum(num);
    setAdditionals(Array.from({ length: num }, (_, i) => additionals[i] || blankGuest()));
  };

  const handleWeddingAttendanceChange = (value) => {
    trackRsvpStarted();
    setAttending(value);
    setConfirmedSolo(false);
    if (value === 'no') {
      setAdditionalNum(0);
      setAdditionals([]);
    }
  };

  const updateAdditional = (i, field, value) => {
    trackRsvpStarted();
    setAdditionals(prev => prev.map((g, idx) => idx === i ? { ...g, [field]: value } : g));
  };

  const additionalGuestsValid = () => (
    additionalNum === 0 || additionals.every(guest => guest.firstName.trim())
  );

  const step1Valid = () => Boolean(
    firstName.trim() &&
    lastName.trim() &&
    attending !== '' &&
    (attending !== 'yes' || additionalGuestsValid())
  );

  const getEventResponse = (eventId) => (
    eventId === WEDDING_EVENT_ID ? attending : eventResponses[eventId]
  );

  const updateEventResponse = (eventId, value) => {
    trackRsvpStarted();
    if (eventId === WEDDING_EVENT_ID) {
      handleWeddingAttendanceChange(value);
      return;
    }
    setEventResponses(prev => ({ ...prev, [eventId]: value }));
  };

  const eventResponsesValid = () => (
    !invitation.showAllEvents ||
    invitation.events.every(event => ['yes', 'no'].includes(getEventResponse(event.id)))
  );

  const confirmedAdditionalGuests = () => additionals.filter(g => g.firstName.trim());

  const eventAttendancePayload = () => {
    const guestCount = 1 + confirmedAdditionalGuests().length;
    return invitation.events.map(event => {
      const response = getEventResponse(event.id);

      return {
        id: event.id,
        name: event.name,
        dateLabel: event.dateLabel,
        timeLabel: event.timeLabel,
        venue: event.venue,
        attending: response,
        guestCount: response === 'yes' ? guestCount : 0,
      };
    });
  };

  const scrollToFormStart = () => {
    requestAnimationFrame(() => {
      formStartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const completeStepOne = () => {
    trackAction('rsvp_step_completed', 'Completed RSVP step 1', {
      attending,
      additionalGuests: additionalNum,
      invitationMode: invitation.mode,
    });
    setStep(invitation.showAllEvents ? 2 : submitStep);
    scrollToFormStart();
  };

  const handleContinue = () => {
    if (attending === 'yes' && additionalNum === 0 && !confirmedSolo) {
      trackAction('rsvp_guest_confirmation_shown', 'Asked to confirm no additional guests');
      setShowGuestConfirm(true);
      return;
    }

    completeStepOne();
  };

  const confirmSoloAttendance = () => {
    setConfirmedSolo(true);
    setShowGuestConfirm(false);
    trackAction('rsvp_solo_confirmed', 'Confirmed attending without additional guests');
    completeStepOne();
  };

  const addGuestFromConfirmation = () => {
    setShowGuestConfirm(false);
    handleAdditionalNumChange(1);
    trackAction('rsvp_add_guests_prompt', 'Chose to add guests from confirmation');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        additionalGuestsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        additionalGuestsRef.current?.querySelector('input')?.focus();
      });
    });
  };

  const completeEventStep = () => {
    if (!eventResponsesValid()) return;
    trackAction('rsvp_step_completed', 'Completed event RSVP step', {
      invitationMode: invitation.mode,
      events: eventAttendancePayload().map(event => ({
        id: event.id,
        attending: event.attending,
      })),
    });
    setStep(submitStep);
    scrollToFormStart();
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    const additionalGuests = confirmedAdditionalGuests();
    const eventAttendance = eventAttendancePayload();
    const payload = {
      invitationMode: invitation.mode,
      invitationLabel: invitation.label,
      invitedEvents: invitation.events.map(event => ({
        id: event.id,
        name: event.name,
        dateLabel: event.dateLabel,
        venue: event.venue,
      })),
      eventAttendance,
      primaryGuest: { firstName, lastName, attending, ...contact },
      additionalGuests,
      submittedAt: new Date().toISOString(),
    };
    try {
      await axios.post('/api/rsvp', payload);
      trackAction('rsvp_submitted', 'Submitted RSVP', {
        attending,
        invitationMode: invitation.mode,
        additionalGuests: additionalGuests.length,
        events: eventAttendance.map(event => ({ id: event.id, attending: event.attending })),
      });
      setSubmitted(true);
    } catch {
      // localStorage fallback
      const stored = JSON.parse(localStorage.getItem('rsvps') || '[]');
      stored.push({ ...payload, id: Date.now() });
      localStorage.setItem('rsvps', JSON.stringify(stored));
      trackAction('rsvp_submitted', 'Submitted RSVP', {
        attending,
        invitationMode: invitation.mode,
        additionalGuests: additionalGuests.length,
        events: eventAttendance.map(event => ({ id: event.id, attending: event.attending })),
        storage: 'local',
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────
  const hasAnyAttendance = attending === 'yes' || Object.values(eventResponses).includes('yes');

  if (submitted) {
    return (
      <div className="city2-page min-h-screen bg-[#fffaf4] pt-24 md:pt-28" onClickCapture={handleTrackedClick}>
        <div className="max-w-lg mx-auto px-4 py-16 text-center" data-reveal="scale-up">
          <div className="invite-card">
          <div className="w-20 h-20 rounded-full bg-mauve-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-mauve-600" />
          </div>
          <h1 className="font-serif text-4xl text-mauve-800 mb-3">
            {hasAnyAttendance ? 'RSVP received!' : 'Thank you!'}
          </h1>
          <FloralSprig className="my-4" />
          <p className="font-sans text-mauve-600 text-base mb-2">
            {hasAnyAttendance
              ? `Thank you, ${firstName}. We have your event responses.`
              : `Thank you for letting us know, ${firstName}. You'll be missed!`}
          </p>
          {attending === 'yes' && (
            <>
              <p className="font-sans text-sm text-mauve-400 mb-8">
                September 5, 2026 · 8:00 AM · Atithi Venue, Plano TX
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 btn-primary text-sm px-6 py-3"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Google Calendar
                </a>
                <button
                  type="button"
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
            </>
          )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="city2-page min-h-screen bg-[#fffaf4]" onClickCapture={handleTrackedClick}>
      {showGuestConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-confirm-title"
          aria-describedby="guest-confirm-description"
        >
          <div className="w-full max-w-sm invite-card text-center">
            <div className="w-14 h-14 rounded-full bg-mauve-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-mauve-700" />
            </div>
            <h2 id="guest-confirm-title" className="font-serif text-2xl text-mauve-800 mb-2">
              No additional guests ?
            </h2>
            <p id="guest-confirm-description" className="font-sans text-sm text-mauve-500 mb-6">
              Submit RSVP on the next screen
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={addGuestFromConfirmation}
                className="w-full btn-primary text-sm px-6 py-3"
                autoFocus
              >
                <Users className="w-4 h-4" />
                Add Guests
              </button>
              <button
                type="button"
                onClick={confirmSoloAttendance}
                className="w-full btn-secondary text-sm px-6 py-3"
              >
                Continue Without Guests
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top floral */}
      <section data-analytics-section="RSVP Header" className="invite-subhero">
        <FloralTopBanner className="invite-subhero__banner" />
        <div className="invite-subhero__inner" data-reveal="fade-up">
          <p className="invite-kicker">
            {invitation.showAllEvents ? 'Wedding Celebrations' : 'Marriage Ceremony'} · September 5, 2026
          </p>
          <h1>RSVP</h1>
          <p>
            {invitation.showAllEvents
              ? 'Let us know which events you can attend, and add any family members joining you.'
              : 'Let us know if you can celebrate with us, and add any family members joining you.'}
          </p>
        </div>
      </section>

      {/* Step indicator */}
      <div
        ref={formStartRef}
        className={`${stepLabels.length === 3 ? 'max-w-md' : 'max-w-xs'} mx-auto px-6 mb-8 -mt-4 relative z-10`}
        data-reveal="fade-up"
        style={{ '--reveal-delay': '80ms' }}
      >
        <div className="flex items-center">
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1;
            return (
              <Fragment key={label}>
                <StepDot step={stepNumber} current={step} label={label} />
                {index < stepLabels.length - 1 && <StepLine done={step > stepNumber} />}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* ── STEP 1: Name + attendance + additional guests ─────────────────── */}
      {step === 1 && (
        <div data-analytics-section="RSVP Form" className="max-w-lg mx-auto px-4 pb-20 animate-fade-in-up" data-reveal="scale-up" style={{ '--reveal-delay': '140ms' }}>
          <div className="invite-card rsvp-card">
            <p className="invite-kicker text-center">Step one</p>
            <h2 className="font-serif text-3xl text-mauve-800 mb-2 text-center">Your Details</h2>
            <p className="font-sans text-sm text-mauve-500 text-center mb-6">
              Please enter your first and last name below.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={firstName}
                  onChange={e => { trackRsvpStarted(); setFirstName(e.target.value); }}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={lastName}
                  onChange={e => { trackRsvpStarted(); setLastName(e.target.value); }}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="form-label mb-3">Will you attend the wedding ceremony? *</label>
              <div className="space-y-3">
                <AttendOption
                  value="yes"
                  label="Joyfully accepts"
                  sub="I'll be there for the marriage ceremony."
                  selected={attending === 'yes'}
                  onClick={handleWeddingAttendanceChange}
                />
                <AttendOption
                  value="no"
                  label="Regretfully declines"
                  sub="I'm unable to make the marriage ceremony."
                  selected={attending === 'no'}
                  onClick={handleWeddingAttendanceChange}
                />
              </div>
            </div>

            {/* Additional guests — only if attending */}
            {attending === 'yes' && (
              <div
                ref={additionalGuestsRef}
                className="mb-6 rounded-lg border border-mauve-200 bg-[#fffaf4] p-4 shadow-sm"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-mauve-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-mauve-700" />
                  </div>
                  <div className="text-left">
                    <p className="font-sans text-sm font-semibold text-mauve-800">
                      Is anyone accompanying you?
                    </p>
                    <p className="font-sans text-xs text-mauve-500 mt-1">
                      Add your spouse, children, family members, or other accompanying guests.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleAdditionalNumChange(additionalNum - 1)}
                    className="w-10 h-10 rounded-full border border-mauve-200 text-mauve-600 text-xl
                               flex items-center justify-center hover:border-mauve-400 transition-colors"
                  >−</button>
                  <span className="font-serif text-3xl text-mauve-700 w-8 text-center">{additionalNum}</span>
                  <button
                    type="button"
                    onClick={() => handleAdditionalNumChange(additionalNum + 1)}
                    className="w-10 h-10 rounded-full border border-mauve-200 text-mauve-600 text-xl
                               flex items-center justify-center hover:border-mauve-400 transition-colors"
                  >+</button>
                </div>
                <p className="font-sans text-xs text-mauve-400 mt-3">
                  {additionalNum === 0
                    ? 'Currently : Just Me !'
                    : `${additionalNum} additional guest${additionalNum === 1 ? '' : 's'}`}
                </p>

                {/* Name fields for additional guests */}
                {additionals.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {additionals.map((g, i) => (
                      <div key={i} className="rounded border border-mauve-100 p-3">
                        <p className="flex items-center gap-1.5 font-sans text-xs font-semibold text-mauve-600 mb-3">
                          <Users className="w-3.5 h-3.5" />
                          Guest {i + 1}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="min-w-0">
                            <label className="form-label whitespace-nowrap">First Name *</label>
                            <input
                              type="text"
                              required
                              className="form-input text-sm"
                              placeholder="First name"
                              value={g.firstName}
                              onChange={e => updateAdditional(i, 'firstName', e.target.value)}
                              aria-invalid={!g.firstName.trim()}
                            />
                          </div>
                          <div className="min-w-0">
                            <label className="form-label whitespace-nowrap">Last Name</label>
                            <input
                              type="text"
                              className="form-input text-sm"
                              placeholder="Last name"
                              value={g.lastName}
                              onChange={e => updateAdditional(i, 'lastName', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {!additionalGuestsValid() && (
                      <p className="font-sans text-xs text-blush-600">
                        Enter a first name for each additional guest to continue.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              disabled={!step1Valid()}
              onClick={handleContinue}
              className={`btn-primary w-full flex items-center justify-center gap-2 mt-2
                ${!step1Valid() ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Event-by-event RSVP for full invitations ──────────────── */}
      {invitation.showAllEvents && step === 2 && (
        <div data-analytics-section="RSVP Form" className="max-w-2xl mx-auto px-4 pb-20 animate-fade-in-up" data-reveal="scale-up">
          <div className="invite-card rsvp-card">
            <p className="invite-kicker text-center">Step two</p>
            <h2 className="font-serif text-3xl text-mauve-800 mb-2 text-center">Event RSVP</h2>
            <p className="font-sans text-sm text-mauve-500 text-center mb-6">
              Please respond for each invited event individually.
            </p>

            <div className="event-rsvp-list">
              {invitation.events.map((event) => {
                const response = getEventResponse(event.id);

                return (
                  <article key={event.id} className="event-rsvp-card">
                    <div className="event-rsvp-card__details">
                      <p className="invite-kicker">{event.category}</p>
                      <h3>{event.name}</h3>
                      <p>{event.dateLabel}</p>
                      <p>{event.timeLabel} · {event.venue}</p>
                    </div>
                    <div className="event-rsvp-card__choices" aria-label={`${event.name} RSVP`}>
                      {[
                        { value: 'yes', label: 'Attending' },
                        { value: 'no', label: 'Not attending' },
                      ].map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateEventResponse(event.id, option.value)}
                          className={`event-rsvp-choice ${response === option.value ? 'is-selected' : ''}`}
                          aria-pressed={response === option.value}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>

            {!eventResponsesValid() && (
              <p className="font-sans text-xs text-blush-600 mt-4 text-center">
                Please choose attending or not attending for each event.
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row-reverse mt-6">
              <button
                type="button"
                onClick={completeEventStep}
                disabled={!eventResponsesValid()}
                className={`btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-4
                  ${!eventResponsesValid() ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 text-sm">
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Final step: Contact + confirm ─────────────────────────────────── */}
      {step === submitStep && (
        <div data-analytics-section="RSVP Form" className="max-w-lg mx-auto px-4 pb-20 animate-fade-in-up" data-reveal="scale-up">
          <div className="invite-card rsvp-card">
            <p className="invite-kicker text-center">{invitation.showAllEvents ? 'Step three' : 'Step two'}</p>
            <h2 className="font-serif text-3xl text-mauve-800 mb-2 text-center">Submit RSVP</h2>

            <div className="rounded-lg border border-mauve-800 bg-mauve-800 p-3 mb-6 text-center shadow-sm">
              <p className="font-sans text-sm font-bold text-white">
                Not submitted yet
              </p>
              <p className="font-sans text-xs font-medium text-white/90 mt-1">
                The submission button is at the bottom of this step.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="form-label flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> Phone (optional)
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="(555) 123-4567"
                  value={contact.phone}
                  onChange={e => { trackRsvpStarted(); setContact(p => ({ ...p, phone: e.target.value })); }}
                />
              </div>
              <div>
                <label className="form-label flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Email (optional)
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="your@email.com"
                  value={contact.email}
                  onChange={e => { trackRsvpStarted(); setContact(p => ({ ...p, email: e.target.value })); }}
                />
              </div>
              <div>
                <label className="form-label flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Message for the couple (optional)
                </label>
                <textarea
                  className="form-input resize-none"
                  rows={3}
                  placeholder="Write a short note…"
                  value={contact.notes}
                  onChange={e => { trackRsvpStarted(); setContact(p => ({ ...p, notes: e.target.value })); }}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-[#fffaf4] border border-mauve-100 rounded-lg p-4 mb-6 space-y-2">
              <h3 className="font-serif text-base text-mauve-700 mb-2">Your RSVP Summary</h3>
              <p className="font-sans text-sm text-mauve-600">
                <span className="font-semibold">{firstName} {lastName}</span>
                {' — '}
                <span className={attending === 'yes' ? 'text-sage-600' : 'text-blush-600'}>
                  {attending === 'yes' ? '✓ Attending' : '✗ Not attending'}
                </span>
              </p>
              {confirmedAdditionalGuests().map((g, i) => (
                <p key={i} className="font-sans text-sm text-mauve-600">
                  + <span className="font-semibold">{g.firstName} {g.lastName}</span>
                </p>
              ))}
              <p className="font-sans text-xs text-mauve-400 pt-1 border-t border-mauve-200">
                {1 + confirmedAdditionalGuests().length} guest(s) total
              </p>
              {invitation.showAllEvents && (
                <div className="rsvp-event-summary">
                  {eventAttendancePayload().map(event => (
                    <div key={event.id}>
                      <span>{event.name}</span>
                      <strong className={event.attending === 'yes' ? 'text-sage-600' : 'text-blush-600'}>
                        {getAttendanceText(event.attending)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="font-sans text-sm text-red-500 mb-4 text-center">{error}</p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-4
                  ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Sending…
                  </span>
                ) : (
                  <>Submit RSVP <Check className="w-4 h-4" /></>
                )}
              </button>
              <button onClick={() => setStep(invitation.showAllEvents ? 2 : 1)} className="btn-secondary flex-1 text-sm">
                Back
              </button>
            </div>
          </div>
        </div>
      )}

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
