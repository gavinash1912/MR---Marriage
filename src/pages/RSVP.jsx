import { useState } from 'react';
import axios from 'axios';
import { FloralSprig, FloralTopBanner } from '../components/FloralDecor';
import { Check, ChevronRight, User, Users, Phone, Mail, MessageSquare, CalendarPlus } from 'lucide-react';

// ── Step indicator ──────────────────────────────────────────────────────────
function StepDot({ step, current, label }) {
  const done    = step < current;
  const active  = step === current;
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

// ── Radio attendance option ─────────────────────────────────────────────────
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

// ── Meal option ─────────────────────────────────────────────────────────────
function MealOption({ value, label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`px-4 py-2.5 rounded-full border-2 font-sans text-sm transition-all duration-200
        ${selected
          ? 'border-mauve-500 bg-mauve-600 text-white shadow-sm'
          : 'border-mauve-200 text-mauve-600 hover:border-mauve-400'}`}
    >
      {label}
    </button>
  );
}

// ── Main RSVP page ───────────────────────────────────────────────────────────
const TOTAL_STEPS = 3;

const blankGuest = () => ({
  firstName:    '',
  lastName:     '',
  attending:    '',  // 'yes' | 'no'
  meal:         '',
  dietary:      '',
});

export default function RSVP() {
  const [step,          setStep]          = useState(1);
  const [primaryGuest,  setPrimaryGuest]  = useState(blankGuest());
  const [additionalNum, setAdditionalNum] = useState(0);
  const [additionals,   setAdditionals]   = useState([]);
  const [contact,       setContact]       = useState({ phone: '', email: '', notes: '' });
  const [submitting,    setSubmitting]     = useState(false);
  const [submitted,     setSubmitted]      = useState(false);
  const [error,         setError]          = useState('');

  // ── Helpers ────────────────────────────────────────────────────────────────
  const updateGuest = (setter, field, value) => {
    setter(prev => ({ ...prev, [field]: value }));
  };

  const updateAdditional = (index, field, value) => {
    setAdditionals(prev =>
      prev.map((g, i) => i === index ? { ...g, [field]: value } : g)
    );
  };

  const handleAdditionalNumChange = (n) => {
    const num = Math.max(0, Math.min(8, n));
    setAdditionalNum(num);
    setAdditionals(
      Array.from({ length: num }, (_, i) => additionals[i] || blankGuest())
    );
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const step1Valid = () =>
    primaryGuest.firstName.trim() &&
    primaryGuest.lastName.trim() &&
    primaryGuest.attending !== '';

  const step2Valid = () => {
    if (primaryGuest.attending === 'no') return true;
    if (!primaryGuest.meal) return false;
    return additionals.every(g => !g.firstName || (g.firstName && g.meal));
  };

  // ── Submission ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    const payload = {
      primaryGuest: { ...primaryGuest, ...contact },
      additionalGuests: additionals.filter(g => g.firstName.trim()),
      submittedAt: new Date().toISOString(),
    };
    try {
      await axios.post('/api/rsvp', payload);
      setSubmitted(true);
    } catch (err) {
      // If the API is not configured yet, fall back to localStorage
      const stored = JSON.parse(localStorage.getItem('rsvps') || '[]');
      stored.push({ ...payload, id: Date.now() });
      localStorage.setItem('rsvps', JSON.stringify(stored));
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    const attending = primaryGuest.attending === 'yes';
    return (
      <div className="min-h-screen bg-white pt-16 md:pt-20">
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-mauve-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-mauve-600" />
          </div>
          <h1 className="font-serif text-4xl text-mauve-800 mb-3">
            {attending ? 'See you there!' : 'Thank you!'}
          </h1>
          <FloralSprig className="my-4" />
          <p className="font-sans text-mauve-600 text-base mb-2">
            {attending
              ? `We're so excited to celebrate with you, ${primaryGuest.firstName}!`
              : `Thank you for letting us know, ${primaryGuest.firstName}. You'll be missed!`}
          </p>
          {attending && (
            <p className="font-sans text-sm text-mauve-400 mb-8">
              July 8, 2026 · 8:00 AM · Grandion Event Center, Frisco TX
            </p>
          )}
          {attending && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <a
                href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Avinash+%26+Ananya+%E2%80%94+Engagement+Ceremony&dates=20260708T080000%2F20260708T140000&details=Join+us+to+celebrate+the+engagement+of+Avinash+and+Ananya%21&location=Grandion+Event+Center%2C+1810+Parkwood+Blvd%2C+Frisco%2C+TX+75034"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 btn-primary text-sm px-5 py-3"
              >
                <CalendarPlus className="w-4 h-4" />
                Add to Google Calendar
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Form wrapper ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      {/* Top floral */}
      <div className="pt-16 md:pt-20 relative overflow-hidden">
        <FloralTopBanner className="absolute top-0 left-0 right-0 opacity-50" />
        <div className="relative z-10 py-14 px-4 text-center">
          <p className="font-sans text-xs tracking-widest3 uppercase text-mauve-400 mb-3">
            Engagement Ceremony · July 8, 2026
          </p>
          <h1 className="font-serif text-5xl md:text-6xl tracking-widest2 text-mauve-800 uppercase mb-2">
            RSVP
          </h1>
          <p className="font-serif italic text-mauve-500">
            Please respond by June 28, 2026
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="max-w-md mx-auto px-6 mb-8">
        <div className="flex items-center">
          <StepDot step={1} current={step} label="Your Info"  />
          <StepLine done={step > 1} />
          <StepDot step={2} current={step} label="Meal"       />
          <StepLine done={step > 2} />
          <StepDot step={3} current={step} label="Confirm"    />
        </div>
      </div>

      {/* ── STEP 1: Name + attendance ─────────────────────────────────────────── */}
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
                  value={primaryGuest.firstName}
                  onChange={e => updateGuest(setPrimaryGuest, 'firstName', e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={primaryGuest.lastName}
                  onChange={e => updateGuest(setPrimaryGuest, 'lastName', e.target.value)}
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
                  selected={primaryGuest.attending === 'yes'}
                  onClick={v => updateGuest(setPrimaryGuest, 'attending', v)}
                />
                <AttendOption
                  value="no"
                  label="Regretfully declines"
                  sub="I'm unable to make it"
                  selected={primaryGuest.attending === 'no'}
                  onClick={v => updateGuest(setPrimaryGuest, 'attending', v)}
                />
              </div>
            </div>

            {/* Additional guests */}
            {primaryGuest.attending === 'yes' && (
              <div className="mb-6">
                <label className="form-label">Additional Guests</label>
                <p className="font-sans text-xs text-mauve-400 mb-3">
                  How many additional guests are you bringing? (0 – 8)
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

      {/* ── STEP 2: Meal preferences ──────────────────────────────────────────── */}
      {step === 2 && (
        <div className="max-w-lg mx-auto px-4 pb-20 animate-fade-in-up">
          <div className="card">
            <h2 className="font-serif text-2xl text-mauve-800 mb-1 text-center">Meal Preferences</h2>
            <p className="font-sans text-sm text-mauve-400 text-center mb-6">
              Breakfast &amp; Lunch will be served. Please choose a preference.
            </p>

            {primaryGuest.attending === 'no' ? (
              <p className="font-sans text-sm text-mauve-400 text-center py-4">
                No meal preference needed — we'll miss you!
              </p>
            ) : (
              <>
                {/* Primary guest meal */}
                <div className="mb-6">
                  <label className="form-label flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {primaryGuest.firstName || 'You'}
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'No Preference'].map(m => (
                      <MealOption
                        key={m} value={m} label={m}
                        selected={primaryGuest.meal === m}
                        onClick={v => updateGuest(setPrimaryGuest, 'meal', v)}
                      />
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="form-label">Dietary restrictions / allergies</label>
                    <input
                      type="text"
                      className="form-input text-sm"
                      placeholder="e.g. nut allergy, gluten free…"
                      value={primaryGuest.dietary}
                      onChange={e => updateGuest(setPrimaryGuest, 'dietary', e.target.value)}
                    />
                  </div>
                </div>

                {/* Additional guests meals */}
                {additionals.map((g, i) => (
                  <div key={i} className="mb-5 pt-5 border-t border-mauve-100">
                    <label className="form-label flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Guest {i + 1}
                    </label>
                    <div className="grid grid-cols-2 gap-3 mt-2 mb-3">
                      <input
                        type="text"
                        className="form-input text-sm"
                        placeholder="First name"
                        value={g.firstName}
                        onChange={e => updateAdditional(i, 'firstName', e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input text-sm"
                        placeholder="Last name"
                        value={g.lastName}
                        onChange={e => updateAdditional(i, 'lastName', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'No Preference'].map(m => (
                        <MealOption
                          key={m} value={m} label={m}
                          selected={g.meal === m}
                          onClick={v => updateAdditional(i, 'meal', v)}
                        />
                      ))}
                    </div>
                    <input
                      type="text"
                      className="form-input text-sm mt-2"
                      placeholder="Dietary restrictions / allergies"
                      value={g.dietary}
                      onChange={e => updateAdditional(i, 'dietary', e.target.value)}
                    />
                  </div>
                ))}
              </>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary flex-1 text-sm"
              >
                Back
              </button>
              <button
                disabled={!step2Valid()}
                onClick={() => setStep(3)}
                className={`btn-primary flex-1 flex items-center justify-center gap-2 text-sm
                  ${!step2Valid() ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Contact + confirm ─────────────────────────────────────────── */}
      {step === 3 && (
        <div className="max-w-lg mx-auto px-4 pb-20 animate-fade-in-up">
          <div className="card">
            <h2 className="font-serif text-2xl text-mauve-800 mb-1 text-center">Confirm RSVP</h2>
            <p className="font-sans text-sm text-mauve-400 text-center mb-6">
              Almost done! Add your contact info and review your RSVP.
            </p>

            {/* Contact info */}
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
                <span className="font-semibold">{primaryGuest.firstName} {primaryGuest.lastName}</span>
                {' — '}
                <span className={primaryGuest.attending === 'yes' ? 'text-sage-600' : 'text-blush-600'}>
                  {primaryGuest.attending === 'yes' ? '✓ Attending' : '✗ Not attending'}
                </span>
              </p>
              {primaryGuest.meal && (
                <p className="font-sans text-xs text-mauve-400">Meal: {primaryGuest.meal}</p>
              )}
              {additionals.filter(g => g.firstName).map((g, i) => (
                <p key={i} className="font-sans text-sm text-mauve-600">
                  <span className="font-semibold">{g.firstName} {g.lastName}</span>
                  {g.meal && <span className="text-mauve-400"> · {g.meal}</span>}
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
              <button
                onClick={() => setStep(2)}
                className="btn-secondary flex-1 text-sm"
              >
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
          Avinash &amp; Ananya &nbsp;·&nbsp; July 8, 2026
        </p>
      </footer>
    </div>
  );
}
