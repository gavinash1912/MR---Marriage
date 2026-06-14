// Beautiful watercolor-style floral SVG decorations
// Inspired by the Zola botanical border style

export function FloralLeft({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Main stem */}
        <path d="M100 580 C95 480 80 380 90 280 C100 180 85 100 95 20" stroke="#8fad8f" strokeWidth="1.5" fill="none" opacity="0.6"/>

        {/* Large hydrangea cluster top */}
        <circle cx="85" cy="60" r="22" fill="#c9b3d4" opacity="0.45"/>
        <circle cx="105" cy="50" r="18" fill="#b8a3c8" opacity="0.4"/>
        <circle cx="95" cy="75" r="16" fill="#d4c0dd" opacity="0.5"/>
        <circle cx="70" cy="55" r="14" fill="#c9b3d4" opacity="0.35"/>
        {/* Small florets */}
        {[
          [80,45], [100,55], [88,68], [72,62], [98,40], [110,65]
        ].map(([cx,cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="5" fill="#d4c0dd" opacity="0.7"/>
            <circle cx={cx} cy={cy} r="2" fill="#a088b0" opacity="0.8"/>
          </g>
        ))}

        {/* Lavender sprigs */}
        <path d="M120 90 C125 110 122 130 120 150" stroke="#8a7aaa" strokeWidth="1.2" fill="none" opacity="0.7"/>
        {[100,108,116,124,132,140].map((y, i) => (
          <ellipse key={i} cx={120 + (i%2===0 ? -4 : 4)} cy={y} rx="3" ry="5" fill="#9b8bbf" opacity="0.65" transform={`rotate(${i%2===0?-15:15} ${120 + (i%2===0 ? -4 : 4)} ${y})`}/>
        ))}

        {/* Pink daisy mid-left */}
        <g transform="translate(50, 190)">
          {Array.from({length:8},(_,i) => (
            <ellipse key={i} cx="0" cy="-12" rx="4" ry="8" fill="#e8b4c8" opacity="0.7"
              transform={`rotate(${i*45})`}/>
          ))}
          <circle cx="0" cy="0" r="5" fill="#f0d0b0" opacity="0.9"/>
          <circle cx="0" cy="0" r="2" fill="#d4956a" opacity="0.8"/>
        </g>

        {/* Fern leaves */}
        <path d="M95 240 C80 250 65 265 70 280" stroke="#6d9970" strokeWidth="1.2" fill="none" opacity="0.6"/>
        {[0.2,0.4,0.6,0.8].map((t,i) => {
          const x = 95 - t*25, y = 240 + t*40;
          return (
            <ellipse key={i} cx={x-8} cy={y} rx="10" ry="4"
              fill="#8fad8f" opacity="0.55"
              transform={`rotate(-30 ${x-8} ${y})`}/>
          );
        })}

        {/* Small blue wildflower */}
        <g transform="translate(75, 320)">
          {Array.from({length:6},(_,i) => (
            <ellipse key={i} cx="0" cy="-9" rx="3" ry="6" fill="#a0b8d8" opacity="0.7"
              transform={`rotate(${i*60})`}/>
          ))}
          <circle cx="0" cy="0" r="4" fill="#f0d8a0" opacity="0.9"/>
        </g>

        {/* Large hydrangea bottom */}
        <circle cx="90" cy="450" r="20" fill="#c9b3d4" opacity="0.4"/>
        <circle cx="110" cy="440" r="17" fill="#b8a3c8" opacity="0.38"/>
        <circle cx="98" cy="465" r="15" fill="#d4c0dd" opacity="0.45"/>
        {[
          [85,438], [105,448], [92,462], [112,458], [97,430]
        ].map(([cx,cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="4.5" fill="#d4c0dd" opacity="0.7"/>
            <circle cx={cx} cy={cy} r="2" fill="#a088b0" opacity="0.75"/>
          </g>
        ))}

        {/* Bottom trailing leaves */}
        <path d="M95 500 C85 515 80 530 90 545" stroke="#6d9970" strokeWidth="1.3" fill="none" opacity="0.5"/>
        <ellipse cx="78" cy="515" rx="12" ry="5" fill="#8fad8f" opacity="0.5" transform="rotate(-20 78 515)"/>
        <ellipse cx="82" cy="530" rx="10" ry="4" fill="#749e74" opacity="0.45" transform="rotate(-35 82 530)"/>
        <ellipse cx="92" cy="543" rx="8" ry="4" fill="#8fad8f" opacity="0.4" transform="rotate(-10 92 543)"/>
      </svg>
    </div>
  );
}

export function FloralRight({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Mirror of left - main stem */}
        <path d="M100 580 C105 480 120 380 110 280 C100 180 115 100 105 20" stroke="#8fad8f" strokeWidth="1.5" fill="none" opacity="0.6"/>

        {/* Large hydrangea cluster top */}
        <circle cx="115" cy="60" r="22" fill="#c9b3d4" opacity="0.45"/>
        <circle cx="95" cy="50" r="18" fill="#b8a3c8" opacity="0.4"/>
        <circle cx="105" cy="75" r="16" fill="#d4c0dd" opacity="0.5"/>
        <circle cx="130" cy="55" r="14" fill="#c9b3d4" opacity="0.35"/>
        {[
          [120,45], [100,55], [112,68], [128,62], [102,40], [90,65]
        ].map(([cx,cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="5" fill="#d4c0dd" opacity="0.7"/>
            <circle cx={cx} cy={cy} r="2" fill="#a088b0" opacity="0.8"/>
          </g>
        ))}

        {/* Lavender sprigs */}
        <path d="M80 90 C75 110 78 130 80 150" stroke="#8a7aaa" strokeWidth="1.2" fill="none" opacity="0.7"/>
        {[100,108,116,124,132,140].map((y, i) => (
          <ellipse key={i} cx={80 + (i%2===0 ? 4 : -4)} cy={y} rx="3" ry="5" fill="#9b8bbf" opacity="0.65" transform={`rotate(${i%2===0?15:-15} ${80 + (i%2===0 ? 4 : -4)} ${y})`}/>
        ))}

        {/* Pink daisy mid-right */}
        <g transform="translate(150, 200)">
          {Array.from({length:8},(_,i) => (
            <ellipse key={i} cx="0" cy="-12" rx="4" ry="8" fill="#e8b4c8" opacity="0.7"
              transform={`rotate(${i*45})`}/>
          ))}
          <circle cx="0" cy="0" r="5" fill="#f0d0b0" opacity="0.9"/>
          <circle cx="0" cy="0" r="2" fill="#d4956a" opacity="0.8"/>
        </g>

        {/* Fern leaves */}
        <path d="M105 240 C120 250 135 265 130 280" stroke="#6d9970" strokeWidth="1.2" fill="none" opacity="0.6"/>
        {[0.2,0.4,0.6,0.8].map((t,i) => {
          const x = 105 + t*25, y = 240 + t*40;
          return (
            <ellipse key={i} cx={x+8} cy={y} rx="10" ry="4"
              fill="#8fad8f" opacity="0.55"
              transform={`rotate(30 ${x+8} ${y})`}/>
          );
        })}

        {/* Small blue wildflower */}
        <g transform="translate(125, 330)">
          {Array.from({length:6},(_,i) => (
            <ellipse key={i} cx="0" cy="-9" rx="3" ry="6" fill="#a0b8d8" opacity="0.7"
              transform={`rotate(${i*60})`}/>
          ))}
          <circle cx="0" cy="0" r="4" fill="#f0d8a0" opacity="0.9"/>
        </g>

        {/* Large hydrangea bottom */}
        <circle cx="110" cy="450" r="20" fill="#c9b3d4" opacity="0.4"/>
        <circle cx="90" cy="440" r="17" fill="#b8a3c8" opacity="0.38"/>
        <circle cx="102" cy="465" r="15" fill="#d4c0dd" opacity="0.45"/>
        {[
          [115,438], [95,448], [108,462], [88,458], [103,430]
        ].map(([cx,cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="4.5" fill="#d4c0dd" opacity="0.7"/>
            <circle cx={cx} cy={cy} r="2" fill="#a088b0" opacity="0.75"/>
          </g>
        ))}

        {/* Bottom trailing leaves */}
        <path d="M105 500 C115 515 120 530 110 545" stroke="#6d9970" strokeWidth="1.3" fill="none" opacity="0.5"/>
        <ellipse cx="122" cy="515" rx="12" ry="5" fill="#8fad8f" opacity="0.5" transform="rotate(20 122 515)"/>
        <ellipse cx="118" cy="530" rx="10" ry="4" fill="#749e74" opacity="0.45" transform="rotate(35 118 530)"/>
        <ellipse cx="108" cy="543" rx="8" ry="4" fill="#8fad8f" opacity="0.4" transform="rotate(10 108 543)"/>
      </svg>
    </div>
  );
}

// Top decorative floral banner
export function FloralTopBanner({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none w-full overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1440 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
        {/* Left cluster */}
        <circle cx="120" cy="80" r="35" fill="#c9b3d4" opacity="0.35"/>
        <circle cx="160" cy="60" r="28" fill="#b8a3c8" opacity="0.32"/>
        <circle cx="85" cy="100" r="25" fill="#d4c0dd" opacity="0.4"/>
        <circle cx="60" cy="60" r="20" fill="#c9b3d4" opacity="0.3"/>
        {[[115,55],[145,70],[102,90],[68,72],[155,90],[80,45]].map(([cx,cy],i)=>(
          <g key={i}><circle cx={cx} cy={cy} r="6" fill="#d4c0dd" opacity="0.65"/>
          <circle cx={cx} cy={cy} r="2.5" fill="#a088b0" opacity="0.75"/></g>
        ))}

        {/* Left lavender */}
        <path d="M200 0 C205 30 202 60 200 90" stroke="#8a7aaa" strokeWidth="1.5" fill="none" opacity="0.6"/>
        {[10,22,34,46,58,70,82].map((y,i)=>(
          <ellipse key={i} cx={200+(i%2===0?-5:5)} cy={y} rx="3.5" ry="6" fill="#9b8bbf" opacity="0.6"
            transform={`rotate(${i%2===0?-20:20} ${200+(i%2===0?-5:5)} ${y})`}/>
        ))}

        {/* Left fern */}
        <path d="M30 0 C40 30 35 60 45 90" stroke="#6d9970" strokeWidth="1.5" fill="none" opacity="0.55"/>
        {[0,0.25,0.5,0.75,1].map((t,i)=>{
          const x=30+t*15, y=t*90;
          return <ellipse key={i} cx={x-15} cy={y+5} rx="18" ry="6" fill="#8fad8f" opacity="0.5"
            transform={`rotate(-30 ${x-15} ${y+5})`}/>;
        })}

        {/* Center accent */}
        <g transform="translate(720, 30)">
          {Array.from({length:8},(_,i)=>(
            <ellipse key={i} cx="0" cy="-15" rx="5" ry="10" fill="#e8b4c8" opacity="0.55"
              transform={`rotate(${i*45})`}/>
          ))}
          <circle cx="0" cy="0" r="6" fill="#f0d0b0" opacity="0.85"/>
        </g>

        {/* Right cluster (mirrored) */}
        <circle cx="1320" cy="80" r="35" fill="#c9b3d4" opacity="0.35"/>
        <circle cx="1280" cy="60" r="28" fill="#b8a3c8" opacity="0.32"/>
        <circle cx="1355" cy="100" r="25" fill="#d4c0dd" opacity="0.4"/>
        <circle cx="1380" cy="60" r="20" fill="#c9b3d4" opacity="0.3"/>
        {[[1325,55],[1295,70],[1338,90],[1372,72],[1285,90],[1360,45]].map(([cx,cy],i)=>(
          <g key={i}><circle cx={cx} cy={cy} r="6" fill="#d4c0dd" opacity="0.65"/>
          <circle cx={cx} cy={cy} r="2.5" fill="#a088b0" opacity="0.75"/></g>
        ))}

        {/* Right lavender */}
        <path d="M1240 0 C1235 30 1238 60 1240 90" stroke="#8a7aaa" strokeWidth="1.5" fill="none" opacity="0.6"/>
        {[10,22,34,46,58,70,82].map((y,i)=>(
          <ellipse key={i} cx={1240+(i%2===0?5:-5)} cy={y} rx="3.5" ry="6" fill="#9b8bbf" opacity="0.6"
            transform={`rotate(${i%2===0?20:-20} ${1240+(i%2===0?5:-5)} ${y})`}/>
        ))}

        {/* Right fern */}
        <path d="M1410 0 C1400 30 1405 60 1395 90" stroke="#6d9970" strokeWidth="1.5" fill="none" opacity="0.55"/>
        {[0,0.25,0.5,0.75,1].map((t,i)=>{
          const x=1410-t*15, y=t*90;
          return <ellipse key={i} cx={x+15} cy={y+5} rx="18" ry="6" fill="#8fad8f" opacity="0.5"
            transform={`rotate(30 ${x+15} ${y+5})`}/>;
        })}

        {/* Trailing vines connecting left */}
        <path d="M250 20 Q400 80 560 40 Q640 20 720 30" stroke="#8fad8f" strokeWidth="1" fill="none" opacity="0.4"/>
        <path d="M1190 20 Q1040 80 880 40 Q800 20 720 30" stroke="#8fad8f" strokeWidth="1" fill="none" opacity="0.4"/>
      </svg>
    </div>
  );
}

// Small floral sprig for section separators
export function FloralSprig({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none inline-block ${className}`} aria-hidden="true">
      <svg viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-14">
        <path d="M20 50 C40 30 70 20 100 35" stroke="#8fad8f" strokeWidth="1.2" fill="none" opacity="0.7"/>
        <circle cx="60" cy="25" r="12" fill="#c9b3d4" opacity="0.4"/>
        {[[55,18],[65,18],[58,28],[68,24]].map(([cx,cy],i)=>(
          <g key={i}><circle cx={cx} cy={cy} r="4" fill="#d4c0dd" opacity="0.65"/>
          <circle cx={cx} cy={cy} r="1.5" fill="#a088b0" opacity="0.7"/></g>
        ))}
        <ellipse cx="35" cy="42" rx="10" ry="4" fill="#8fad8f" opacity="0.55" transform="rotate(-25 35 42)"/>
        <ellipse cx="88" cy="36" rx="9" ry="3.5" fill="#8fad8f" opacity="0.5" transform="rotate(15 88 36)"/>
        <g transform="translate(20,45)">
          {Array.from({length:6},(_,i)=>(
            <ellipse key={i} cx="0" cy="-6" rx="2" ry="4" fill="#e8b4c8" opacity="0.7" transform={`rotate(${i*60})`}/>
          ))}
          <circle cx="0" cy="0" r="2.5" fill="#f0d0b0" opacity="0.9"/>
        </g>
      </svg>
    </div>
  );
}
