import { Link } from 'react-router-dom';
import { useVisitAnalytics } from '../utils/analytics';
import { getInvitationConfig } from '../utils/events';
import { OrnateInvitation } from '../components/OrnateInvitation';

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
    <div className="city2-page ornate-page min-h-screen" onClickCapture={handleTrackedClick}>
      <main className="ornate-home-shell" data-analytics-section="Invitation Card">
        <OrnateInvitation>
          <div className="ornate-invite-content">
            <p className="ornate-parents">With the heavenly blessings of their families</p>
            <p className="ornate-line ornate-line--accent">cordially invite you for the marriage ceremony of</p>

            <h1 className="ornate-couple">Manas</h1>
            <p className="ornate-amp">&amp;</p>
            <h1 className="ornate-couple ornate-couple--second">Rupa Sree</h1>

            <p className="ornate-line ornate-line--accent">to join us in the wedding celebrations</p>

            <p className="ornate-line ornate-line--accent ornate-conducted">which will be conducted on</p>

            <div className="ornate-date-wrap" aria-label="Wedding date and time">
              <span>SEPTEMBER</span>
              <span>SATURDAY 5 AT 8 AM</span>
              <span>2026</span>
            </div>

            <p className="ornate-at">at</p>
            <p className="ornate-address">Atithi Venue,<br />9060 Independence Parkway, Plano, TX 75025</p>

            <nav className="ornate-actions" aria-label="Invitation links">
              <Link to={invitation.schedulePath}>Schedule</Link>
              <Link to={invitation.rsvpPath}>RSVP</Link>
            </nav>
          </div>
        </OrnateInvitation>
      </main>
    </div>
  );
}
