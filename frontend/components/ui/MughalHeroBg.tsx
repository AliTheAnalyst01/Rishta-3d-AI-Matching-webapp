'use client'

// Seeded pseudo-random — deterministic across SSR & client (no hydration mismatch)
function sr(seed: number, min = 0, max = 1): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return min + (x - Math.floor(x)) * (max - min)
}

const DIYAS = Array.from({ length: 80 }, (_, i) => ({
  x:      sr(i * 3 + 1, 2, 98),
  y:      sr(i * 3 + 2, 58, 90),
  r:      sr(i * 3 + 3, 1.2, 4.2),
  delay:  sr(i * 7 + 1, 0, 5).toFixed(2) + 's',
  dur:    sr(i * 7 + 2, 0.8, 2.6).toFixed(2) + 's',
  hue:    Math.floor(sr(i * 13 + 1, 22, 46)),
}))

const STARS = Array.from({ length: 110 }, (_, i) => ({
  x:    sr(i * 5 + 1, 0, 100),
  y:    sr(i * 5 + 2, 0, 46),
  r:    sr(i * 5 + 3, 0.4, 1.6),
  delay: sr(i * 11 + 1, 0, 7).toFixed(2) + 's',
  dur:  sr(i * 11 + 2, 2.5, 6).toFixed(2) + 's',
}))

const PETALS = Array.from({ length: 20 }, (_, i) => ({
  x:    sr(i * 17 + 1, 0, 100),
  w:    sr(i * 17 + 2, 6, 13),
  h:    sr(i * 17 + 3, 4, 8),
  delay: sr(i * 17 + 4, 0, 16).toFixed(2) + 's',
  dur:  sr(i * 17 + 5, 10, 24).toFixed(2) + 's',
  rot:  Math.floor(sr(i * 17 + 6, 0, 360)),
  sway: Math.floor(sr(i * 17 + 7, -90, 90)),
  op:   sr(i * 17 + 8, 0.35, 0.7).toFixed(2),
  hue:  Math.floor(sr(i * 17 + 9, 22, 42)),
}))

// Arch helper: pointed Mughal arch as SVG path
function mughalArch(cx: number, baseY: number, w: number, h: number): string {
  const L = cx - w / 2
  const R = cx + w / 2
  const spring = baseY - h * 0.58
  const peak   = baseY - h
  return [
    `M ${L} ${baseY}`,
    `L ${L} ${spring}`,
    `C ${L} ${spring - h * 0.22} ${cx - 4} ${peak + 4} ${cx} ${peak}`,
    `C ${cx + 4} ${peak + 4} ${R} ${spring - h * 0.22} ${R} ${spring}`,
    `L ${R} ${baseY}`,
    'Z',
  ].join(' ')
}

export default function MughalHeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>

      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes diya-flicker {
          0%,100% { opacity:1;   transform:scale(1);    }
          25%      { opacity:0.55; transform:scale(0.82); }
          55%      { opacity:0.88; transform:scale(1.12); }
          75%      { opacity:0.65; transform:scale(0.92); }
        }
        @keyframes star-twinkle {
          0%,100% { opacity:0.85; }
          45%     { opacity:0.15; }
        }
        @keyframes petal-fall {
          0%   { transform:translateY(-20px) translateX(0px) rotate(var(--rot,0deg)); opacity:0; }
          6%   { opacity:var(--op,0.5); }
          92%  { opacity:var(--op,0.5); }
          100% { transform:translateY(105vh) translateX(var(--sway,40px)) rotate(calc(var(--rot,0deg) + 200deg)); opacity:0; }
        }
        @keyframes glow-breathe {
          0%,100% { opacity:0.45; transform:scaleX(1) scaleY(1); }
          50%     { opacity:0.75; transform:scaleX(1.25) scaleY(1.3); }
        }
        @keyframes horizon-pulse {
          0%,100% { opacity:0.6; }
          50%     { opacity:0.9; }
        }
      `}</style>

      {/* ── Sky gradient ── */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 55% 38% at 28% 82%, rgba(130,50,6,0.72) 0%, transparent 58%)',
            'radial-gradient(ellipse 70% 42% at 72% 88%, rgba(90,30,5,0.55) 0%, transparent 55%)',
            'radial-gradient(ellipse 38% 28% at 50% 100%, rgba(190,75,12,0.62) 0%, transparent 50%)',
            `linear-gradient(180deg,
              #09031c 0%,
              #130642 12%,
              #261058 25%,
              #3a1858 38%,
              #4a2040 50%,
              #421600 62%,
              #2a0d00 74%,
              #160700 88%,
              #0a0400 100%
            )`,
          ].join(', '),
        }}
      />

      {/* ── Horizon amber glow (from courtyard fires) ── */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '48%',
          background: 'linear-gradient(0deg, rgba(140,58,6,0.5) 0%, rgba(70,24,2,0.22) 38%, transparent 100%)',
          animation: 'horizon-pulse 5s ease-in-out infinite',
        }}
      />

      {/* ── Milky way band ── */}
      <div
        className="absolute"
        style={{
          top: '5%', left: '-15%', width: '130%', height: '22%',
          background: 'linear-gradient(108deg, transparent 18%, rgba(255,255,255,0.022) 42%, rgba(200,185,255,0.032) 58%, transparent 78%)',
          transform: 'rotate(-12deg)',
          filter: 'blur(22px)',
        }}
      />

      {/* ── Stars ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x} cy={s.y} r={s.r * 0.18}
            fill="white"
            style={{
              animation: `star-twinkle ${s.dur} ${s.delay} ease-in-out infinite`,
            }}
          />
        ))}
        {/* A few slightly larger "prominent" stars */}
        {[
          { x: 8,  y: 6,  r: 0.38 },
          { x: 23, y: 11, r: 0.32 },
          { x: 47, y: 4,  r: 0.42 },
          { x: 68, y: 9,  r: 0.35 },
          { x: 85, y: 14, r: 0.3  },
          { x: 93, y: 5,  r: 0.36 },
        ].map((s, i) => (
          <circle key={`big-${i}`} cx={s.x} cy={s.y} r={s.r}
            fill="rgba(255,240,200,0.9)"
            style={{ animation: `star-twinkle ${2.5 + i * 0.6}s ${i * 1.1}s ease-in-out infinite` }}
          />
        ))}
      </svg>

      {/* ══════════════════════════════════════
          PALACE SVG SILHOUETTE
          ViewBox: 1440 × 800
          Palace occupies bottom ~55%
      ══════════════════════════════════════ */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMax meet"
        style={{ height: '72%' }}
      >
        <defs>
          <linearGradient id="mhb-base" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#140a06" />
            <stop offset="100%" stopColor="#090402" />
          </linearGradient>
          <linearGradient id="mhb-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c0e08" />
            <stop offset="100%" stopColor="#0e0604" />
          </linearGradient>
          <radialGradient id="mhb-courtyard" cx="50%" cy="100%" r="60%">
            <stop offset="0%" stopColor="#4a1e02" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Courtyard warm glow pool */}
        <ellipse cx="720" cy="760" rx="680" ry="220" fill="url(#mhb-courtyard)" />

        {/* ── FAR BACKGROUND structures (3rd layer) ── */}
        {/* Faint distant towers and roofline */}
        <rect x="0"    y="560" width="160" height="240" fill="#1c0e08" opacity="0.6"/>
        <rect x="1280" y="560" width="160" height="240" fill="#1c0e08" opacity="0.6"/>
        {/* Far distant minaret left */}
        <rect x="100" y="440" width="22" height="200" fill="#190c07" opacity="0.6"/>
        <ellipse cx="111" cy="440" rx="14" ry="8" fill="#190c07" opacity="0.6"/>
        <path d="M 105 440 C 105 425 108 415 111 408 C 114 415 117 425 117 440 Z" fill="#190c07" opacity="0.6"/>
        {/* Far distant minaret right */}
        <rect x="1318" y="440" width="22" height="200" fill="#190c07" opacity="0.6"/>
        <ellipse cx="1329" cy="440" rx="14" ry="8" fill="#190c07" opacity="0.6"/>
        <path d="M 1323 440 C 1323 425 1326 415 1329 408 C 1332 415 1335 425 1341 440 Z" fill="#190c07" opacity="0.6"/>
        {/* Far center distant dome */}
        <rect x="680" y="490" width="120" height="200" fill="#170c06" opacity="0.5"/>
        <path d="M 685 490 C 670 462 668 435 685 412 C 700 392 714 378 720 365 C 726 378 740 392 755 412 C 772 435 770 462 755 490 Z" fill="#170c06" opacity="0.5"/>
        <rect x="715" y="350" width="10" height="18" fill="#170c06" opacity="0.5"/>
        <polygon points="720,336 713,352 727,352" fill="#170c06" opacity="0.5"/>

        {/* ── MAIN PALACE BODY (2nd layer) ── */}

        {/* Main continuous wall — full width */}
        <rect x="0" y="520" width="1440" height="280" fill="url(#mhb-base)"/>

        {/* ─── LEFT SECTION ─── */}

        {/* Left outer wall with battlements */}
        <rect x="0" y="476" width="195" height="48" fill="#0f0705"/>
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={`lb-${i}`} x={i * 16} y="456" width="10" height="22" fill="#0f0705"/>
        ))}

        {/* Left outer corner tower */}
        <rect x="165" y="408" width="56" height="116" fill="#120806"/>
        <ellipse cx="193" cy="408" rx="30" ry="17" fill="#120806"/>
        <path d="M 181 408 C 181 388 186 372 193 362 C 200 372 205 388 205 408 Z" fill="#120806"/>
        <rect x="189" y="350" width="8" height="14" fill="#120806"/>
        <polygon points="193,338 187,352 199,352" fill="#d4a757" opacity="0.5"/>

        {/* Left colonnade — 5 arched openings */}
        <rect x="221" y="470" width="240" height="90" fill="#0d0604"/>
        {Array.from({ length: 5 }, (_, i) => (
          <path
            key={`la-${i}`}
            d={mughalArch(246 + i * 47, 560, 34, 72)}
            fill="#1e0f08"
          />
        ))}
        {/* Colonnade top parapet */}
        {Array.from({ length: 15 }, (_, i) => (
          <rect key={`lc-${i}`} x={222 + i * 16} y="452" width="9" height="20" fill="#0d0604"/>
        ))}

        {/* Left pavilion dome */}
        <rect x="461" y="428" width="96" height="134" fill="#0e0705"/>
        <ellipse cx="509" cy="428" rx="52" ry="26" fill="#0e0705"/>
        <path
          d="M 490 428 C 484 402 482 376 492 352 C 499 335 507 322 509 312 C 511 322 519 335 526 352 C 536 376 534 402 528 428 Z"
          fill="#0e0705"
        />
        <rect x="504" y="297" width="10" height="18" fill="#0e0705"/>
        <polygon points="509,283 502,299 516,299" fill="#d4a757" opacity="0.55"/>

        {/* Left main tall minaret */}
        <rect x="564" y="280" width="38" height="282" fill="#110806"/>
        <rect x="561" y="308" width="44" height="9" fill="#150a07"/>
        <rect x="561" y="378" width="44" height="9" fill="#150a07"/>
        <rect x="561" y="448" width="44" height="9" fill="#150a07"/>
        <rect x="561" y="516" width="44" height="9" fill="#150a07"/>
        <ellipse cx="583" cy="280" rx="26" ry="15" fill="#110806"/>
        <path d="M 569 280 C 569 258 575 238 583 226 C 591 238 597 258 597 280 Z" fill="#110806"/>
        <rect x="578" y="212" width="10" height="18" fill="#110806"/>
        <polygon points="583,196 576,214 590,214" fill="#d4a757" opacity="0.7"/>

        {/* ─── CENTRAL GRAND GATEWAY ─── */}

        {/* Gateway flanking towers */}
        <rect x="612" y="336" width="108" height="226" fill="#0f0705"/>
        <rect x="720" y="336" width="108" height="226" fill="#0f0705"/>

        {/* Gateway grand pointed arch (frame — dark) */}
        <path
          d={mughalArch(720, 562, 200, 230)}
          fill="#0f0705"
        />
        {/* Gateway arch opening (warm interior glow) */}
        <path
          d={mughalArch(720, 562, 158, 196)}
          fill="#2a1208"
        />
        {/* Arch inner frame detail */}
        <path
          d={mughalArch(720, 562, 168, 206)}
          fill="none"
          stroke="rgba(180,100,20,0.15)"
          strokeWidth="2"
        />

        {/* Gateway top parapet battlements */}
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={`gb-${i}`} x={613 + i * 15} y="318" width="9" height="20" fill="#0f0705"/>
        ))}

        {/* ─── CENTRAL DOME COMPLEX ─── */}

        {/* Drum base */}
        <rect x="666" y="262" width="108" height="80" fill="#110805"/>
        {/* Drum decorative band */}
        <rect x="663" y="280" width="114" height="10" fill="#160c07"/>
        <rect x="663" y="298" width="114" height="6"  fill="#160c07"/>
        {/* Small arched niches on drum */}
        {Array.from({ length: 4 }, (_, i) => (
          <path
            key={`dn-${i}`}
            d={mughalArch(681 + i * 27, 342, 18, 38)}
            fill="#1e0f08"
          />
        ))}

        {/* THE MAIN DOME — iconic Mughal onion dome */}
        <path
          d={`
            M 666 262
            C 646 238 632 204 640 168
            C 648 140 678 110 720 88
            C 762 110 792 140 800 168
            C 808 204 794 238 774 262
            Z
          `}
          fill="#100804"
        />
        {/* Dome highlight — subtle blue moonlight on left edge */}
        <path
          d={`M 666 262 C 646 238 632 204 640 168 C 648 140 678 110 720 88`}
          fill="none"
          stroke="rgba(100,150,220,0.18)"
          strokeWidth="2.5"
        />
        {/* Dome finial neck */}
        <rect x="715" y="74" width="10" height="20" fill="#110805"/>
        {/* Finial dome-cap */}
        <ellipse cx="720" cy="74" rx="10" ry="6" fill="#110805"/>
        <path d="M 714 74 C 714 64 717 57 720 52 C 723 57 726 64 726 74 Z" fill="#110805"/>
        {/* Gold finial spire tip */}
        <polygon points="720,42 715,54 725,54" fill="#d4a757" opacity="0.8"/>
        {/* Gold crescent at tip */}
        <path
          d="M 716 42 A 6 6 0 1 1 724 42 A 4 4 0 1 0 716 42 Z"
          fill="#d4a757"
          opacity="0.7"
        />

        {/* ─── RIGHT SECTION (mirror of left) ─── */}

        {/* Right main tall minaret */}
        <rect x="838" y="280" width="38" height="282" fill="#110806"/>
        <rect x="835" y="308" width="44" height="9" fill="#150a07"/>
        <rect x="835" y="378" width="44" height="9" fill="#150a07"/>
        <rect x="835" y="448" width="44" height="9" fill="#150a07"/>
        <rect x="835" y="516" width="44" height="9" fill="#150a07"/>
        <ellipse cx="857" cy="280" rx="26" ry="15" fill="#110806"/>
        <path d="M 843 280 C 843 258 849 238 857 226 C 865 238 871 258 871 280 Z" fill="#110806"/>
        <rect x="852" y="212" width="10" height="18" fill="#110806"/>
        <polygon points="857,196 850,214 864,214" fill="#d4a757" opacity="0.7"/>

        {/* Right pavilion dome */}
        <rect x="883" y="428" width="96" height="134" fill="#0e0705"/>
        <ellipse cx="931" cy="428" rx="52" ry="26" fill="#0e0705"/>
        <path
          d="M 912 428 C 906 402 904 376 914 352 C 921 335 929 322 931 312 C 933 322 941 335 948 352 C 958 376 956 402 950 428 Z"
          fill="#0e0705"
        />
        <rect x="926" y="297" width="10" height="18" fill="#0e0705"/>
        <polygon points="931,283 924,299 938,299" fill="#d4a757" opacity="0.55"/>

        {/* Right colonnade */}
        <rect x="979" y="470" width="240" height="90" fill="#0d0604"/>
        {Array.from({ length: 5 }, (_, i) => (
          <path
            key={`ra-${i}`}
            d={mughalArch(1004 + i * 47, 560, 34, 72)}
            fill="#1e0f08"
          />
        ))}
        {Array.from({ length: 15 }, (_, i) => (
          <rect key={`rc-${i}`} x={980 + i * 16} y="452" width="9" height="20" fill="#0d0604"/>
        ))}

        {/* Right outer corner tower */}
        <rect x="1219" y="408" width="56" height="116" fill="#120806"/>
        <ellipse cx="1247" cy="408" rx="30" ry="17" fill="#120806"/>
        <path d="M 1235 408 C 1235 388 1240 372 1247 362 C 1254 372 1259 388 1259 408 Z" fill="#120806"/>
        <rect x="1243" y="350" width="8" height="14" fill="#120806"/>
        <polygon points="1247,338 1241,352 1253,352" fill="#d4a757" opacity="0.5"/>

        {/* Right outer wall with battlements */}
        <rect x="1245" y="476" width="195" height="48" fill="#0f0705"/>
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={`rb-${i}`} x={1248 + i * 16} y="456" width="10" height="22" fill="#0f0705"/>
        ))}

        {/* ── FOREGROUND COURTYARD WALL ── */}
        {/* Low perimeter wall with crenellations */}
        <rect x="0" y="618" width="1440" height="182" fill="#08040200"/>
        <rect x="0" y="618" width="1440" height="50" fill="#0b0503"/>
        {Array.from({ length: 72 }, (_, i) => (
          <rect key={`fw-${i}`} x={i * 20} y="598" width="12" height="22" fill="#0b0503"/>
        ))}

        {/* Ground fill */}
        <rect x="0" y="650" width="1440" height="150" fill="#070402"/>

        {/* Atmospheric warm light on wall base */}
        <rect
          x="0" y="580" width="1440" height="90"
          fill="url(#mhb-courtyard)"
          opacity="0.4"
        />
      </svg>

      {/* ── Atmospheric diya glow pools ── */}
      {[15, 35, 50, 65, 82].map((x, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${x}%`,
            bottom: `${8 + (i % 3) * 5}%`,
            width: '260px',
            height: '90px',
            background: 'radial-gradient(ellipse, rgba(220,110,18,0.14) 0%, transparent 68%)',
            transform: 'translateX(-50%)',
            animation: `glow-breathe ${3.2 + i * 0.65}s ${i * 0.9}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* ── Individual diya flames ── */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ height: '44%' }}
      >
        {DIYAS.map((d, i) => (
          <g
            key={i}
            style={{
              animation: `diya-flicker ${d.dur} ${d.delay} ease-in-out infinite`,
              transformOrigin: `${d.x}px ${d.y}px`,
            }}
          >
            {/* Wide outer glow */}
            <circle cx={d.x} cy={d.y} r={d.r * 3.8}
              fill={`hsla(${d.hue}, 90%, 52%, 0.08)`}/>
            {/* Mid glow */}
            <circle cx={d.x} cy={d.y} r={d.r * 2}
              fill={`hsla(${d.hue}, 95%, 60%, 0.3)`}/>
            {/* Bright inner glow */}
            <circle cx={d.x} cy={d.y} r={d.r * 0.9}
              fill={`hsla(${d.hue + 12}, 100%, 78%, 0.85)`}/>
            {/* White-hot core */}
            <circle cx={d.x} cy={d.y} r={d.r * 0.35}
              fill="rgba(255,240,200,0.95)"/>
          </g>
        ))}
      </svg>

      {/* ── Falling marigold petals ── */}
      {PETALS.map((p, i) => (
        <div
          key={i}
          className="absolute top-0"
          style={{
            left: `${p.x}%`,
            width: `${p.w}px`,
            height: `${p.h}px`,
            borderRadius: '50%',
            background: `hsla(${p.hue}, 95%, 52%, ${p.op})`,
            '--rot':  `${p.rot}deg`,
            '--sway': `${p.sway}px`,
            '--op':   p.op,
            animation: `petal-fall ${p.dur} ${p.delay} linear infinite`,
            filter: 'blur(0.4px)',
            boxShadow: `0 0 4px hsla(${p.hue}, 95%, 60%, 0.3)`,
          } as React.CSSProperties}
        />
      ))}

      {/* ── Subtle noise grain overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`,
          opacity: 0.55,
          mixBlendMode: 'overlay',
        }}
      />

    </div>
  )
}
