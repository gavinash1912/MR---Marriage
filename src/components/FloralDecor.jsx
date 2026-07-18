// Botanical florals - watercolor-style in a warm marriage palette:
// rose lotus blooms, maroon dahlias, gold sprigs, and deep sage leaves.

const P = {
  // Rose lotus blooms
  p1: '#e8a8a8', p2: '#f2c8c0', p3: '#b84e5e', p4: '#fff0e6',
  // Maroon dahlias
  d1: '#8e263f', d2: '#b64a5a', d3: '#571326', d4: '#dfa0a8',
  // Gold accent sprigs
  o1: '#b8860b', o2: '#d6a842', o3: '#f3d074',
  // Deep sage + olive leaves
  s1: '#314a2f', s2: '#47623a', s3: '#6d844d', s4: '#8a9b62',
  ol: '#3f4b2c',
  // Vermilion rose
  m1: '#bf3852', m2: '#dc6f78', m3: '#f0a7ad',
  // Antique gold
  lv1: '#a66e2a', lv2: '#c99b50', lv3: '#efd9a5',
  // Ivory blossoms
  bl: '#fff1dc', bl2: '#ffe0c7',
};

// ── Watercolor/organic filter ─────────────────────────────────────────────────
function Defs() {
  return (
    <defs>
      <filter id="wc" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" seed="5"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5"
          xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="soft" x="-5%" y="-5%" width="110%" height="110%">
        <feGaussianBlur stdDeviation="0.8"/>
      </filter>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
  );
}

// ── Big Peony — large loose blue-gray flower ──────────────────────────────────
function BigPeony({ cx, cy, r = 50, opacity = 0.80 }) {
  // Watercolor glow underneath
  const glow = <circle cx={cx} cy={cy} r={r * 1.2} fill={P.p1} opacity={0.12} filter="url(#soft)"/>;
  // 8 large outer petals
  const outer = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45) * Math.PI / 180;
    const ex = cx + Math.cos(a) * r * 0.62, ey = cy + Math.sin(a) * r * 0.62;
    return <ellipse key={i} cx={ex} cy={ey} rx={r * 0.54} ry={r * 0.38}
      fill={P.p1} opacity={0.62}
      transform={`rotate(${i * 45} ${ex} ${ey})`}/>;
  });
  // 6 mid petals
  const mid = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 + 22) * Math.PI / 180;
    const ex = cx + Math.cos(a) * r * 0.35, ey = cy + Math.sin(a) * r * 0.35;
    return <ellipse key={i} cx={ex} cy={ey} rx={r * 0.38} ry={r * 0.28}
      fill={P.p2} opacity={0.75}
      transform={`rotate(${i * 60 + 22} ${ex} ${ey})`}/>;
  });
  // Inner light cluster
  const inner = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 + 10) * Math.PI / 180;
    const ex = cx + Math.cos(a) * r * 0.16, ey = cy + Math.sin(a) * r * 0.16;
    return <ellipse key={i} cx={ex} cy={ey} rx={r * 0.22} ry={r * 0.16}
      fill={P.p4} opacity={0.85}
      transform={`rotate(${i * 72 + 10} ${ex} ${ey})`}/>;
  });
  return (
    <g opacity={opacity} filter="url(#wc)">
      {glow}{outer}{mid}{inner}
      <circle cx={cx} cy={cy} r={r * 0.12} fill={P.p3} opacity={0.7}/>
    </g>
  );
}

// ── Big Dahlia — deep purple many-petaled flower ──────────────────────────────
function BigDahlia({ cx, cy, r = 44, opacity = 0.88 }) {
  const outer = Array.from({ length: 14 }, (_, i) => {
    const a = (i * (360/14)) * Math.PI / 180;
    const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
    return <ellipse key={`o${i}`} cx={(cx+px)/2} cy={(cy+py)/2}
      rx={r * 0.42} ry={r * 0.20} fill={P.d1} opacity={0.82}
      transform={`rotate(${i*(360/14)} ${(cx+px)/2} ${(cy+py)/2})`}/>;
  });
  const mid = Array.from({ length: 10 }, (_, i) => {
    const a = (i * 36 + 13) * Math.PI / 180;
    const px = cx + Math.cos(a) * r * 0.60, py = cy + Math.sin(a) * r * 0.60;
    return <ellipse key={`m${i}`} cx={(cx+px)/2} cy={(cy+py)/2}
      rx={r * 0.30} ry={r * 0.16} fill={P.d2} opacity={0.88}
      transform={`rotate(${i*36+13} ${(cx+px)/2} ${(cy+py)/2})`}/>;
  });
  const inner = Array.from({ length: 7 }, (_, i) => {
    const a = (i * (360/7) + 6) * Math.PI / 180;
    const px = cx + Math.cos(a) * r * 0.30, py = cy + Math.sin(a) * r * 0.30;
    return <ellipse key={`i${i}`} cx={(cx+px)/2} cy={(cy+py)/2}
      rx={r * 0.20} ry={r * 0.11} fill={P.d3} opacity={0.92}
      transform={`rotate(${i*(360/7)+6} ${(cx+px)/2} ${(cy+py)/2})`}/>;
  });
  return (
    <g opacity={opacity} filter="url(#wc)">
      <circle cx={cx} cy={cy} r={r * 1.1} fill={P.d1} opacity={0.10} filter="url(#soft)"/>
      {outer}{mid}{inner}
      <circle cx={cx} cy={cy} r={r * 0.13} fill={P.d3} opacity={0.95}/>
      <circle cx={cx} cy={cy} r={r * 0.06} fill="#2a0612" opacity={0.8}/>
    </g>
  );
}

// ── MedDahlia — medium purple flower ─────────────────────────────────────────
function MedDahlia({ cx, cy, r = 24, fill = P.d1, fill2 = P.d2, fill3 = P.d3, opacity = 0.86 }) {
  const outer = Array.from({ length: 11 }, (_, i) => {
    const a = (i * (360/11)) * Math.PI / 180;
    const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
    return <ellipse key={`o${i}`} cx={(cx+px)/2} cy={(cy+py)/2}
      rx={r*0.42} ry={r*0.20} fill={fill} opacity={0.82}
      transform={`rotate(${i*(360/11)} ${(cx+px)/2} ${(cy+py)/2})`}/>;
  });
  const inner = Array.from({ length: 6 }, (_, i) => {
    const a = (i*60+15) * Math.PI / 180;
    const px = cx + Math.cos(a)*r*0.45, py = cy + Math.sin(a)*r*0.45;
    return <ellipse key={i} cx={(cx+px)/2} cy={(cy+py)/2}
      rx={r*0.26} ry={r*0.14} fill={fill2} opacity={0.90}
      transform={`rotate(${i*60+15} ${(cx+px)/2} ${(cy+py)/2})`}/>;
  });
  return (
    <g opacity={opacity} filter="url(#wc)">
      {outer}{inner}
      <circle cx={cx} cy={cy} r={r*0.14} fill={fill3} opacity={0.9}/>
    </g>
  );
}

// ── MagentaFlower — bold magenta/pink flower ──────────────────────────────────
function MagentaFlower({ cx, cy, r = 20, opacity = 0.82 }) {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45) * Math.PI / 180;
    const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
    return <ellipse key={i} cx={(cx+px)/2} cy={(cy+py)/2}
      rx={r*0.46} ry={r*0.26} fill={P.m1} opacity={0.78}
      transform={`rotate(${i*45} ${(cx+px)/2} ${(cy+py)/2})`}/>;
  });
  const mid = Array.from({ length: 5 }, (_, i) => {
    const a = (i*72+18) * Math.PI / 180;
    const px = cx + Math.cos(a)*r*0.45, py = cy + Math.sin(a)*r*0.45;
    return <ellipse key={i} cx={(cx+px)/2} cy={(cy+py)/2}
      rx={r*0.30} ry={r*0.18} fill={P.m2} opacity={0.88}
      transform={`rotate(${i*72+18} ${(cx+px)/2} ${(cy+py)/2})`}/>;
  });
  return (
    <g opacity={opacity} filter="url(#wc)">
      <circle cx={cx} cy={cy} r={r*1.1} fill={P.m1} opacity={0.10} filter="url(#soft)"/>
      {petals}{mid}
      <circle cx={cx} cy={cy} r={r*0.18} fill={P.o2} opacity={0.9}/>
    </g>
  );
}

// ── OrangeSprig — branching amber stems ──────────────────────────────────────
function OrangeSprig({ x, y, angle = -90, len = 50, opacity = 0.85, scale = 1.0 }) {
  const l = len * scale;
  const rad = angle * Math.PI / 180;
  const ex = x + Math.cos(rad) * l, ey = y + Math.sin(rad) * l;
  const mx = (x + ex) / 2, my = (y + ey) / 2;
  const b1x = mx + Math.cos(rad - 1.0) * l * 0.45, b1y = my + Math.sin(rad - 1.0) * l * 0.45;
  const b2x = mx + Math.cos(rad + 1.0) * l * 0.45, b2y = my + Math.sin(rad + 1.0) * l * 0.45;
  const b3x = ex + Math.cos(rad - 0.7) * l * 0.30, b3y = ey + Math.sin(rad - 0.7) * l * 0.30;
  const b4x = ex + Math.cos(rad + 0.7) * l * 0.30, b4y = ey + Math.sin(rad + 0.7) * l * 0.30;

  const cluster = (fx, fy, r) => (
    <>
      {Array.from({length: 5}, (_, i) => {
        const a = (i*72)*Math.PI/180;
        return <ellipse key={i}
          cx={fx+Math.cos(a)*r*1.1} cy={fy+Math.sin(a)*r*1.1}
          rx={r*0.52} ry={r*0.34}
          fill={i%2===0 ? P.o1 : P.o2}
          transform={`rotate(${i*72} ${fx+Math.cos(a)*r*1.1} ${fy+Math.sin(a)*r*1.1})`}/>;
      })}
      <circle cx={fx} cy={fy} r={r*0.38} fill={P.o3} opacity={0.95}/>
    </>
  );

  return (
    <g opacity={opacity}>
      <path d={`M${x},${y} C${mx+8},${my-5} ${mx-5},${my+5} ${ex},${ey}`}
        stroke={P.s2} strokeWidth={1.4*scale} fill="none"/>
      <path d={`M${mx},${my} L${b1x},${b1y}`} stroke={P.s3} strokeWidth={1.0*scale} fill="none"/>
      <path d={`M${mx},${my} L${b2x},${b2y}`} stroke={P.s3} strokeWidth={1.0*scale} fill="none"/>
      <path d={`M${ex},${ey} L${b3x},${b3y}`} stroke={P.s3} strokeWidth={0.9*scale} fill="none"/>
      <path d={`M${ex},${ey} L${b4x},${b4y}`} stroke={P.s3} strokeWidth={0.9*scale} fill="none"/>
      {cluster(b1x, b1y, 4*scale)}
      {cluster(b2x, b2y, 3.5*scale)}
      {cluster(b3x, b3y, 3.5*scale)}
      {cluster(b4x, b4y, 3.0*scale)}
      {cluster(ex,  ey,  4.5*scale)}
    </g>
  );
}

// ── LavSprig — lavender spike ─────────────────────────────────────────────────
function LavSprig({ x1, y1, x2, y2, opacity = 0.68 }) {
  const steps = 8;
  return (
    <g opacity={opacity}>
      <path d={`M${x1},${y1} L${x2},${y2}`} stroke={P.lv1} strokeWidth="1.3" fill="none"/>
      {Array.from({length: steps}, (_, i) => {
        const t = i / (steps-1);
        const cx = x1+(x2-x1)*t, cy = y1+(y2-y1)*t;
        const side = i%2===0 ? -5 : 5;
        return <ellipse key={i} cx={cx+side} cy={cy} rx={3.2} ry={6}
          fill={P.lv2} opacity={0.70}
          transform={`rotate(${side>0 ? 20 : -20} ${cx+side} ${cy})`}/>;
      })}
    </g>
  );
}

// ── BigLeaf — large dark sage leaf ────────────────────────────────────────────
function BigLeaf({ x1, y1, x2, y2, w = 12, fill = P.s2, opacity = 0.72 }) {
  const mx = (x1+x2)/2, my = (y1+y2)/2;
  const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy);
  const nx = -dy/len*w, ny = dx/len*w;
  return (
    <g opacity={opacity}>
      <path d={`M${x1},${y1} Q${mx+nx},${my+ny} ${x2},${y2} Q${mx-nx},${my-ny} ${x1},${y1}Z`} fill={fill}/>
      <path d={`M${x1},${y1} Q${mx+(nx*0.3)},${my+(ny*0.3)} ${x2},${y2}`}
        stroke={P.s1} strokeWidth="0.7" fill="none" opacity={0.4}/>
    </g>
  );
}

// ── Left panel ────────────────────────────────────────────────────────────────
export function FloralLeft({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 160 720" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <Defs/>

        {/* Main curved vine */}
        <path d="M82 720 C78 600 62 470 74 350 C86 230 68 130 78 10"
          stroke={P.s2} strokeWidth="1.6" fill="none" opacity="0.38"/>

        {/* ── TOP: Big Peony bleeding off left ── */}
        <BigPeony cx={14} cy={88} r={52} opacity={0.80}/>
        {/* Supporting dahlia top-right */}
        <BigDahlia cx={108} cy={60} r={38} opacity={0.82}/>
        {/* Leaves around top */}
        <BigLeaf x1={68} y1={82} x2={38} y2={62} w={13} fill={P.s1} opacity={0.70}/>
        <BigLeaf x1={95} y1={100} x2={72} y2={122} w={11} fill={P.ol} opacity={0.65}/>
        <BigLeaf x1={128} y1={96} x2={150} y2={78} w={10} fill={P.s3} opacity={0.60}/>
        <BigLeaf x1={138} y1={115} x2={155} y2={138} w={8} fill={P.s2} opacity={0.55}/>

        {/* ── UPPER-MID: Orange sprigs + lavender ── */}
        <OrangeSprig x={72} y={168} angle={-110} len={52} opacity={0.82}/>
        <OrangeSprig x={45} y={210} angle={-70} len={44} opacity={0.76}/>
        <LavSprig x1={130} y1={148} x2={134} y2={210} opacity={0.65}/>
        <BigLeaf x1={60} y1={188} x2={36} y2={172} w={11} fill={P.s2} opacity={0.65}/>
        <BigLeaf x1={102} y1={182} x2={124} y2={165} w={10} fill={P.s1} opacity={0.58}/>

        {/* ── MID: Medium dahlia + peony ── */}
        <MedDahlia cx={58} cy={298} r={28} fill={P.m1} fill2={P.m2} fill3="#8f243f" opacity={0.82}/>
        <BigLeaf x1={38} y1={295} x2={14} y2={278} w={12} fill={P.s1} opacity={0.68}/>
        <BigLeaf x1={80} y1={318} x2={58} y2={342} w={13} fill={P.ol} opacity={0.63}/>
        <BigLeaf x1={92} y1={296} x2={118} y2={280} w={10} fill={P.s3} opacity={0.58}/>
        <OrangeSprig x={108} y={265} angle={-95} len={46} opacity={0.78}/>

        {/* ── LOWER-MID: Blue peony large ── */}
        <BigPeony cx={100} cy={430} r={46} opacity={0.76}/>
        <BigLeaf x1={56} y1={428} x2={28} y2={410} w={13} fill={P.s2} opacity={0.68}/>
        <BigLeaf x1={58} y1={450} x2={38} y2={474} w={12} fill={P.s1} opacity={0.62}/>
        <BigLeaf x1={118} y1={470} x2={140} y2={452} w={11} fill={P.s3} opacity={0.58}/>
        <LavSprig x1={28} y1={395} x2={22} y2={455} opacity={0.60}/>

        {/* ── BOTTOM: Dahlia + leaves ── */}
        <BigDahlia cx={60} cy={570} r={36} opacity={0.78}/>
        <BigLeaf x1={36} y1={568} x2={10} y2={550} w={13} fill={P.s1} opacity={0.68}/>
        <BigLeaf x1={88} y1={564} x2={112} y2={548} w={12} fill={P.s2} opacity={0.62}/>
        <BigLeaf x1={70} y1={604} x2={54} y2={628} w={11} fill={P.ol} opacity={0.58}/>
        <MedDahlia cx={118} cy={640} r={20} fill={P.lv1} fill2={P.lv2} fill3={P.lv1} opacity={0.70}/>
        <OrangeSprig x={42} y={645} angle={-80} len={38} opacity={0.70}/>
        <BigLeaf x1={80} y1={652} x2={66} y2={676} w={9} fill={P.s3} opacity={0.52}/>
      </svg>
    </div>
  );
}

// ── Right panel (mirror) ──────────────────────────────────────────────────────
export function FloralRight({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 160 720" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <Defs/>

        {/* Main vine */}
        <path d="M78 720 C82 600 98 470 86 350 C74 230 92 130 82 10"
          stroke={P.s2} strokeWidth="1.6" fill="none" opacity="0.38"/>

        {/* ── TOP: Big Dahlia bleeding off right ── */}
        <BigDahlia cx={52} cy={60} r={38} opacity={0.82}/>
        <BigPeony cx={146} cy={88} r={52} opacity={0.80}/>
        <BigLeaf x1={92} y1={82} x2={122} y2={62} w={13} fill={P.s1} opacity={0.70}/>
        <BigLeaf x1={65} y1={100} x2={88} y2={122} w={11} fill={P.ol} opacity={0.65}/>
        <BigLeaf x1={32} y1={96} x2={10} y2={78} w={10} fill={P.s3} opacity={0.60}/>
        <BigLeaf x1={22} y1={115} x2={5} y2={138} w={8} fill={P.s2} opacity={0.55}/>

        {/* ── UPPER-MID ── */}
        <OrangeSprig x={88} y={168} angle={-70} len={52} opacity={0.82}/>
        <OrangeSprig x={115} y={210} angle={-110} len={44} opacity={0.76}/>
        <LavSprig x1={30} y1={148} x2={26} y2={210} opacity={0.65}/>
        <BigLeaf x1={100} y1={188} x2={124} y2={172} w={11} fill={P.s2} opacity={0.65}/>
        <BigLeaf x1={58} y1={182} x2={36} y2={165} w={10} fill={P.s1} opacity={0.58}/>

        {/* ── MID ── */}
        <MedDahlia cx={102} cy={298} r={28} fill={P.m1} fill2={P.m2} fill3="#8f243f" opacity={0.82}/>
        <BigLeaf x1={122} y1={295} x2={146} y2={278} w={12} fill={P.s1} opacity={0.68}/>
        <BigLeaf x1={80} y1={318} x2={102} y2={342} w={13} fill={P.ol} opacity={0.63}/>
        <BigLeaf x1={68} y1={296} x2={42} y2={280} w={10} fill={P.s3} opacity={0.58}/>
        <OrangeSprig x={52} y={265} angle={-85} len={46} opacity={0.78}/>

        {/* ── LOWER-MID ── */}
        <BigPeony cx={60} cy={430} r={46} opacity={0.76}/>
        <BigLeaf x1={104} y1={428} x2={132} y2={410} w={13} fill={P.s2} opacity={0.68}/>
        <BigLeaf x1={102} y1={450} x2={122} y2={474} w={12} fill={P.s1} opacity={0.62}/>
        <BigLeaf x1={42} y1={470} x2={20} y2={452} w={11} fill={P.s3} opacity={0.58}/>
        <LavSprig x1={132} y1={395} x2={138} y2={455} opacity={0.60}/>

        {/* ── BOTTOM ── */}
        <BigDahlia cx={100} cy={570} r={36} opacity={0.78}/>
        <BigLeaf x1={124} y1={568} x2={150} y2={550} w={13} fill={P.s1} opacity={0.68}/>
        <BigLeaf x1={72} y1={564} x2={48} y2={548} w={12} fill={P.s2} opacity={0.62}/>
        <BigLeaf x1={90} y1={604} x2={106} y2={628} w={11} fill={P.ol} opacity={0.58}/>
        <MedDahlia cx={42} cy={640} r={20} fill={P.lv1} fill2={P.lv2} fill3={P.lv1} opacity={0.70}/>
        <OrangeSprig x={118} y={645} angle={-100} len={38} opacity={0.70}/>
        <BigLeaf x1={80} y1={652} x2={94} y2={676} w={9} fill={P.s3} opacity={0.52}/>
      </svg>
    </div>
  );
}

// ── Top banner ────────────────────────────────────────────────────────────────
export function FloralTopBanner({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none w-full overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1440 215" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
        <Defs/>

        {/* Vines */}
        <path d="M0 195 C100 155 220 112 360 90 C480 68 590 52 700 60"
          stroke={P.s2} strokeWidth="1.5" fill="none" opacity="0.38"/>
        <path d="M1440 195 C1340 155 1220 112 1080 90 C960 68 850 52 740 60"
          stroke={P.s2} strokeWidth="1.5" fill="none" opacity="0.38"/>

        {/* ── Left: Big Dahlia ── */}
        <BigDahlia cx={88} cy={112} r={36} opacity={0.82}/>
        <BigLeaf x1={52} y1={104} x2={18} y2={84} w={13} fill={P.s1} opacity={0.68}/>
        <BigLeaf x1={120} y1={98} x2={150} y2={76} w={12} fill={P.s2} opacity={0.62}/>
        <BigLeaf x1={80} y1={146} x2={62} y2={172} w={10} fill={P.ol} opacity={0.58}/>

        {/* Left Peony */}
        <BigPeony cx={218} cy={78} r={28} opacity={0.74}/>
        <BigLeaf x1={195} y1={75} x2={170} y2={58} w={10} fill={P.s2} opacity={0.60}/>
        <BigLeaf x1={242} y1={72} x2={268} y2={56} w={10} fill={P.s3} opacity={0.55}/>

        {/* Left orange + lavender */}
        <OrangeSprig x={168} y={135} angle={-55} len={48} opacity={0.80} scale={1.1}/>
        <LavSprig x1={322} y1={14} x2={316} y2={80} opacity={0.64}/>
        <MedDahlia cx={370} cy={80} r={14} fill={P.lv1} fill2={P.lv2} fill3={P.lv1} opacity={0.72}/>
        <BigLeaf x1={400} y1={72} x2={432} y2={54} w={9} fill={P.s2} opacity={0.52}/>
        <OrangeSprig x={448} y={78} angle={-72} len={36} opacity={0.72}/>

        {/* Left magenta */}
        <MagentaFlower cx={142} cy={162} r={18} opacity={0.72}/>
        <MagentaFlower cx={268} cy={138} r={14} opacity={0.68}/>

        {/* ── Centre ── */}
        <BigDahlia cx={720} cy={50} r={22} opacity={0.74}/>
        <BigLeaf x1={698} y1={46} x2={672} y2={28} w={8} fill={P.s2} opacity={0.55}/>
        <BigLeaf x1={742} y1={46} x2={768} y2={28} w={8} fill={P.s1} opacity={0.55}/>
        <OrangeSprig x={692} y={70} angle={-62} len={30} opacity={0.68}/>

        {/* ── Right (mirror) ── */}
        <OrangeSprig x={992} y={78} angle={-108} len={36} opacity={0.72}/>
        <BigLeaf x1={1040} y1={72} x2={1008} y2={54} w={9} fill={P.s2} opacity={0.52}/>
        <MedDahlia cx={1070} cy={80} r={14} fill={P.lv1} fill2={P.lv2} fill3={P.lv1} opacity={0.72}/>
        <LavSprig x1={1118} y1={14} x2={1124} y2={80} opacity={0.64}/>
        <OrangeSprig x={1272} y={135} angle={-125} len={48} opacity={0.80} scale={1.1}/>
        <BigLeaf x1={1198} y1={72} x2={1172} y2={56} w={10} fill={P.s3} opacity={0.55}/>
        <BigLeaf x1={1222} y1={75} x2={1248} y2={58} w={10} fill={P.s2} opacity={0.60}/>
        <BigPeony cx={1222} cy={78} r={28} opacity={0.74}/>
        <BigDahlia cx={1352} cy={112} r={36} opacity={0.82}/>
        <BigLeaf x1={1388} y1={104} x2={1422} y2={84} w={13} fill={P.s1} opacity={0.68}/>
        <BigLeaf x1={1320} y1={98} x2={1290} y2={76} w={12} fill={P.s2} opacity={0.62}/>
        <BigLeaf x1={1360} y1={146} x2={1378} y2={172} w={10} fill={P.ol} opacity={0.58}/>
        <MagentaFlower cx={1298} cy={162} r={18} opacity={0.72}/>
        <MagentaFlower cx={1172} cy={138} r={14} opacity={0.68}/>
      </svg>
    </div>
  );
}

// ── Small sprig divider ───────────────────────────────────────────────────────
export function FloralSprig({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none inline-block ${className}`} aria-hidden="true">
      <svg viewBox="0 0 140 58" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-14">
        <Defs/>
        <path d="M10 46 C42 30 80 22 130 34" stroke={P.s2} strokeWidth="1.3" fill="none" opacity="0.52"/>
        <MedDahlia cx={70} cy={25} r={11} fill={P.d1} fill2={P.d2} fill3={P.d3} opacity={0.82}/>
        {/* Side small flowers */}
        {Array.from({length: 5}, (_, i) => {
          const a = (i*72-90)*Math.PI/180;
          const px = 32+Math.cos(a)*8, py = 36+Math.sin(a)*8;
          return <ellipse key={i} cx={(32+px)/2} cy={(36+py)/2} rx={4.5} ry={2.8}
            fill={P.bl} opacity={0.78}
            transform={`rotate(${i*72-90} ${(32+px)/2} ${(36+py)/2})`}/>;
        })}
        <circle cx={32} cy={36} r={2.8} fill={P.o3} opacity={0.88}/>
        {Array.from({length: 5}, (_, i) => {
          const a = (i*72-90)*Math.PI/180;
          const px = 108+Math.cos(a)*7, py = 34+Math.sin(a)*7;
          return <ellipse key={i} cx={(108+px)/2} cy={(34+py)/2} rx={4} ry={2.5}
            fill={P.bl2} opacity={0.75}
            transform={`rotate(${i*72-90} ${(108+px)/2} ${(34+py)/2})`}/>;
        })}
        <circle cx={108} cy={34} r={2.5} fill={P.o2} opacity={0.85}/>
        <BigLeaf x1={52} y1={28} x2={34} y2={18} w={5.5} fill={P.s2} opacity={0.58}/>
        <BigLeaf x1={88} y1={26} x2={106} y2={16} w={5.5} fill={P.s1} opacity={0.55}/>
      </svg>
    </div>
  );
}
