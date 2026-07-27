function PaisleyCorner() {
  return (
    <svg viewBox="0 0 220 220" role="presentation" aria-hidden="true">
      <path d="M0 0h220v120c-16 2-30 5-44 16-19 14-25 32-46 43-26 14-52 12-76-8C22 149 10 126 0 100Z" fill="#f7b733" />
      <path d="M220 0v74c-14 0-26 2-37 9-17 10-21 26-38 37-23 15-48 16-71 3-19-10-33-29-39-52V0Z" fill="#b53c48" opacity="0.95" />
      <path d="M18 15c18 15 39 19 61 8 16-8 30-24 43-23 17 2 26 20 21 35-6 18-27 24-30 43-3 20 15 29 33 31" fill="none" stroke="#f8d26f" strokeWidth="8" strokeLinecap="round" />
      <path d="M39 27c7 12 20 18 33 15 8-2 16-8 24-8 11 1 18 13 14 23-4 11-18 15-20 27-2 11 9 16 19 17" fill="none" stroke="#ff5da2" strokeWidth="7" strokeLinecap="round" />
      <path d="M125 14c17 1 31 10 40 24 10 16 11 31 2 47-10 19-30 25-34 43" fill="none" stroke="#0f8f9a" strokeWidth="7" strokeLinecap="round" />
      <g fill="#fff6d2" opacity="0.9">
        <circle cx="172" cy="29" r="5" />
        <circle cx="157" cy="47" r="4" />
        <circle cx="185" cy="56" r="4" />
      </g>
      <g fill="#0f8f9a">
        <ellipse cx="82" cy="44" rx="8" ry="15" transform="rotate(-22 82 44)" />
        <ellipse cx="146" cy="72" rx="9" ry="17" transform="rotate(24 146 72)" />
      </g>
      <g fill="#ff4f9a">
        <ellipse cx="109" cy="52" rx="8" ry="14" transform="rotate(15 109 52)" />
        <ellipse cx="57" cy="72" rx="7" ry="12" transform="rotate(-20 57 72)" />
      </g>
      <g fill="#f7b733" opacity="0.9">
        <circle cx="123" cy="100" r="5" />
        <circle cx="102" cy="115" r="4" />
        <circle cx="145" cy="107" r="4" />
      </g>
    </svg>
  );
}

function MarigoldCluster({ mirrored = false }) {
  return (
    <svg viewBox="0 0 180 140" role="presentation" aria-hidden="true" style={mirrored ? { transform: 'scaleX(-1)' } : undefined}>
      <g>
        <circle cx="45" cy="95" r="26" fill="#e26a10" />
        <circle cx="45" cy="95" r="18" fill="#f7a627" />
        <circle cx="43" cy="92" r="10" fill="#ffcb4c" />
        <circle cx="92" cy="88" r="24" fill="#d85a0a" />
        <circle cx="92" cy="88" r="16" fill="#f39b1d" />
        <circle cx="91" cy="86" r="9" fill="#ffd86e" />
        <circle cx="130" cy="104" r="22" fill="#dd640d" />
        <circle cx="130" cy="104" r="14" fill="#f0a31e" />
        <circle cx="128" cy="102" r="8" fill="#ffd879" />
      </g>
      <g stroke="#2f7f3a" strokeWidth="4" fill="none" strokeLinecap="round">
        <path d="M35 114c-4 12-7 19-15 26" />
        <path d="M90 110c2 12 3 18 0 30" />
        <path d="M128 122c5 8 8 14 10 20" />
      </g>
      <g fill="#2f7f3a">
        <ellipse cx="25" cy="126" rx="8" ry="4" transform="rotate(-28 25 126)" />
        <ellipse cx="103" cy="125" rx="8" ry="4" transform="rotate(18 103 125)" />
        <ellipse cx="145" cy="128" rx="8" ry="4" transform="rotate(22 145 128)" />
      </g>
      <g fill="#fff7dc" opacity="0.95">
        <circle cx="12" cy="110" r="4" />
        <circle cx="19" cy="103" r="3" />
        <circle cx="167" cy="114" r="4" />
        <circle cx="159" cy="106" r="3" />
      </g>
    </svg>
  );
}

function MandapIllustration() {
  return (
    <svg viewBox="0 0 300 150" role="presentation" aria-hidden="true">
      <path d="M18 140V86c14-7 33-12 55-12h154c23 0 42 5 55 12v54Z" fill="#8a2347" />
      <path d="M40 88c0-40 26-64 56-64h108c31 0 56 24 56 64" fill="#8a2347" />
      <path d="M57 92V55h30v37M135 92V55h30v37M212 92V55h30v37" fill="#f6ad44" />
      <path d="M47 55c12-10 20-14 25-21 6 8 13 12 24 21M125 55c12-10 20-14 25-21 6 8 13 12 24 21M203 55c12-10 20-14 25-21 6 8 13 12 24 21" fill="#f6ad44" />
      <path d="M18 140h264" stroke="#c24766" strokeWidth="7" />
      <g fill="#f9c05c">
        <circle cx="75" cy="43" r="4" />
        <circle cx="150" cy="38" r="4" />
        <circle cx="225" cy="43" r="4" />
      </g>
    </svg>
  );
}

export function OrnateInvitation({ children, compact = false, className = '' }) {
  return (
    <div className={`ornate-wrap ${compact ? 'is-compact' : ''} ${className}`}>
      <div className="ornate-bg" aria-hidden="true" />

      <div className="ornate-frame">
        <span className="ornate-corner ornate-corner--tl"><PaisleyCorner /></span>
        <span className="ornate-corner ornate-corner--tr"><PaisleyCorner /></span>

        <span className="ornate-lantern ornate-lantern--left" aria-hidden="true">
          <img src="/images/lantern.png" alt="" loading="lazy" decoding="async" />
        </span>
        <span className="ornate-lantern ornate-lantern--center" aria-hidden="true">
          <img src="/images/lantern.png" alt="" loading="lazy" decoding="async" />
        </span>
        <span className="ornate-lantern ornate-lantern--right" aria-hidden="true">
          <img src="/images/lantern.png" alt="" loading="lazy" decoding="async" />
        </span>

        <div className="ornate-arch">{children}</div>

        <span className="ornate-marigold ornate-marigold--left"><MarigoldCluster /></span>
        <span className="ornate-marigold ornate-marigold--right"><MarigoldCluster mirrored /></span>
        <span className="ornate-mandap"><MandapIllustration /></span>
      </div>
    </div>
  );
}
