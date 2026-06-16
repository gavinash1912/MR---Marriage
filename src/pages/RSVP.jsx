import { useState } from 'react';
import axios from 'axios';
import { FloralSprig, FloralTopBanner } from '../components/FloralDecor';
import { Check, ChevronRight, User, Users, Phone, Mail, MessageSquare, CalendarPlus } from 'lucide-react';

// ── Step indicator ──────────────────────────────────────────────────────────
function StepDot({ step, current, label }) {
  const done   = step < current;
  const active = step === current;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 font-sans text-xs font-bold
        ${done   ? 'bg-mauve-600 text-white' :
          active ? 'bg-white border-2 border-mauve-600 text-mauve-700' :
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
      className={`flex items-center gap-4 w-full p-4 rounded-xl border-2 transition-all duration-200 text-left
        ${selected
          ? 'border-mauve-500 bg-mauve-50 shadow-sm'
          : 'border-mauve-100 bg-white hover:border-mauve-300 hover:bg-mauve-50/50'}`}
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

export default function RSVP() {
  const [step,          setStep]         = useState(1);
  const [firstName,     setFirstName]    = useState('');
  const [lastName,      setLastName]     = useState('');
  const [attending,     setAttending]    = useState('');
  const [additionalNum, setAdditionalNum]= useState(0);
  const [additionals,   setAdditionals]  = useState([]);
  const [contact,       setContact]      = useState({ phone: '', email: '', notes: '' });
  const [submitting,    setSubmitting]   = useState(false);
  const [submitted,     setSubmitted]    = useState(false);
  const [error,         setError]        = useState('');

  const handleAdditionalNumChange = (n) => {
    const num = Math.max(0, Math.min(8, n));
    setAdditionalNum(num);
    setAdditionals(Array.from({ length: num }, (_, i) => additionals[i] || blankGuest()));
  };

  const updateAdditional = (i, field, value) => {
    setAdditionals(prev => prev.map((g, idx) => idx === i ? { ...g, [field]: value } : g));
  };

  const step1Valid = () => firstName.trim() && lastName.trim() && attending !== '';

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    const payload = {
      primaryGuest: { firstName, lastName, attending, ...contact },
      additionalGuests: additionals.filter(g => g.firstName.trim()),
      submittedAt: new Date().toISOString(),
    };
    try {
      await axios.post('/api/rsvp', payload);
      setSubmitted(true);
    } catch {
      // localStorage fallback
      const stored = JSON.parse(localStorage.getItem('rsvps') || '[]');
      stored.push({ ...payload, id: Date.now() });
      localStorage.setItem('rsvps', JSON.stringify(stored));
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-white pt-16 md:pt-20">
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-mauve-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-mauve-600" />
          </div>
          <h1 className="font-serif text-4xl text-mauve-800 mb-3">
            {attending === 'yes' ? 'See you there!' : 'Thank you!'}
          </h1>
          <FloralSprig className="my-4" />
          <p className="font-sans text-mauve-600 text-base mb-2">
            {attending === 'yes'
              ? `We're so excited to celebrate with you, ${firstName}!`
              : `Thank you for letting us know, ${firstName}. You'll be missed!`}
          </p>
          {attending === 'yes' && (
            <>
              <p className="font-sans text-sm text-mauve-400 mb-8">
                July 5, 2026 · 8:00 AM · Grandion Event Venue, Frisco TX
              </p>
              <a
                href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Avinash+%26+Ananya+%E2%80%94+Engagement+Ceremony&dates=20260705T080000%2F20260705T140000&details=Join+us+to+celebrate+the+engagement+of+Avinash+and+Ananya%21&location=Grandion+Event+Venue%2C+1810+Parkwood+Blvd%2C+Frisco%2C+TX+75034"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 btn-primary text-sm px-6 py-3"
              >
                <CalendarPlus className="w-4 h-4" />
                Add to Google Calendar
              </a>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top floral */}
      <div className="pt-16 md:pt-20 relative overflow-hidden">
        <FloralTopBanner className="absolute top-0 left-0 right-0 opacity-50" />
        <div className="relative z-10 py-14 px-4 text-center">
          <p className="font-sans text-xs tracking-widest3 uppercase text-mauve-400 mb-3">
            Engagement Ceremony · July 5, 2026
          </p>
          <h1 className="font-serif text-5xl md:text-6xl tracking-widest2 text-mauve-800 uppercase mb-2">
            RSVP
          </h1>
          <p className="font-serif italic text-mauve-500">
                Please respond by June 25, 2026
          </p>
        </div>
      </div>

      {/* Step indicator — 2 steps now */}
      <div className="max-w-xs mx-auto px-6 mb-8">
        <div className="flex items-center">
          <StepDot step={1} current={step} label="Your Info" />
          <StepLine done={step > 1} />
          <StepDot step={2} current={step} label="Confirm"   />
        </div>
      </div>

      {/* ── STEP 1: Name + attendance + additional guests ─────────────────── */}
      {step === 1 && (
        <div className="max-w-lg mx-auto px-4 pb-20 animate-fade-in-up">
          <div className="card">
            <h2 className="font-serif text-2xl text-mauve-800 mb-1 text-center">Your Details</h2>
            <p className="font-sans text-sm text-mauve-400 text-center mb-6">
              Please enter your first and last name below.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="form-label mb-3">Will you attend? *</label>
              <div className="space-y-3">
                <AttendOption
                  value="yes"
                  label="Joyfully accepts"
                  sub="I'll be there to celebrate!"
                  selected={attending === 'yes'}
                  onClick={setAttending}
                />
                <AttendOption
                  value="no"
                  label="Regretfully declines"
                  sub="I'm unable to make it"
                  selected={attending === 'no'}
                  onClick={setAttending}
                />
              </div>
            </div>

            {/* Additional guests — only if attending */}
            {attending === 'yes' && (
              <div className="mb-6">
                <label className="form-label">Additional Guests</label>
                <p className="font-sans text-xs text-mauve-400 mb-3">
                  How many additional guests will be accompanying you ? (0 – 8)
                </p>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleAdditionalNumChange(additionalNum - 1)}
                    className="w-10 h-10 rounded-full border-2 border-mauve-200 text-mauve-600 text-xl
                               flex items-center justify-center hover:border-mauve-400 transition-colors"
                  >−</button>
                  <span className="font-serif text-3xl text-mauve-700 w-8 text-center">{additionalNum}</span>
                  <button
                    type="button"
                    onClick={() => handleAdditionalNumChange(additionalNum + 1)}
                    className="w-10 h-10 rounded-full border-2 border-mauve-200 text-mauve-600 text-xl
                               flex items-center justify-center hover:border-mauve-400 transition-colors"
                  >+</button>
                </div>

                {/* Name fields for additional guests */}
                {additionals.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {additionals.map((g, i) => (
                      <div key={i} className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="form-label flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" /> Guest {i + 1} First
                          </label>
                          <input
                            type="text"
                            className="form-input text-sm"
                            placeholder="First name"
                            value={g.firstName}
                            onChange={e => updateAdditional(i, 'firstName', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="form-label">Last Name</label>
                          <input
                            type="text"
                            className="form-input text-sm"
                            placeholder="Last name"
                            value={g.lastName}
                            onChange={e => updateAdditional(i, 'lastName', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              disabled={!step1Valid()}
              onClick={() => setStep(2)}
              className={`btn-primary w-full flex items-center justify-center gap-2 mt-2
                ${!step1Valid() ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Contact + confirm ─────────────────────────────────────── */}
      {step === 2 && (
        <div className="max-w-lg mx-auto px-4 pb-20 animate-fade-in-up">
          <div className="card">
            <h2 className="font-serif text-2xl text-mauve-800 mb-1 text-center">Confirm RSVP</h2>
            <p className="font-sans text-sm text-mauve-400 text-center mb-6">
              Almost done! Add your contact info and review.
            </p>

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
                  onChange={e => setContact(p => ({ ...p, phone: e.target.value }))}
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
                  onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
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
                  onChange={e => setContact(p => ({ ...p, notes: e.target.value }))}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-mauve-100/60 rounded-xl p-4 mb-6 space-y-2">
              <h3 className="font-serif text-base text-mauve-700 mb-2">Your RSVP Summary</h3>
              <p className="font-sans text-sm text-mauve-600">
                <span className="font-semibold">{firstName} {lastName}</span>
                {' — '}
                <span className={attending === 'yes' ? 'text-sage-600' : 'text-blush-600'}>
                  {attending === 'yes' ? '✓ Attending' : '✗ Not attending'}
                </span>
              </p>
              {additionals.filter(g => g.firstName).map((g, i) => (
                <p key={i} className="font-sans text-sm text-mauve-600">
                  + <span className="font-semibold">{g.firstName} {g.lastName}</span>
                </p>
              ))}
              <p className="font-sans text-xs text-mauve-400 pt-1 border-t border-mauve-200">
                {1 + additionals.filter(g => g.firstName).length} guest(s) total
              </p>
            </div>

            {error && (
              <p className="font-sans text-sm text-red-500 mb-4 text-center">{error}</p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1 text-sm">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`btn-primary flex-1 flex items-center justify-center gap-2 text-sm
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
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-10 text-center border-t border-mauve-100">
        <FloralSprig className="mb-3" />
        <p className="font-serif italic text-mauve-400 text-sm">
          Avinash &amp; Ananya &nbsp;·&nbsp; July 5, 2026
        </p>
      </footer>
    </div>
  );
}
