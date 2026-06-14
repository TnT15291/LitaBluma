import type { CSSProperties } from 'react';
import type { GardenStage } from '@/lib/domain/types';

/**
 * The living garden. A single self-contained SVG scene (sky, sun, hills, soil)
 * with a plant that genuinely grows from seed to a butterfly-filled tree as the
 * child builds habits. Gentle, reduced-motion-safe animation gives it life.
 *
 * No raster assets, no point numbers — just growth the child can feel.
 */

const sway: CSSProperties = { animation: 'sway 6s ease-in-out infinite', transformOrigin: '200px 252px' };
const rays: CSSProperties = { animation: 'sun-rays 90s linear infinite', transformOrigin: '320px 70px' };

export function GardenIllustration({ stage }: { stage: GardenStage }) {
  return (
    <svg
      viewBox="0 0 400 330"
      role="presentation"
      className="h-auto w-full"
      style={{ filter: 'drop-shadow(0 10px 24px oklch(0.3 0.06 150 / 0.18))' }}
    >
      <defs>
        <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-sky-300)" />
          <stop offset="42%" stopColor="var(--color-sky-100)" />
          <stop offset="100%" stopColor="var(--color-leaf-50)" />
        </linearGradient>
        <radialGradient id="g-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-sun-200)" />
          <stop offset="60%" stopColor="var(--color-sun-100)" />
          <stop offset="100%" stopColor="var(--color-sun-100)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="g-hill-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-leaf-200)" />
          <stop offset="100%" stopColor="var(--color-leaf-300)" />
        </linearGradient>
        <linearGradient id="g-hill-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-leaf-300)" />
          <stop offset="100%" stopColor="var(--color-leaf-400)" />
        </linearGradient>
        <radialGradient id="g-soil" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="var(--color-soil-200)" />
          <stop offset="100%" stopColor="var(--color-soil-300)" />
        </radialGradient>
        <linearGradient id="g-stem" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--color-leaf-600)" />
          <stop offset="100%" stopColor="var(--color-leaf-400)" />
        </linearGradient>
        <radialGradient id="g-leaf" cx="30%" cy="30%" r="80%">
          <stop offset="0%" stopColor="var(--color-leaf-300)" />
          <stop offset="100%" stopColor="var(--color-leaf-500)" />
        </radialGradient>
        <linearGradient id="g-trunk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-soil-400)" />
          <stop offset="50%" stopColor="var(--color-soil-300)" />
          <stop offset="100%" stopColor="var(--color-soil-400)" />
        </linearGradient>
        <radialGradient id="g-canopy" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="var(--color-leaf-400)" />
          <stop offset="100%" stopColor="var(--color-leaf-600)" />
        </radialGradient>
        <radialGradient id="g-bloom" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="var(--color-bloom-300)" />
          <stop offset="100%" stopColor="var(--color-bloom-500)" />
        </radialGradient>
      </defs>

      {/* Sky + sun */}
      <rect x="0" y="0" width="400" height="330" fill="url(#g-sky)" />
      <g style={rays}>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={i}
            x="318"
            y="22"
            width="4"
            height="22"
            rx="2"
            fill="var(--color-sun-300)"
            opacity="0.5"
            transform={`rotate(${i * 30} 320 70)`}
          />
        ))}
      </g>
      <circle cx="320" cy="70" r="74" fill="url(#g-sun)" />
      <circle cx="320" cy="70" r="26" fill="var(--color-sun-300)" />

      {/* Rolling hills */}
      <ellipse cx="110" cy="300" rx="200" ry="80" fill="url(#g-hill-back)" />
      <ellipse cx="330" cy="312" rx="180" ry="74" fill="url(#g-hill-back)" opacity="0.9" />

      {/* Soil mound */}
      <ellipse cx="200" cy="300" rx="150" ry="58" fill="url(#g-hill-front)" />
      <ellipse cx="200" cy="262" rx="78" ry="26" fill="url(#g-soil)" />

      {/* The plant */}
      <g style={sway}>{renderPlant(stage)}</g>

      {/* Ground tufts for detail */}
      <Tuft x={120} />
      <Tuft x={284} />

      {stage === 'butterflies' && <Butterflies />}
    </svg>
  );
}

function renderPlant(stage: GardenStage) {
  switch (stage) {
    case 'seed':
      return (
        <g>
          <ellipse cx="200" cy="258" rx="11" ry="7" fill="var(--color-soil-400)" />
          <path d="M200 256 q3 -10 10 -12" stroke="var(--color-leaf-400)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="211" cy="244" r="3.5" fill="var(--color-leaf-300)" />
        </g>
      );
    case 'sprout':
      return (
        <g>
          <rect x="197" y="206" width="6" height="50" rx="3" fill="url(#g-stem)" />
          <Leaf x={200} y={216} rotate={-42} scale={0.8} />
          <Leaf x={200} y={224} rotate={42} scale={0.8} />
        </g>
      );
    case 'plant':
      return (
        <g>
          <rect x="196" y="182" width="8" height="74" rx="4" fill="url(#g-stem)" />
          <Leaf x={200} y={196} rotate={-48} />
          <Leaf x={200} y={208} rotate={48} />
          <Leaf x={200} y={222} rotate={-40} scale={0.85} />
          <circle cx="200" cy="180" r="9" fill="var(--color-leaf-300)" />
        </g>
      );
    case 'flower':
      return (
        <g>
          <rect x="196" y="168" width="8" height="88" rx="4" fill="url(#g-stem)" />
          <Leaf x={200} y={210} rotate={-46} />
          <Leaf x={200} y={224} rotate={46} />
          <Flower cx={200} cy={158} />
        </g>
      );
    case 'tree':
      return <Tree />;
    case 'butterflies':
      return (
        <g>
          <Tree />
          <Flower cx={150} cy={250} scale={0.6} />
          <Flower cx={252} cy={252} scale={0.6} />
        </g>
      );
  }
}

function Tree() {
  return (
    <g>
      <rect x="190" y="176" width="20" height="86" rx="9" fill="url(#g-trunk)" />
      <circle cx="200" cy="138" r="58" fill="url(#g-canopy)" />
      <circle cx="158" cy="158" r="36" fill="url(#g-canopy)" />
      <circle cx="244" cy="156" r="38" fill="url(#g-canopy)" />
      <circle cx="200" cy="112" r="40" fill="url(#g-leaf)" opacity="0.55" />
      <circle cx="182" cy="150" r="6" fill="var(--color-bloom-300)" />
      <circle cx="226" cy="134" r="6" fill="var(--color-sun-300)" />
      <circle cx="206" cy="170" r="5" fill="var(--color-bloom-300)" />
    </g>
  );
}

function Leaf({ x, y, rotate, scale = 1 }: { x: number; y: number; rotate: number; scale?: number }) {
  return (
    <path
      d="M0 0 C 16 -10 30 -4 34 4 C 26 14 10 14 0 0 Z"
      fill="url(#g-leaf)"
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}
    />
  );
}

function Flower({ cx, cy, scale = 1 }: { cx: number; cy: number; scale?: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      {Array.from({ length: 6 }).map((_, i) => (
        <ellipse
          key={i}
          cx="0"
          cy="-15"
          rx="9"
          ry="15"
          fill="url(#g-bloom)"
          transform={`rotate(${i * 60})`}
        />
      ))}
      <circle cx="0" cy="0" r="10" fill="var(--color-sun-300)" />
    </g>
  );
}

function Tuft({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 286)`} fill="var(--color-leaf-500)" opacity="0.8">
      <path d="M0 0 q-3 -12 -6 -14 q5 1 7 12 z" />
      <path d="M2 0 q1 -14 3 -17 q3 4 0 17 z" />
      <path d="M4 0 q4 -11 8 -12 q-2 5 -5 12 z" />
    </g>
  );
}

function Butterflies() {
  return (
    <>
      <Butterfly x={96} y={96} delay={0} color="var(--color-bloom-400)" />
      <Butterfly x={300} y={150} delay={1.5} color="var(--color-sun-400)" />
      <Butterfly x={250} y={70} delay={0.8} color="var(--color-bloom-300)" />
    </>
  );
}

function Butterfly({ x, y, delay, color }: { x: number; y: number; delay: number; color: string }) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      style={{ animation: `drift ${5 + delay}s ease-in-out ${delay}s infinite` }}
    >
      <ellipse cx="-5" cy="-3" rx="6" ry="8" fill={color} transform="rotate(-24 -5 -3)" />
      <ellipse cx="5" cy="-3" rx="6" ry="8" fill={color} transform="rotate(24 5 -3)" />
      <ellipse cx="-4" cy="6" rx="4.5" ry="6" fill={color} opacity="0.85" transform="rotate(-18 -4 6)" />
      <ellipse cx="4" cy="6" rx="4.5" ry="6" fill={color} opacity="0.85" transform="rotate(18 4 6)" />
      <rect x="-1" y="-7" width="2" height="16" rx="1" fill="var(--color-soil-500)" />
    </g>
  );
}
