// Botanical floral decorations — proper flower shapes in mauve/pink/sage palette

// ── Reusable micro shapes ─────────────────────────────────────────────────────

// A 5-petal flower at cx,cy with given radius and color
function Flower5({ cx, cy, r = 10, fill = '#d4b8d4', centerFill = '#f0d8b0', opacity = 0.85 }) {
  const petals = Array.from({ length: 5 }, (_, i) => {
    const angle = (i * 72 - 90) * (Math.PI / 180);
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    return (
      <ellipse
        key={i}
        cx={(cx + px) / 2}
        cy={(cy + py) / 2}
        rx={r * 0.52}
        ry={r * 0.28}
        fill={fill}
        opacity={opacity}
        transform={`rotate(${i * 72 - 90} ${(cx + px) / 2} ${(cy + py) / 2})`}
      />
    );
  });
  return (
    <g>
      {petals}
      <circle cx={cx} cy={cy} r={r * 0.28} fill={centerFill} opacity={0.95} />
      <circle cx={cx} cy={cy} r={r * 0.12} fill="#c8965a" opacity={0.7} />
    </g>
  );
}

// A rose-like layered flower
function Rose({ cx, cy, r = 14, fill = '#cfaecf', fill2 = '#b894b8', opacity = 0.8 }) {
  return (
    <g opacity={opacity}>
      {/* Outer petals */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i * 60) * Math.PI / 180;
        return (
          <ellipse key={i}
            cx={cx + Math.cos(a) * r * 0.65}
            cy={cy + Math.sin(a) * r * 0.65}
            rx={r * 0.48} ry={r * 0.26}
            fill={fill}
            transform={`rotate(${i * 60} ${cx + Math.cos(a) * r * 0.65} ${cy + Math.sin(a) * r * 0.65})`}
          />
        );
      })}
      {/* Inner petals */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i * 72 + 20) * Math.PI / 180;
        return (
          <ellipse key={i}
            cx={cx + Math.cos(a) * r * 0.35}
            cy={cy + Math.sin(a) * r * 0.35}
            rx={r * 0.32} ry={r * 0.18}
            fill={fill2}
            transform={`rotate(${i * 72 + 20} ${cx + Math.cos(a) * r * 0.35} ${cy + Math.sin(a) * r * 0.35})`}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.18} fill={fill2} opacity={0.9} />
    </g>
  );
}

// Cherry blossom — 5 heart-shaped petals
function Blossom({ cx, cy, r = 8, fill = '#f0c8d8', opacity = 0.85 }) {
  return (
    <g opacity={opacity}>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i * 72 - 90) * Math.PI / 180;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        return (
          <ellipse key={i}
            cx={(cx + px) / 2} cy={(cy + py) / 2}
            rx={r * 0.45} ry={r * 0.3}
            fill={fill}
            transform={`rotate(${i * 72 - 90} ${(cx + px) / 2} ${(cy + py) / 2})`}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.22} fill="#f8e8b0" opacity={0.95} />
      {/* Stamens */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i * 60) * Math.PI / 180;
        return (
          <line key={i}
            x1={cx} y1={cy}
            x2={cx + Math.cos(a) * r * 0.55}
            y2={cy + Math.sin(a) * r * 0.55}
            stroke="#d4956a" strokeWidth="0.5" opacity={0.6}
          />
        );
      })}
    </g>
  );
}

// Leaf shape
function Leaf({ x1, y1, x2, y2, width = 8, fill = '#8fad8f', opacity = 0.6 }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len * width, ny = dx / len * width;
  return (
    <path
      d={`M${x1},${y1} Q${mx + nx},${my + ny} ${x2},${y2} Q${mx - nx},${my - ny} ${x1},${y1}Z`}
      fill={fill} opacity={opacity}
    />
  );
}

// ── Left side floral border ───────────────────────────────────────────────────
export function FloralLeft({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 160 700" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">

        {/* Main curved stem */}
        <path d="M80 690 C75 580 60 460 72 350 C84 240 68 140 78 30" stroke="#749e74" strokeWidth="1.8" fill="none" opacity="0.5"/>

        {/* Branch stems */}
        <path d="M72 350 C55 340 38 328 28 310" stroke="#749e74" strokeWidth="1.2" fill="none" opacity="0.45"/>
        <path d="M78 200 C62 190 45 178 35 162" stroke="#749e74" strokeWidth="1.2" fill="none" opacity="0.45"/>
        <path d="M74 480 C58 468 44 460 30 450" stroke="#749e74" strokeWidth="1.2" fill="none" opacity="0.4"/>

        {/* Top large rose */}
        <Rose cx={78} cy={70} r={22} fill="#cfaecf" fill2="#b494b8" opacity={0.75} />

        {/* Leaves around top rose */}
        <Leaf x1={56} y1={68} x2={38} y2={52} width={9} fill="#6d9970" opacity={0.6} />
        <Leaf x1={100} y1={65} x2={118} y2={50} width={9} fill="#8fad8f" opacity={0.55} />
        <Leaf x1={72} y1={90} x2={60} y2={108} width={7} fill="#749e74" opacity={0.5} />

        {/* Blossoms cluster top-right */}
        <Blossom cx={118} cy={110} r={9} fill="#f0c8d8" opacity={0.8} />
        <Blossom cx={132} cy={128} r={7} fill="#e8b4c8" opacity={0.7} />
        <Blossom cx={112} cy={135} r={6} fill="#f4d0e0" opacity={0.75} />

        {/* Lavender sprig left */}
        <path d="M35 162 C32 178 30 195 28 215" stroke="#8a7aaa" strokeWidth="1.2" fill="none" opacity="0.6"/>
        {[168, 178, 188, 198, 208].map((y, i) => (
          <g key={i}>
            <ellipse cx={28 + (i % 2 === 0 ? -5 : 5)} cy={y} rx={3} ry={5.5}
              fill="#9b8bbf" opacity={0.65}
              transform={`rotate(${i % 2 === 0 ? -18 : 18} ${28 + (i % 2 === 0 ? -5 : 5)} ${y})`} />
          </g>
        ))}

        {/* Mid rose */}
        <Rose cx={72} cy={260} r={18} fill="#d4b8d4" fill2="#c0a0c4" opacity={0.72} />
        <Leaf x1={52} y1={258} x2={34} y2={244} width={8} fill="#6d9970" opacity={0.55} />
        <Leaf x1={92} y1={255} x2={110} y2={242} width={8} fill="#8fad8f" opacity={0.5} />
        <Leaf x1={68} y1={278} x2={55} y2={296} width={6} fill="#749e74" opacity={0.48} />

        {/* 5-petal flowers on branch */}
        <Flower5 cx={28} cy={312} r={11} fill="#e8b4c8" centerFill="#f8e4b0" opacity={0.8} />
        <Flower5 cx={44} cy={326} r={8}  fill="#f0c8d8" centerFill="#f8e4b0" opacity={0.7} />

        {/* Leaves mid */}
        <Leaf x1={60} y1={350} x2={42} y2={365} width={10} fill="#6d9970" opacity={0.58} />
        <Leaf x1={84} y1={358} x2={100} y2={370} width={9} fill="#8fad8f" opacity={0.52} />

        {/* Bottom blossom cluster */}
        <Blossom cx={30} cy={452} r={10} fill="#f0c8d8" opacity={0.75} />
        <Blossom cx={48} cy={464} r={8}  fill="#e8b4c8" opacity={0.68} />
        <Blossom cx={28} cy={472} r={6}  fill="#f4d0e0" opacity={0.65} />

        {/* Bottom large rose */}
        <Rose cx={72} cy={540} r={20} fill="#cfaecf" fill2="#b494b8" opacity={0.68} />
        <Leaf x1={52} y1={538} x2={36} y2={526} width={8} fill="#6d9970" opacity={0.55} />
        <Leaf x1={92} y1={536} x2={108} y2={524} width={8} fill="#8fad8f" opacity={0.5} />

        {/* Trailing leaves bottom */}
        <Leaf x1={76} y1={590} x2={62} y2={610} width={9} fill="#749e74" opacity={0.5} />
        <Leaf x1={82} y1={618} x2={70} y2={638} width={7} fill="#8fad8f" opacity={0.44} />
        <Leaf x1={78} y1={645} x2={88} y2={665} width={6} fill="#6d9970" opacity={0.4} />

        {/* Scattered small blossoms */}
        <Blossom cx={100} cy={400} r={7} fill="#f0c8d8" opacity={0.65} />
        <Flower5 cx={110} cy={180} r={7} fill="#d4b8d4" centerFill="#f8e4b0" opacity={0.6} />
      </svg>
    </div>
  );
}

// ── Right side floral border (mirror) ────────────────────────────────────────
export function FloralRight({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 160 700" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">

        {/* Main curved stem */}
        <path d="M80 690 C85 580 100 460 88 350 C76 240 92 140 82 30" stroke="#749e74" strokeWidth="1.8" fill="none" opacity="0.5"/>

        {/* Branch stems */}
        <path d="M88 350 C105 340 122 328 132 310" stroke="#749e74" strokeWidth="1.2" fill="none" opacity="0.45"/>
        <path d="M82 200 C98 190 115 178 125 162" stroke="#749e74" strokeWidth="1.2" fill="none" opacity="0.45"/>
        <path d="M86 480 C102 468 116 460 130 450" stroke="#749e74" strokeWidth="1.2" fill="none" opacity="0.4"/>

        {/* Top large rose */}
        <Rose cx={82} cy={70} r={22} fill="#cfaecf" fill2="#b494b8" opacity={0.75} />

        {/* Leaves around top rose */}
        <Leaf x1={104} y1={68} x2={122} y2={52} width={9} fill="#6d9970" opacity={0.6} />
        <Leaf x1={60} y1={65} x2={42} y2={50} width={9} fill="#8fad8f" opacity={0.55} />
        <Leaf x1={88} y1={90} x2={100} y2={108} width={7} fill="#749e74" opacity={0.5} />

        {/* Blossoms cluster top-left */}
        <Blossom cx={42} cy={110} r={9} fill="#f0c8d8" opacity={0.8} />
        <Blossom cx={28} cy={128} r={7} fill="#e8b4c8" opacity={0.7} />
        <Blossom cx={48} cy={135} r={6} fill="#f4d0e0" opacity={0.75} />

        {/* Lavender sprig right */}
        <path d="M125 162 C128 178 130 195 132 215" stroke="#8a7aaa" strokeWidth="1.2" fill="none" opacity="0.6"/>
        {[168, 178, 188, 198, 208].map((y, i) => (
          <g key={i}>
            <ellipse cx={132 + (i % 2 === 0 ? 5 : -5)} cy={y} rx={3} ry={5.5}
              fill="#9b8bbf" opacity={0.65}
              transform={`rotate(${i % 2 === 0 ? 18 : -18} ${132 + (i % 2 === 0 ? 5 : -5)} ${y})`} />
          </g>
        ))}

        {/* Mid rose */}
        <Rose cx={88} cy={260} r={18} fill="#d4b8d4" fill2="#c0a0c4" opacity={0.72} />
        <Leaf x1={108} y1={258} x2={126} y2={244} width={8} fill="#6d9970" opacity={0.55} />
        <Leaf x1={68} y1={255} x2={50} y2={242} width={8} fill="#8fad8f" opacity={0.5} />
        <Leaf x1={92} y1={278} x2={105} y2={296} width={6} fill="#749e74" opacity={0.48} />

        {/* 5-petal flowers on branch */}
        <Flower5 cx={132} cy={312} r={11} fill="#e8b4c8" centerFill="#f8e4b0" opacity={0.8} />
        <Flower5 cx={116} cy={326} r={8}  fill="#f0c8d8" centerFill="#f8e4b0" opacity={0.7} />

        {/* Leaves mid */}
        <Leaf x1={100} y1={350} x2={118} y2={365} width={10} fill="#6d9970" opacity={0.58} />
        <Leaf x1={76} y1={358} x2={60} y2={370} width={9} fill="#8fad8f" opacity={0.52} />

        {/* Bottom blossom cluster */}
        <Blossom cx={130} cy={452} r={10} fill="#f0c8d8" opacity={0.75} />
        <Blossom cx={112} cy={464} r={8}  fill="#e8b4c8" opacity={0.68} />
        <Blossom cx={132} cy={472} r={6}  fill="#f4d0e0" opacity={0.65} />

        {/* Bottom large rose */}
        <Rose cx={88} cy={540} r={20} fill="#cfaecf" fill2="#b494b8" opacity={0.68} />
        <Leaf x1={108} y1={538} x2={124} y2={526} width={8} fill="#6d9970" opacity={0.55} />
        <Leaf x1={68} y1={536} x2={52} y2={524} width={8} fill="#8fad8f" opacity={0.5} />

        {/* Trailing leaves bottom */}
        <Leaf x1={84} y1={590} x2={98} y2={610} width={9} fill="#749e74" opacity={0.5} />
        <Leaf x1={78} y1={618} x2={90} y2={638} width={7} fill="#8fad8f" opacity={0.44} />
        <Leaf x1={82} y1={645} x2={72} y2={665} width={6} fill="#6d9970" opacity={0.4} />

        {/* Scattered small blossoms */}
        <Blossom cx={60} cy={400} r={7} fill="#f0c8d8" opacity={0.65} />
        <Flower5 cx={50} cy={180} r={7} fill="#d4b8d4" centerFill="#f8e4b0" opacity={0.6} />
      </svg>
    </div>
  );
}

// ── Top banner ────────────────────────────────────────────────────────────────
export function FloralTopBanner({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none w-full overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">

        {/* Left curved vine */}
        <path d="M0 180 C80 140 160 100 260 80 C360 60 440 40 540 50" stroke="#749e74" strokeWidth="1.5" fill="none" opacity="0.45"/>
        <path d="M0 160 C60 130 120 110 200 100" stroke="#8fad8f" strokeWidth="1" fill="none" opacity="0.4"/>

        {/* Right curved vine */}
        <path d="M1440 180 C1360 140 1280 100 1180 80 C1080 60 1000 40 900 50" stroke="#749e74" strokeWidth="1.5" fill="none" opacity="0.45"/>
        <path d="M1440 160 C1380 130 1320 110 1240 100" stroke="#8fad8f" strokeWidth="1" fill="none" opacity="0.4"/>

        {/* Left big rose */}
        <Rose cx={80} cy={100} r={28} fill="#cfaecf" fill2="#b494b8" opacity={0.72} />
        <Leaf x1={52} y1={95} x2={22} y2={80} width={11} fill="#6d9970" opacity={0.58} />
        <Leaf x1={108} y1={90} x2={130} y2={72} width={11} fill="#8fad8f" opacity={0.52} />
        <Leaf x1={75} y1={128} x2={62} y2={152} width={8} fill="#749e74" opacity={0.48} />

        {/* Left blossoms */}
        <Blossom cx={170} cy={70} r={12} fill="#f0c8d8" opacity={0.78} />
        <Blossom cx={200} cy={88} r={9}  fill="#e8b4c8" opacity={0.7} />
        <Blossom cx={152} cy={92} r={8}  fill="#f4d0e0" opacity={0.68} />
        <Flower5 cx={235} cy={65} r={10} fill="#d4b8d4" centerFill="#f8e4b0" opacity={0.7} />

        {/* Left lavender */}
        <path d="M280 10 C278 35 276 60 274 90" stroke="#8a7aaa" strokeWidth="1.3" fill="none" opacity="0.55"/>
        {[18, 30, 42, 54, 66, 78].map((y, i) => (
          <ellipse key={i} cx={274 + (i % 2 === 0 ? -5 : 5)} cy={y} rx={3.5} ry={6}
            fill="#9b8bbf" opacity={0.6}
            transform={`rotate(${i % 2 === 0 ? -20 : 20} ${274 + (i % 2 === 0 ? -5 : 5)} ${y})`} />
        ))}

        {/* Left scattered leaves */}
        <Leaf x1={320} y1={80} x2={350} y2={60} width={9} fill="#6d9970" opacity={0.5} />
        <Leaf x1={380} y1={70} x2={410} y2={55} width={8} fill="#8fad8f" opacity={0.45} />
        <Flower5 cx={430} cy={75} r={8} fill="#e8b4c8" centerFill="#f8e4b0" opacity={0.65} />

        {/* Center accent */}
        <Rose cx={720} cy={45} r={16} fill="#d4b8d4" fill2="#c0a0c4" opacity={0.65} />
        <Blossom cx={748} cy={68} r={8} fill="#f0c8d8" opacity={0.6} />
        <Blossom cx={692} cy={68} r={8} fill="#f0c8d8" opacity={0.6} />
        <Leaf x1={700} y1={42} x2={680} y2={28} width={7} fill="#6d9970" opacity={0.5} />
        <Leaf x1={740} y1={42} x2={760} y2={28} width={7} fill="#8fad8f" opacity={0.5} />

        {/* Right scattered leaves */}
        <Leaf x1={1120} y1={80} x2={1090} y2={60} width={9} fill="#6d9970" opacity={0.5} />
        <Leaf x1={1060} y1={70} x2={1030} y2={55} width={8} fill="#8fad8f" opacity={0.45} />
        <Flower5 cx={1010} cy={75} r={8} fill="#e8b4c8" centerFill="#f8e4b0" opacity={0.65} />

        {/* Right lavender */}
        <path d="M1160 10 C1162 35 1164 60 1166 90" stroke="#8a7aaa" strokeWidth="1.3" fill="none" opacity="0.55"/>
        {[18, 30, 42, 54, 66, 78].map((y, i) => (
          <ellipse key={i} cx={1166 + (i % 2 === 0 ? 5 : -5)} cy={y} rx={3.5} ry={6}
            fill="#9b8bbf" opacity={0.6}
            transform={`rotate(${i % 2 === 0 ? 20 : -20} ${1166 + (i % 2 === 0 ? 5 : -5)} ${y})`} />
        ))}

        {/* Right blossoms */}
        <Blossom cx={1270} cy={70} r={12} fill="#f0c8d8" opacity={0.78} />
        <Blossom cx={1240} cy={88} r={9}  fill="#e8b4c8" opacity={0.7} />
        <Blossom cx={1288} cy={92} r={8}  fill="#f4d0e0" opacity={0.68} />
        <Flower5 cx={1205} cy={65} r={10} fill="#d4b8d4" centerFill="#f8e4b0" opacity={0.7} />

        {/* Right big rose */}
        <Rose cx={1360} cy={100} r={28} fill="#cfaecf" fill2="#b494b8" opacity={0.72} />
        <Leaf x1={1388} y1={95} x2={1418} y2={80} width={11} fill="#6d9970" opacity={0.58} />
        <Leaf x1={1332} y1={90} x2={1310} y2={72} width={11} fill="#8fad8f" opacity={0.52} />
        <Leaf x1={1365} y1={128} x2={1378} y2={152} width={8} fill="#749e74" opacity={0.48} />
      </svg>
    </div>
  );
}

// ── Small sprig for dividers ──────────────────────────────────────────────────
export function FloralSprig({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none inline-block ${className}`} aria-hidden="true">
      <svg viewBox="0 0 130 55" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-14">
        {/* Curved stem */}
        <path d="M15 45 C40 28 70 20 115 32" stroke="#749e74" strokeWidth="1.3" fill="none" opacity="0.6"/>
        {/* Center rose */}
        <Rose cx={65} cy={24} r={13} fill="#cfaecf" fill2="#b494b8" opacity={0.8} />
        {/* Side blossoms */}
        <Blossom cx={30} cy={36} r={8} fill="#f0c8d8" opacity={0.75} />
        <Blossom cx={100} cy={34} r={7} fill="#e8b4c8" opacity={0.72} />
        {/* Leaves */}
        <Leaf x1={48} y1={30} x2={32} y2={20} width={6} fill="#6d9970" opacity={0.55} />
        <Leaf x1={82} y1={28} x2={98} y2={18} width={6} fill="#8fad8f" opacity={0.52} />
        <Leaf x1={20} y1={42} x2={10} y2={30} width={5} fill="#749e74" opacity={0.48} />
        <Leaf x1={108} y1={40} x2={120} y2={28} width={5} fill="#6d9970" opacity={0.45} />
      </svg>
    </div>
  );
}
