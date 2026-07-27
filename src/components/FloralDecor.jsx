const P = {
  maroon: '#6c061e',
  burgundy: '#a70f2f',
  wine: '#5d061d',
  rose: '#d84e67',
  lotus: '#e76b84',
  lotusLight: '#f8c7d0',
  lotusDeep: '#b82d4a',
  gold: '#c49a38',
  goldLight: '#edd38a',
  turmeric: '#e9ad2e',
  saffron: '#d87925',
  leaf: '#4c6031',
  leafDark: '#2d4a1e',
  leafLight: '#718a46',
  ivory: '#fff8e8',
  line: '#c49a38',
};

function Defs() {
  return (
    <defs>
      <linearGradient id="lotusPetal" x1="0" y1="-44" x2="0" y2="12" gradientUnits="userSpaceOnUse">
        <stop stopColor={P.lotusLight} />
        <stop offset="0.58" stopColor={P.lotus} />
        <stop offset="1" stopColor={P.lotusDeep} />
      </linearGradient>
      <linearGradient id="mangoLeaf" x1="0" y1="-12" x2="76" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor={P.leafLight} />
        <stop offset="0.42" stopColor={P.leaf} />
        <stop offset="1" stopColor={P.leafDark} />
      </linearGradient>
      <filter id="decorSoft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
        <feOffset dy="2" result="offset" />
        <feMerge>
          <feMergeNode in="offset" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

function Lotus({ cx, cy, scale = 1, opacity = 1 }) {
  const backPetals = [-62, -34, 0, 34, 62];
  const frontPetals = [-42, -18, 18, 42];

  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`} opacity={opacity} filter="url(#decorSoft)">
      <ellipse cx="0" cy="8" rx="56" ry="16" fill={P.rose} opacity="0.12" />
      {backPetals.map(angle => (
        <path
          key={`back-${angle}`}
          d="M0 10 C20 -8 22 -36 0 -52 C-22 -36 -20 -8 0 10Z"
          fill="url(#lotusPetal)"
          opacity="0.9"
          transform={`rotate(${angle})`}
        />
      ))}
      {frontPetals.map(angle => (
        <path
          key={`front-${angle}`}
          d="M0 14 C17 -2 18 -29 0 -43 C-18 -29 -17 -2 0 14Z"
          fill={P.lotusLight}
          opacity="0.92"
          transform={`rotate(${angle}) translate(0 4)`}
        />
      ))}
      <path
        d="M-44 16 C-26 4 -8 2 0 20 C8 2 26 4 44 16 C26 28 -26 28 -44 16Z"
        fill={P.lotusDeep}
        opacity="0.82"
      />
      <circle cx="0" cy="15" r="5" fill={P.goldLight} />
    </g>
  );
}

function MangoLeaf({ x, y, angle = 0, scale = 1, opacity = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`} opacity={opacity}>
      <path
        d="M0 0 C18 -30 56 -38 78 -4 C58 22 22 28 0 0Z"
        fill="url(#mangoLeaf)"
      />
      <path
        d="M6 0 C25 -7 52 -8 74 -4"
        stroke={P.leafDark}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.48"
      />
      <path
        d="M28 -6 C25 3 22 10 16 17 M45 -9 C43 0 41 8 36 17 M60 -8 C58 -1 56 5 51 12"
        stroke={P.leafDark}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.34"
      />
    </g>
  );
}

function Marigold({ cx, cy, r = 16, opacity = 1 }) {
  const petals = Array.from({ length: 14 }, (_, i) => i * (360 / 14));

  return (
    <g transform={`translate(${cx} ${cy})`} opacity={opacity} filter="url(#decorSoft)">
      {petals.map(angle => (
        <ellipse
          key={angle}
          cx="0"
          cy={-r * 0.56}
          rx={r * 0.28}
          ry={r * 0.48}
          fill={angle % 2 ? P.saffron : P.turmeric}
          transform={`rotate(${angle})`}
        />
      ))}
      <circle cx="0" cy="0" r={r * 0.46} fill={P.goldLight} />
      <circle cx="0" cy="0" r={r * 0.2} fill={P.gold} />
    </g>
  );
}

function Paisley({ x, y, scale = 1, rotate = 0, opacity = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} opacity={opacity}>
      <path
        d="M20 0 C4 16 2 38 18 50 C34 62 58 53 60 31 C62 15 49 8 42 2 C56 26 32 36 24 25 C16 14 31 5 20 0Z"
        fill="none"
        stroke={P.gold}
        strokeWidth="2"
      />
      <path d="M24 18 C30 12 41 14 44 24 C37 21 30 23 24 31" fill="none" stroke={P.burgundy} strokeWidth="1.4" />
      <circle cx="30" cy="38" r="3" fill={P.goldLight} />
    </g>
  );
}

function Toran({ y = 42, dense = false }) {
  const count = dense ? 19 : 15;
  const leaves = Array.from({ length: count }, (_, i) => {
    const x = 78 + i * ((1440 - 156) / (count - 1));
    const drop = y + 22 + Math.sin(i * 0.9) * 8;
    return { x, y: drop, angle: 82 + (i % 2 ? 13 : -13), scale: i % 3 === 1 ? 0.52 : 0.47 };
  });

  return (
    <g>
      <path
        d={`M0 ${y} C250 ${y + 38} 420 ${y + 4} 720 ${y + 34} C1020 ${y + 4} 1190 ${y + 38} 1440 ${y}`}
        stroke={P.gold}
        strokeWidth="3"
        fill="none"
        opacity="0.78"
      />
      <path
        d={`M0 ${y + 10} C250 ${y + 48} 420 ${y + 14} 720 ${y + 44} C1020 ${y + 14} 1190 ${y + 48} 1440 ${y + 10}`}
        stroke={P.burgundy}
        strokeWidth="1.4"
        fill="none"
        opacity="0.36"
      />
      {leaves.map((leaf, i) => (
        <g key={`leaf-${i}`}>
          <line x1={leaf.x} y1={y + 10} x2={leaf.x} y2={leaf.y + 4} stroke={P.gold} strokeWidth="1" opacity="0.6" />
          <MangoLeaf {...leaf} opacity="0.92" />
          {i % 2 === 0 && <Marigold cx={leaf.x + 18} cy={leaf.y + 55} r={dense ? 12 : 10} opacity="0.88" />}
        </g>
      ))}
    </g>
  );
}

function SideGarland({ mirror = false }) {
  const clusters = [
    { y: 78, lotus: 0.9, flower: 18 },
    { y: 215, lotus: 0.62, flower: 15 },
    { y: 365, lotus: 0.78, flower: 17 },
    { y: 520, lotus: 0.58, flower: 14 },
    { y: 665, lotus: 0.86, flower: 18 },
  ];
  const flip = mirror ? 'translate(180 0) scale(-1 1)' : '';

  return (
    <g transform={flip}>
      <path
        d="M76 0 C48 132 122 226 80 370 C42 498 98 602 70 760"
        stroke={P.gold}
        strokeWidth="2"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M91 0 C62 136 136 232 94 374 C58 500 112 603 88 760"
        stroke={P.burgundy}
        strokeWidth="1"
        fill="none"
        opacity="0.24"
      />

      {clusters.map((cluster, i) => (
        <g key={cluster.y}>
          <MangoLeaf x={72} y={cluster.y - 36} angle={i % 2 ? 30 : -26} scale="0.5" opacity="0.86" />
          <MangoLeaf x={88} y={cluster.y + 10} angle={i % 2 ? 150 : 132} scale="0.43" opacity="0.8" />
          <Lotus cx={i % 2 ? 66 : 95} cy={cluster.y} scale={cluster.lotus} opacity="0.9" />
          <Marigold cx={i % 2 ? 112 : 44} cy={cluster.y + 48} r={cluster.flower} opacity="0.9" />
          <Paisley x={i % 2 ? 16 : 116} y={cluster.y - 8} scale="0.42" rotate={i % 2 ? -20 : 160} opacity="0.52" />
        </g>
      ))}
    </g>
  );
}

export function FloralLeft({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 180 760" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <Defs />
        <SideGarland />
      </svg>
    </div>
  );
}

export function FloralRight({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 180 760" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <Defs />
        <SideGarland mirror />
      </svg>
    </div>
  );
}

export function FloralTopBanner({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none w-full overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1440 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
        <Defs />
        <Toran y={34} dense />

        <Lotus cx={124} cy={168} scale="0.88" opacity="0.94" />
        <Lotus cx={1316} cy={168} scale="0.88" opacity="0.94" />
        <Lotus cx={720} cy={102} scale="0.45" opacity="0.72" />

        <MangoLeaf x={225} y={134} angle="-20" scale="0.62" opacity="0.84" />
        <MangoLeaf x={1215} y={134} angle="200" scale="0.62" opacity="0.84" />
        <MangoLeaf x={308} y={92} angle="24" scale="0.42" opacity="0.64" />
        <MangoLeaf x={1132} y={92} angle="156" scale="0.42" opacity="0.64" />

        <Marigold cx={248} cy={184} r="18" opacity="0.92" />
        <Marigold cx={1192} cy={184} r="18" opacity="0.92" />
        <Marigold cx={636} cy={72} r="10" opacity="0.74" />
        <Marigold cx={804} cy={72} r="10" opacity="0.74" />

        <Paisley x={390} y={102} scale="0.72" rotate="-8" opacity="0.36" />
        <Paisley x={1050} y={102} scale="0.72" rotate="188" opacity="0.36" />

        <path
          d="M454 190 C560 224 640 212 720 188 C800 212 880 224 986 190"
          stroke={P.gold}
          strokeWidth="1.6"
          fill="none"
          opacity="0.36"
        />
        <path
          d="M502 210 C610 238 692 224 720 204 C748 224 830 238 938 210"
          stroke={P.burgundy}
          strokeWidth="1"
          fill="none"
          opacity="0.24"
        />
      </svg>
    </div>
  );
}

export function FloralSprig({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none inline-block ${className}`} aria-hidden="true">
      <svg viewBox="0 0 180 74" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-16">
        <Defs />
        <path d="M8 43 C44 24 72 26 90 42 C108 26 136 24 172 43" stroke={P.gold} strokeWidth="1.5" fill="none" opacity="0.64" />
        <MangoLeaf x={48} y={37} angle="160" scale="0.34" opacity="0.72" />
        <MangoLeaf x={132} y={37} angle="20" scale="0.34" opacity="0.72" />
        <Lotus cx={90} cy={35} scale="0.42" opacity="0.92" />
        <Marigold cx={38} cy={44} r="8" opacity="0.85" />
        <Marigold cx={142} cy={44} r="8" opacity="0.85" />
      </svg>
    </div>
  );
}
