// Botanical floral decorations — watercolor-style matching the welcome video palette
// Colors: deep purple dahlias, slate-blue peonies, orange/amber sprigs, sage-green leaves

// ── Palette ──────────────────────────────────────────────────────────────────
const P = {
  dahlia1:  '#7b4fc0', dahlia2:  '#9b6fd8', dahlia3:  '#5a3092',
  peony1:   '#8090c8', peony2:   '#a8b8e2', peony3:   '#5a6898',
  orange1:  '#c87818', orange2:  '#e09828', orange3:  '#f0b840',
  magenta1: '#b83880', magenta2: '#d858a8',
  sage1:    '#4e6e48', sage2:    '#6a8862', sage3:    '#8aaa7a',
  olive:    '#5a6e38', lavender: '#a090cc', lavLight: '#c4b8e4',
  blush:    '#f0c8dc', blush2:   '#e8b0cc',
};

// ── Dahlia — many-petaled deep purple flower ──────────────────────────────────
function Dahlia({ cx, cy, r = 22, opacity = 0.88 }) {
  const outer = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30) * Math.PI / 180;
    const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
    return <ellipse key={`o${i}`} cx={(cx+px)/2} cy={(cy+py)/2}
      rx={r*0.44} ry={r*0.22} fill={P.dahlia1} opacity={0.82}
      transform={`rotate(${i*30} ${(cx+px)/2} ${(cy+py)/2})`} />;
  });
  const mid = Array.from({ length: 9 }, (_, i) => {
    const a = (i*40 + 18) * Math.PI / 180;
    const px = cx + Math.cos(a)*r*0.6, py = cy + Math.sin(a)*r*0.6;
    return <ellipse key={`m${i}`} cx={(cx+px)/2} cy={(cy+py)/2}
      rx={r*0.32} ry={r*0.17} fill={P.dahlia2} opacity={0.9}
      transform={`rotate(${i*40+18} ${(cx+px)/2} ${(cy+py)/2})`} />;
  });
  const inner = Array.from({ length: 6 }, (_, i) => {
    const a = (i*60 + 8) * Math.PI / 180;
    const px = cx + Math.cos(a)*r*0.3, py = cy + Math.sin(a)*r*0.3;
    return <ellipse key={`i${i}`} cx={(cx+px)/2} cy={(cy+py)/2}
      rx={r*0.2} ry={r*0.12} fill={P.dahlia3} opacity={0.95}
      transform={`rotate(${i*60+8} ${(cx+px)/2} ${(cy+py)/2})`} />;
  });
  return (
    <g opacity={opacity}>
      {/* Soft glow */}
      <circle cx={cx} cy={cy} r={r*1.1} fill={P.dahlia1} opacity={0.08}/>
      {outer}{mid}{inner}
      <circle cx={cx} cy={cy} r={r*0.14} fill={P.dahlia3} opacity={0.95}/>
      <circle cx={cx} cy={cy} r={r*0.07} fill="#2a1040" opacity={0.7}/>
    </g>
  );
}

// ── Peony — large loose blue-purple flower ────────────────────────────────────
function Peony({ cx, cy, r = 28, opacity = 0.78 }) {
  const outer = Array.from({ length: 7 }, (_, i) => {
    const a = (i*(360/7)) * Math.PI / 180;
    const ex = cx + Math.cos(a)*r*0.65, ey = cy + Math.sin(a)*r*0.65;
    return <ellipse key={i} cx={ex} cy={ey} rx={r*0.5} ry={r*0.32}
      fill={P.peony1} opacity={0.68}
      transform={`rotate(${i*(360/7)} ${ex} ${ey})`}/>;
  });
  const inner = Array.from({ length: 5 }, (_, i) => {
    const a = (i*72 + 26) * Math.PI / 180;
    const px = cx + Math.cos(a)*r*0.38, py = cy + Math.sin(a)*r*0.38;
    return <ellipse key={i} cx={(cx+px)/2} cy={(cy+py)/2}
      rx={r*0.36} ry={r*0.24} fill={P.peony2} opacity={0.8}
      transform={`rotate(${i*72+26} ${(cx+px)/2} ${(cy+py)/2})`}/>;
  });
  return (
    <g opacity={opacity}>
      <circle cx={cx} cy={cy} r={r*1.05} fill={P.peony1} opacity={0.07}/>
      {outer}{inner}
      <circle cx={cx} cy={cy} r={r*0.18} fill={P.peony3} opacity={0.85}/>
    </g>
  );
}

// ── SmallDahlia — compact version ─────────────────────────────────────────────
function SmallDahlia({ cx, cy, r = 13, fill = P.dahlia1, fill2 = P.dahlia2, opacity = 0.85 }) {
  const petals = Array.from({ length: 9 }, (_, i) => {
    const a = (i*40) * Math.PI / 180;
    const px = cx + Math.cos(a)*r, py = cy + Math.sin(a)*r;
    return <ellipse key={i} cx={(cx+px)/2} cy={(cy+py)/2}
      rx={r*0.42} ry={r*0.22} fill={fill} opacity={0.85}
      transform={`rotate(${i*40} ${(cx+px)/2} ${(cy+py)/2})`}/>;
  });
  const inner = Array.from({ length: 5 }, (_, i) => {
    const a = (i*72+20) * Math.PI / 180;
    const px = cx + Math.cos(a)*r*0.45, py = cy + Math.sin(a)*r*0.45;
    return <ellipse key={i} cx={(cx+px)/2} cy={(cy+py)/2}
      rx={r*0.26} ry={r*0.15} fill={fill2} opacity={0.92}
      transform={`rotate(${i*72+20} ${(cx+px)/2} ${(cy+py)/2})`}/>;
  });
  return <g opacity={opacity}>{petals}{inner}<circle cx={cx} cy={cy} r={r*0.15} fill="#2a1040" opacity={0.7}/></g>;
}

// ── MagentaFlower — small magenta/pink flower ─────────────────────────────────
function MagentaFlower({ cx, cy, r = 10, opacity = 0.82 }) {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const a = (i*60) * Math.PI / 180;
    const px = cx + Math.cos(a)*r, py = cy + Math.sin(a)*r;
    return <ellipse key={i} cx={(cx+px)/2} cy={(cy+py)/2}
      rx={r*0.44} ry={r*0.26} fill={P.magenta1} opacity={0.8}
      transform={`rotate(${i*60} ${(cx+px)/2} ${(cy+py)/2})`}/>;
  });
  return <g opacity={opacity}>{petals}<circle cx={cx} cy={cy} r={r*0.22} fill={P.orange2} opacity={0.9}/></g>;
}

// ── OrangeSprig — branching stem with amber dot-flowers ───────────────────────
function OrangeSprig({ x, y, angle = 0, len = 40, opacity = 0.85 }) {
  const rad = angle * Math.PI / 180;
  const ex = x + Math.cos(rad)*len, ey = y + Math.sin(rad)*len;
  const mx = (x+ex)/2, my = (y+ey)/2;
  // Branch left and right
  const b1x = mx + Math.cos(rad - 1.1)*len*0.42, b1y = my + Math.sin(rad - 1.1)*len*0.42;
  const b2x = mx + Math.cos(rad + 1.1)*len*0.42, b2y = my + Math.sin(rad + 1.1)*len*0.42;
  const b3x = ex + Math.cos(rad - 0.7)*len*0.28, b3y = ey + Math.sin(rad - 0.7)*len*0.28;
  const b4x = ex + Math.cos(rad + 0.7)*len*0.28, b4y = ey + Math.sin(rad + 0.7)*len*0.28;

  const flower = (fx, fy, r, f) => Array.from({ length: 5 }, (_, i) => {
    const a = (i*72) * Math.PI / 180;
    return <ellipse key={i} cx={fx+Math.cos(a)*r*0.9} cy={fy+Math.sin(a)*r*0.9}
      rx={r*0.5} ry={r*0.32} fill={f}
      transform={`rotate(${i*72} ${fx+Math.cos(a)*r*0.9} ${fy+Math.sin(a)*r*0.9})`}/>;
  });

  return (
    <g opacity={opacity}>
      <path d={`M${x},${y} Q${mx},${my} ${ex},${ey}`} stroke={P.sage1} strokeWidth="1.2" fill="none"/>
      <path d={`M${mx},${my} L${b1x},${b1y}`} stroke={P.sage2} strokeWidth="0.9" fill="none"/>
      <path d={`M${mx},${my} L${b2x},${b2y}`} stroke={P.sage2} strokeWidth="0.9" fill="none"/>
      <path d={`M${ex},${ey} L${b3x},${b3y}`} stroke={P.sage2} strokeWidth="0.8" fill="none"/>
      <path d={`M${ex},${ey} L${b4x},${b4y}`} stroke={P.sage2} strokeWidth="0.8" fill="none"/>
      {/* Dot clusters */}
      {[
        [b1x, b1y, 3.5, P.orange1], [b2x, b2y, 3, P.orange2],
        [b3x, b3y, 3, P.orange3],   [b4x, b4y, 2.5, P.orange2],
        [ex,  ey,  4,  P.orange1],
      ].map(([fx, fy, r, f], k) => (
        <g key={k}>
          {flower(fx, fy, r, f)}
          <circle cx={fx} cy={fy} r={r*0.35} fill={P.orange3} opacity={0.9}/>
        </g>
      ))}
    </g>
  );
}

// ── LavenderSprig — tall lavender spike ───────────────────────────────────────
function LavenderSprig({ x1, y1, x2, y2, opacity = 0.7 }) {
  const steps = 7;
  return (
    <g opacity={opacity}>
      <path d={`M${x1},${y1} L${x2},${y2}`} stroke={P.lavender} strokeWidth="1.2" fill="none"/>
      {Array.from({ length: steps }, (_, i) => {
        const t = i / (steps - 1);
        const cx = x1 + (x2-x1)*t, cy = y1 + (y2-y1)*t;
        const side = i % 2 === 0 ? -4 : 4;
        return (
          <ellipse key={i} cx={cx+side} cy={cy} rx={2.8} ry={5}
            fill={P.lavender} opacity={0.72}
            transform={`rotate(${side > 0 ? 18 : -18} ${cx+side} ${cy})`}/>
        );
      })}
    </g>
  );
}

// ── BotLeaf — large botanical leaf ────────────────────────────────────────────
function BotLeaf({ x1, y1, x2, y2, width = 9, fill = P.sage2, opacity = 0.68 }) {
  const mx = (x1+x2)/2, my = (y1+y2)/2;
  const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy);
  const nx = -dy/len*width, ny = dx/len*width;
  return (
    <g opacity={opacity}>
      <path d={`M${x1},${y1} Q${mx+nx},${my+ny} ${x2},${y2} Q${mx-nx},${my-ny} ${x1},${y1}Z`} fill={fill}/>
      <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} stroke={fill} strokeWidth="0.6"
        fill="none" opacity={0.5}/>
    </g>
  );
}

// ── SmallBlossom — 5-petal soft pink flower ───────────────────────────────────
function SmallBlossom({ cx, cy, r = 8, fill = P.blush, opacity = 0.82 }) {
  return (
    <g opacity={opacity}>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i*72 - 90) * Math.PI / 180;
        const px = cx + Math.cos(a)*r, py = cy + Math.sin(a)*r;
        return <ellipse key={i} cx={(cx+px)/2} cy={(cy+py)/2}
          rx={r*0.46} ry={r*0.3} fill={fill}
          transform={`rotate(${i*72-90} ${(cx+px)/2} ${(cy+py)/2})`}/>;
      })}
      <circle cx={cx} cy={cy} r={r*0.22} fill={P.orange3} opacity={0.9}/>
    </g>
  );
}

// ── Left side panel ───────────────────────────────────────────────────────────
export function FloralLeft({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 160 720" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">

        {/* Main curved stem */}
        <path d="M78 710 C74 600 60 480 70 360 C80 240 65 140 76 20"
          stroke={P.sage1} strokeWidth="1.8" fill="none" opacity="0.45"/>

        {/* ── Top cluster ── */}
        <Dahlia cx={76} cy={72} r={26} opacity={0.85}/>
        <BotLeaf x1={52} y1={68} x2={28} y2={50} width={10} fill={P.sage1} opacity={0.65}/>
        <BotLeaf x1={102} y1={65} x2={126} y2={48} width={10} fill={P.sage2} opacity={0.58}/>
        <BotLeaf x1={70} y1={94} x2={55} y2={115} width={8} fill={P.olive} opacity={0.55}/>
        <SmallBlossom cx={118} cy={108} r={9} fill={P.blush} opacity={0.78}/>
        <SmallBlossom cx={132} cy={124} r={7} fill={P.blush2} opacity={0.72}/>

        {/* ── Upper-mid: Peony + orange sprigs ── */}
        <Peony cx={70} cy={220} r={24} opacity={0.78}/>
        <BotLeaf x1={46} y1={218} x2={24} y2={202} width={9} fill={P.sage2} opacity={0.62}/>
        <BotLeaf x1={94} y1={215} x2={118} y2={200} width={9} fill={P.sage3} opacity={0.55}/>
        <OrangeSprig x={55} y={175} angle={-100} len={38} opacity={0.82}/>
        <LavenderSprig x1={30} y1={155} x2={26} y2={205} opacity={0.65}/>

        {/* ── Mid: small dahlia + leaves ── */}
        <SmallDahlia cx={68} cy={320} r={15} fill={P.magenta1} fill2={P.magenta2} opacity={0.82}/>
        <BotLeaf x1={58} y1={340} x2={38} y2={358} width={11} fill={P.sage1} opacity={0.62}/>
        <BotLeaf x1={82} y1={338} x2={104} y2={354} width={10} fill={P.sage2} opacity={0.56}/>
        <OrangeSprig x={48} y={290} angle={-80} len={34} opacity={0.78}/>
        <SmallBlossom cx={28} cy={362} r={8} fill={P.blush} opacity={0.72}/>

        {/* Branch stem mid */}
        <path d="M70 360 C52 348 36 340 26 322" stroke={P.sage1} strokeWidth="1.1" fill="none" opacity="0.4"/>

        {/* ── Lower-mid ── */}
        <Dahlia cx={72} cy={460} r={20} opacity={0.80}/>
        <BotLeaf x1={52} y1={458} x2={30} y2={442} width={9} fill={P.olive} opacity={0.6}/>
        <BotLeaf x1={92} y1={455} x2={114} y2={440} width={9} fill={P.sage3} opacity={0.55}/>
        <OrangeSprig x={38} y={430} angle={-95} len={36} opacity={0.75}/>
        <LavenderSprig x1={118} y1={490} x2={122} y2={540} opacity={0.6}/>

        {/* ── Bottom cluster ── */}
        <Peony cx={68} cy={570} r={18} opacity={0.70}/>
        <BotLeaf x1={48} y1={568} x2={28} y2={555} width={8} fill={P.sage2} opacity={0.58}/>
        <BotLeaf x1={88} y1={565} x2={108} y2={552} width={8} fill={P.sage1} opacity={0.52}/>
        <SmallDahlia cx={108} cy={620} r={11} fill={P.lavender} fill2={P.lavLight} opacity={0.72}/>
        <BotLeaf x1={74} y1={600} x2={60} y2={625} width={9} fill={P.olive} opacity={0.5}/>
        <BotLeaf x1={80} y1={635} x2={68} y2={658} width={7} fill={P.sage2} opacity={0.45}/>
        <SmallBlossom cx={40} cy={658} r={7} fill={P.blush} opacity={0.65}/>
        <OrangeSprig x={55} y={660} angle={-70} len={28} opacity={0.65}/>
      </svg>
    </div>
  );
}

// ── Right side panel (mirror) ─────────────────────────────────────────────────
export function FloralRight({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 160 720" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">

        {/* Main curved stem */}
        <path d="M82 710 C86 600 100 480 90 360 C80 240 95 140 84 20"
          stroke={P.sage1} strokeWidth="1.8" fill="none" opacity="0.45"/>

        {/* ── Top cluster ── */}
        <Dahlia cx={84} cy={72} r={26} opacity={0.85}/>
        <BotLeaf x1={108} y1={68} x2={132} y2={50} width={10} fill={P.sage1} opacity={0.65}/>
        <BotLeaf x1={58} y1={65} x2={34} y2={48} width={10} fill={P.sage2} opacity={0.58}/>
        <BotLeaf x1={90} y1={94} x2={105} y2={115} width={8} fill={P.olive} opacity={0.55}/>
        <SmallBlossom cx={42} cy={108} r={9} fill={P.blush} opacity={0.78}/>
        <SmallBlossom cx={28} cy={124} r={7} fill={P.blush2} opacity={0.72}/>

        {/* ── Upper-mid ── */}
        <Peony cx={90} cy={220} r={24} opacity={0.78}/>
        <BotLeaf x1={114} y1={218} x2={136} y2={202} width={9} fill={P.sage2} opacity={0.62}/>
        <BotLeaf x1={66} y1={215} x2={42} y2={200} width={9} fill={P.sage3} opacity={0.55}/>
        <OrangeSprig x={105} y={175} angle={-80} len={38} opacity={0.82}/>
        <LavenderSprig x1={130} y1={155} x2={134} y2={205} opacity={0.65}/>

        {/* ── Mid ── */}
        <SmallDahlia cx={92} cy={320} r={15} fill={P.magenta1} fill2={P.magenta2} opacity={0.82}/>
        <BotLeaf x1={102} y1={340} x2={122} y2={358} width={11} fill={P.sage1} opacity={0.62}/>
        <BotLeaf x1={78} y1={338} x2={56} y2={354} width={10} fill={P.sage2} opacity={0.56}/>
        <OrangeSprig x={112} y={290} angle={-100} len={34} opacity={0.78}/>
        <SmallBlossom cx={132} cy={362} r={8} fill={P.blush} opacity={0.72}/>
        <path d="M90 360 C108 348 124 340 134 322" stroke={P.sage1} strokeWidth="1.1" fill="none" opacity="0.4"/>

        {/* ── Lower-mid ── */}
        <Dahlia cx={88} cy={460} r={20} opacity={0.80}/>
        <BotLeaf x1={108} y1={458} x2={130} y2={442} width={9} fill={P.olive} opacity={0.6}/>
        <BotLeaf x1={68} y1={455} x2={46} y2={440} width={9} fill={P.sage3} opacity={0.55}/>
        <OrangeSprig x={122} y={430} angle={-85} len={36} opacity={0.75}/>
        <LavenderSprig x1={42} y1={490} x2={38} y2={540} opacity={0.6}/>

        {/* ── Bottom ── */}
        <Peony cx={92} cy={570} r={18} opacity={0.70}/>
        <BotLeaf x1={112} y1={568} x2={132} y2={555} width={8} fill={P.sage2} opacity={0.58}/>
        <BotLeaf x1={72} y1={565} x2={52} y2={552} width={8} fill={P.sage1} opacity={0.52}/>
        <SmallDahlia cx={52} cy={620} r={11} fill={P.lavender} fill2={P.lavLight} opacity={0.72}/>
        <BotLeaf x1={86} y1={600} x2={100} y2={625} width={9} fill={P.olive} opacity={0.5}/>
        <BotLeaf x1={80} y1={635} x2={92} y2={658} width={7} fill={P.sage2} opacity={0.45}/>
        <SmallBlossom cx={120} cy={658} r={7} fill={P.blush} opacity={0.65}/>
        <OrangeSprig x={105} y={660} angle={-110} len={28} opacity={0.65}/>
      </svg>
    </div>
  );
}

// ── Top banner ────────────────────────────────────────────────────────────────
export function FloralTopBanner({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none w-full overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1440 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">

        {/* Vine lines */}
        <path d="M0 185 C90 150 190 110 310 88 C430 66 530 48 640 56"
          stroke={P.sage1} strokeWidth="1.5" fill="none" opacity="0.4"/>
        <path d="M1440 185 C1350 150 1250 110 1130 88 C1010 66 910 48 800 56"
          stroke={P.sage1} strokeWidth="1.5" fill="none" opacity="0.4"/>

        {/* ── Left large Dahlia ── */}
        <Dahlia cx={85} cy={108} r={32} opacity={0.82}/>
        <BotLeaf x1={52} y1={100} x2={18} y2={82} width={12} fill={P.sage1} opacity={0.62}/>
        <BotLeaf x1={116} y1={94} x2={144} y2={74} width={12} fill={P.sage2} opacity={0.56}/>
        <BotLeaf x1={78} y1={138} x2={62} y2={165} width={9} fill={P.olive} opacity={0.52}/>

        {/* Left Peony */}
        <Peony cx={205} cy={75} r={22} opacity={0.72}/>
        <BotLeaf x1={185} y1={72} x2={164} y2={58} width={9} fill={P.sage2} opacity={0.58}/>
        <BotLeaf x1={225} y1={70} x2={246} y2={56} width={9} fill={P.sage3} opacity={0.52}/>

        {/* Left orange sprigs */}
        <OrangeSprig x={155} y={130} angle={-55} len={44} opacity={0.80}/>
        <OrangeSprig x={268} y={88} angle={-70} len={36} opacity={0.75}/>

        {/* Left lavender */}
        <LavenderSprig x1={320} y1={12} x2={315} y2={72} opacity={0.62}/>

        {/* Left small flowers */}
        <SmallBlossom cx={362} cy={72} r={9} fill={P.blush} opacity={0.72}/>
        <SmallDahlia cx={400} cy={78} r={11} fill={P.lavender} fill2={P.lavLight} opacity={0.70}/>
        <BotLeaf x1={430} y1={70} x2={460} y2={54} width={8} fill={P.sage2} opacity={0.5}/>
        <SmallBlossom cx={470} cy={68} r={7} fill={P.blush2} opacity={0.65}/>

        {/* Left magenta accent */}
        <MagentaFlower cx={138} cy={152} r={11} opacity={0.75}/>
        <MagentaFlower cx={248} cy={132} r={9} opacity={0.70}/>

        {/* ── Center accent ── */}
        <Dahlia cx={720} cy={48} r={18} opacity={0.72}/>
        <SmallBlossom cx={752} cy={74} r={8} fill={P.blush} opacity={0.65}/>
        <SmallBlossom cx={688} cy={74} r={8} fill={P.blush} opacity={0.65}/>
        <BotLeaf x1={700} y1={44} x2={678} y2={28} width={7} fill={P.sage2} opacity={0.52}/>
        <BotLeaf x1={740} y1={44} x2={762} y2={28} width={7} fill={P.sage1} opacity={0.52}/>
        <OrangeSprig x={690} y={70} angle={-60} len={28} opacity={0.68}/>

        {/* ── Right side (mirror) ── */}
        <SmallBlossom cx={978} cy={68} r={7} fill={P.blush2} opacity={0.65}/>
        <BotLeaf x1={1010} y1={70} x2={980} y2={54} width={8} fill={P.sage2} opacity={0.5}/>
        <SmallDahlia cx={1040} cy={78} r={11} fill={P.lavender} fill2={P.lavLight} opacity={0.70}/>
        <SmallBlossom cx={1078} cy={72} r={9} fill={P.blush} opacity={0.72}/>
        <LavenderSprig x1={1120} y1={12} x2={1125} y2={72} opacity={0.62}/>
        <OrangeSprig x={1172} y={88} angle={-110} len={36} opacity={0.75}/>
        <OrangeSprig x={1285} y={130} angle={-125} len={44} opacity={0.80}/>

        {/* Right Peony */}
        <Peony cx={1235} cy={75} r={22} opacity={0.72}/>
        <BotLeaf x1={1215} y1={72} x2={1194} y2={58} width={9} fill={P.sage3} opacity={0.52}/>
        <BotLeaf x1={1255} y1={70} x2={1276} y2={56} width={9} fill={P.sage2} opacity={0.58}/>

        {/* Right large Dahlia */}
        <Dahlia cx={1355} cy={108} r={32} opacity={0.82}/>
        <BotLeaf x1={1388} y1={100} x2={1422} y2={82} width={12} fill={P.sage1} opacity={0.62}/>
        <BotLeaf x1={1324} y1={94} x2={1296} y2={74} width={12} fill={P.sage2} opacity={0.56}/>
        <BotLeaf x1={1362} y1={138} x2={1378} y2={165} width={9} fill={P.olive} opacity={0.52}/>

        {/* Right magenta accents */}
        <MagentaFlower cx={1302} cy={152} r={11} opacity={0.75}/>
        <MagentaFlower cx={1192} cy={132} r={9} opacity={0.70}/>
      </svg>
    </div>
  );
}

// ── Small sprig divider ───────────────────────────────────────────────────────
export function FloralSprig({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none inline-block ${className}`} aria-hidden="true">
      <svg viewBox="0 0 140 58" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-14">
        {/* Curved stem */}
        <path d="M12 46 C42 30 78 22 128 34" stroke={P.sage1} strokeWidth="1.3" fill="none" opacity="0.55"/>
        {/* Center small dahlia */}
        <SmallDahlia cx={70} cy={26} r={12} fill={P.dahlia1} fill2={P.dahlia2} opacity={0.82}/>
        {/* Side blossoms */}
        <SmallBlossom cx={32} cy={37} r={8} fill={P.blush} opacity={0.75}/>
        <SmallBlossom cx={108} cy={35} r={7} fill={P.blush2} opacity={0.72}/>
        {/* Leaves */}
        <BotLeaf x1={52} y1={30} x2={34} y2={20} width={6} fill={P.sage2} opacity={0.58}/>
        <BotLeaf x1={88} y1={28} x2={106} y2={18} width={6} fill={P.sage1} opacity={0.55}/>
        <BotLeaf x1={18} y1={44} x2={8} y2={32} width={5} fill={P.olive} opacity={0.5}/>
        <BotLeaf x1={120} y1={42} x2={132} y2={30} width={5} fill={P.sage2} opacity={0.48}/>
        {/* Orange accent dots */}
        <circle cx={22} cy={48} r={2.5} fill={P.orange2} opacity={0.7}/>
        <circle cx={118} cy={46} r={2} fill={P.orange2} opacity={0.65}/>
      </svg>
    </div>
  );
}
