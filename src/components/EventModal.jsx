import { useEffect } from 'react';
import { X, MapPin, Clock, Calendar, CalendarPlus, Shirt } from 'lucide-react';
import { downloadCalendarInvite, getGoogleCalendarUrl } from '../utils/calendar';

export default function EventModal({ event, onClose, onCalendarAction }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!event) return null;

  return (
    <div
      className="event-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div className="event-modal animate-fade-in-up">
        <button
          type="button"
          className="event-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="event-modal__poster">
          {event.poster ? (
            <img src={event.poster} alt={`${event.name} poster`} className="event-modal__poster-img" />
          ) : (
            <>
              <span className="event-modal__poster-name">{event.name}</span>
              <span className="event-modal__poster-badge">Poster Coming Soon</span>
            </>
          )}
        </div>

        <div className="event-modal__body">
          <h2 id="event-modal-title" className="event-modal__title">{event.name}</h2>

          <div className="event-modal__detail">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{event.dateLabel}</span>
          </div>

          <div className="event-modal__detail">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{event.timeLabel}</span>
          </div>

          <div className="event-modal__detail">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{event.venue}<br />{event.address}</span>
          </div>

          {event.dressCode && (
            <div className="event-modal__detail">
              <Shirt className="w-4 h-4 flex-shrink-0" />
              <span>Dress Code: {event.dressCode}</span>
            </div>
          )}

          {event.description && (
            <p className="event-modal__desc">{event.description}</p>
          )}

          <div className="event-modal__calendar-actions">
            <a
              href={getGoogleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary event-modal__calendar-link"
              onClick={() => onCalendarAction?.('google', event)}
            >
              <CalendarPlus className="w-4 h-4" />
              Google Calendar
            </a>
            <button
              type="button"
              onClick={() => {
                onCalendarAction?.('apple_outlook', event);
                downloadCalendarInvite(event);
              }}
              className="btn-calendar-download event-modal__calendar-link"
            >
              <Calendar className="w-4 h-4" />
              Apple / Outlook
            </button>
          </div>

          {event.mapUrl && (
            <a
              href={event.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary event-modal__map-link"
            >
              <MapPin className="w-4 h-4" />
              View on Google Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
