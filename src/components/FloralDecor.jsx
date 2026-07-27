const DECORATIVE_ALT = '';

function DecorativeImage({ src, className = '' }) {
  return (
    <img
      src={src}
      alt={DECORATIVE_ALT}
      aria-hidden="true"
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

export function FloralLeft({ className = '' }) {
  return (
    <div className={`floral-side-strip floral-side-strip--left pointer-events-none select-none ${className}`} aria-hidden="true">
      <DecorativeImage src="/images/rose-bouquet.png" className="floral-side-strip__bloom floral-side-strip__bloom--top" />
      <DecorativeImage src="/images/rose-cluster.png" className="floral-side-strip__bloom floral-side-strip__bloom--mid" />
      <DecorativeImage src="/images/rose-bouquet.png" className="floral-side-strip__bloom floral-side-strip__bloom--bottom" />
    </div>
  );
}

export function FloralRight({ className = '' }) {
  return (
    <div className={`floral-side-strip floral-side-strip--right pointer-events-none select-none ${className}`} aria-hidden="true">
      <DecorativeImage src="/images/rose-bouquet.png" className="floral-side-strip__bloom floral-side-strip__bloom--top" />
      <DecorativeImage src="/images/rose-cluster.png" className="floral-side-strip__bloom floral-side-strip__bloom--mid" />
      <DecorativeImage src="/images/rose-bouquet.png" className="floral-side-strip__bloom floral-side-strip__bloom--bottom" />
    </div>
  );
}

export function FloralTopBanner({ className = '' }) {
  return (
    <div className={`floral-top-banner pointer-events-none select-none ${className}`} aria-hidden="true">
      <div className="floral-top-banner__layer floral-top-banner__layer--base">
        <DecorativeImage src="/images/rose-pink.png" className="floral-top-banner__flower floral-top-banner__flower--pink-left" />
        <DecorativeImage src="/images/rose-red.png" className="floral-top-banner__flower floral-top-banner__flower--red-left" />
        <DecorativeImage src="/images/rose-pink.png" className="floral-top-banner__flower floral-top-banner__flower--pink-center" />
        <DecorativeImage src="/images/rose-red.png" className="floral-top-banner__flower floral-top-banner__flower--red-right" />
        <DecorativeImage src="/images/rose-pink.png" className="floral-top-banner__flower floral-top-banner__flower--pink-right" />
      </div>
      <div className="floral-top-banner__layer floral-top-banner__layer--accent">
        <DecorativeImage src="/images/rose-border.png" className="floral-top-banner__flower floral-top-banner__flower--border-left" />
        <DecorativeImage src="/images/rose-border.png" className="floral-top-banner__flower floral-top-banner__flower--border-right" />
      </div>
    </div>
  );
}

export function FloralDivider({ className = '' }) {
  return (
    <div className={`floral-divider pointer-events-none select-none ${className}`} aria-hidden="true">
      <div className="floral-divider__track">
        <DecorativeImage src="/images/rose-red.png" className="floral-divider__flower floral-divider__flower--left" />
        <DecorativeImage src="/images/rose-pink.png" className="floral-divider__flower floral-divider__flower--mid-left" />
        <DecorativeImage src="/images/rose-red.png" className="floral-divider__flower floral-divider__flower--center" />
        <DecorativeImage src="/images/rose-pink.png" className="floral-divider__flower floral-divider__flower--mid-right" />
        <DecorativeImage src="/images/rose-red.png" className="floral-divider__flower floral-divider__flower--right" />
      </div>
    </div>
  );
}

export function FloralSprig({ className = '' }) {
  return (
    <div className={`floral-sprig pointer-events-none select-none ${className}`} aria-hidden="true">
      <DecorativeImage src="/images/rose-cluster.png" className="floral-sprig__flower floral-sprig__flower--left" />
      <DecorativeImage src="/images/rose-cluster.png" className="floral-sprig__flower floral-sprig__flower--right" />
    </div>
  );
}
