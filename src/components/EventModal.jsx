import { useEffect } from 'react';
import { X, MapPin, Clock, Calendar, Shirt } from 'lucide-react';

export default function EventModal({ event, onClose }) {
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
          <span className="event-modal__poster-name">{event.name}</span>
          <span className="event-modal__poster-badge">Poster Coming Soon</span>
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
