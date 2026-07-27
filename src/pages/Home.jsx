import { Link } from 'react-router-dom';
import { useVisitAnalytics } from '../utils/analytics';
import { getInvitationConfig } from '../utils/events';

export default function Home({ invitationMode = 'full' }) {
  const invitation = getInvitationConfig(invitationMode);
  const { handleTrackedClick } = useVisitAnalytics({
    sections: ['Invitation Card'],
    metadata: {
      invitationMode: invitation.mode,
      invitationLabel: invitation.label,
      inviteHomePath: invitation.homePath,
    },
  });

  return (
    <div className="invitation-page" onClickCapture={handleTrackedClick}>
      <main className="invitation-card" data-analytics-section="Invitation Card">
        {/* The actual invitation card image as the decorative frame */}
        <img
          src="/images/invitation-card.png"
          alt=""
          aria-hidden="true"
          className="invitation-card__bg"
          draggable="false"
        />

        {/* Real wedding content overlaid on the card */}
        <div className="invitation-card__overlay">
          <p className="inv-parents">
            With the heavenly blessings of their families
          </p>

          <p className="inv-invite-line">
            cordially invite you for the marriage ceremony of
          </p>

          <h1 className="inv-name">Manas</h1>
          <p className="inv-amp">&amp;</p>
          <h1 className="inv-name">Rupa Sree</h1>

          <p className="inv-invite-line">which will be conducted on</p>

          <div className="inv-date" aria-label="Wedding date and time">
            <span className="inv-date__line" />
            <span className="inv-date__month">SEPTEMBER</span>
            <span className="inv-date__line" />
            <div className="inv-date__row">
              <span>SATURDAY</span>
              <span className="inv-date__day">5</span>
              <span>AT 8 AM</span>
            </div>
            <span className="inv-date__line" />
            <span className="inv-date__year">2026</span>
            <span className="inv-date__line" />
          </div>

          <p className="inv-at">at</p>
          <p className="inv-address">
            Atithi Venue,<br />
            9060 Independence Parkway,<br />
            Plano, TX 75025
          </p>
        </div>

        {/* Action buttons below the card */}
        <nav className="invitation-actions" aria-label="Invitation links">
          <Link to={invitation.schedulePath} className="btn-primary">
            Schedule
          </Link>
          <Link to={invitation.rsvpPath} className="btn-primary">
            RSVP
          </Link>
        </nav>
      </main>
    </div>
  );
}
