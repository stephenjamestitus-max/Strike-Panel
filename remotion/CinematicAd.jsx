import React, { useState, useEffect, useRef } from 'react';
import {
  useCurrentFrame, useVideoConfig,
  spring, interpolate, Easing,
  Sequence, Video, Audio,
  delayRender, continueRender,
  staticFile,
} from 'remotion';
import { loadFont as loadBebas } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadDMMono } from '@remotion/google-fonts/DMMono';

const bebasFont  = loadBebas();
const dmMonoFont = loadDMMono();

// ─── Constants ────────────────────────────────────────────────────────────────
const W = 1080;
const H = 1920;
const CYAN   = '#00D4F0';
const AMBER  = '#F59E0B';
const DARK   = '#04070f';
const WHITE  = '#FFFFFF';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

function sp(frame, from, to, damping = 12, stiffness = 180, mass = 1) {
  return spring({ frame, fps: 30, config: { damping, stiffness, mass }, from, to });
}

// ─── ErrorBoundary for Video ──────────────────────────────────────────────────
class VideoFallback extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) {
      return (
        <div style={{
          position: 'absolute', inset: 0,
          background: this.props.fallbackColor || '#0a0f1a',
        }} />
      );
    }
    return this.props.children;
  }
}

function BgVideo({ src, fallbackColor, opacity = 1 }) {
  return (
    <VideoFallback fallbackColor={fallbackColor}>
      <Video
        src={src}
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: '100%', minHeight: '100%',
          objectFit: 'cover',
          opacity,
          filter: 'brightness(0.45) saturate(1.3)',
        }}
        volume={0}
      />
    </VideoFallback>
  );
}

// ─── Particles ────────────────────────────────────────────────────────────────
function Particles({ count = 30, frame, startFrame }) {
  const age = frame - startFrame;
  return (
    <svg
      style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
      width={W} height={H}
    >
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + i * 0.31;
        const speed = 6 + (i % 7) * 2.5;
        const life  = clamp(age / 40, 0, 1);
        const x     = W / 2 + Math.cos(angle) * speed * age;
        const y     = H / 2 + Math.sin(angle) * speed * age - 0.5 * age * age * 0.04;
        const alpha = interpolate(life, [0, 0.3, 1], [0, 1, 0]);
        const r     = interpolate(life, [0, 0.4, 1], [0, 4 + (i % 4), 1]);
        const color = i % 3 === 0 ? CYAN : i % 3 === 1 ? AMBER : WHITE;
        return (
          <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={alpha} />
        );
      })}
    </svg>
  );
}

// ─── RGB Glitch ───────────────────────────────────────────────────────────────
function GlitchText({ children, style, active }) {
  if (!active) return <div style={style}>{children}</div>;
  const shift = 4;
  return (
    <div style={{ position: 'relative', ...style }}>
      <div style={{ position: 'absolute', color: '#ff0040', left: -shift, top: shift, opacity: 0.7 }}>{children}</div>
      <div style={{ position: 'absolute', color: '#00ffee', left:  shift, top: -shift, opacity: 0.7 }}>{children}</div>
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}

// ─── Scene 1: Cold open (frames 0–90) ────────────────────────────────────────
function Scene1({ frame }) {
  const wordIn = sp(frame - 20, 0, 1, 10, 260);
  return (
    <div style={{ position: 'absolute', inset: 0, background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%)',
      }} />
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 160,
        lineHeight: 0.95,
        color: WHITE,
        textAlign: 'center',
        letterSpacing: '0.04em',
        transform: `translateY(${interpolate(wordIn, [0, 1], [60, 0])}px)`,
        opacity: wordIn,
        textShadow: `0 0 80px ${CYAN}55`,
        padding: '0 60px',
      }}>
        EVERY<br />
        <span style={{ color: CYAN }}>MORNING.</span>
      </div>
      {/* Bottom rule */}
      <div style={{
        position: 'absolute', bottom: 160, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          width: interpolate(frame, [40, 80], [0, 320], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          height: 2,
          background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)`,
        }} />
      </div>
    </div>
  );
}

// ─── Scene 2: Pain points (frames 90–270) ────────────────────────────────────
const PAIN_LINES = [
  { text: 'MOST COACHES', start: 0,  color: WHITE  },
  { text: 'ARE COACHING BLIND.', start: 22, color: WHITE  },
  { text: '',                  start: 44, color: WHITE  },
  { text: 'NO READINESS DATA.', start: 55, color: AMBER  },
  { text: 'NO LOAD DATA.',       start: 77, color: AMBER  },
  { text: 'NO PLAN.',            start: 99, color: AMBER  },
  { text: '',                    start: 120, color: WHITE },
  { text: 'JUST VIBES.',         start: 131, color: '#ef4444' },
];

function Scene2({ frame }) {
  const localFrame = frame - 90;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/boxer.mp4')} fallbackColor="#080d15" />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(4,7,15,0.6) 0%, rgba(4,7,15,0.3) 50%, rgba(4,7,15,0.8) 100%)',
      }} />
      <div style={{
        position: 'absolute', left: 60, right: 60,
        top: '50%', transform: 'translateY(-50%)',
      }}>
        {PAIN_LINES.filter(l => l.text).map((line, idx) => {
          const age = localFrame - line.start;
          const inVal = age >= 0 ? sp(age, 0, 1, 14, 200) : 0;
          return (
            <div key={idx} style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 88,
              lineHeight: 1.05,
              color: line.color,
              letterSpacing: '0.03em',
              opacity: inVal,
              transform: `translateX(${interpolate(inVal, [0, 1], [-40, 0])}px)`,
              marginBottom: 8,
            }}>
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Scene 3: Logo reveal + particles (frames 270–450) ───────────────────────
function LogoMark({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
      <circle cx="45" cy="45" r="43" fill="#0b0d14" stroke="#00D4F0" strokeWidth="1.5" />
      <circle cx="45" cy="45" r="29" fill="none" stroke="#00D4F0" strokeWidth="0.9" strokeOpacity="0.3" />
      <line x1="45" y1="2"  x2="45" y2="26" stroke="#00D4F0" strokeWidth="3" strokeLinecap="round" />
      <line x1="45" y1="64" x2="45" y2="88" stroke="#00D4F0" strokeWidth="3" strokeLinecap="round" />
      <line x1="2"  y1="45" x2="26" y2="45" stroke="#00D4F0" strokeWidth="3" strokeLinecap="round" />
      <line x1="64" y1="45" x2="88" y2="45" stroke="#00D4F0" strokeWidth="3" strokeLinecap="round" />
      <circle cx="45" cy="45" r="11" fill="#00D4F0" />
    </svg>
  );
}

function Scene3({ frame }) {
  const localFrame = frame - 270;
  const logoScale = sp(clamp(localFrame - 10, 0, 999), 0, 1, 20, 100);
  const glowVal   = interpolate(localFrame, [20, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const wordIn    = sp(clamp(localFrame - 35, 0, 999), 0, 1, 12, 160);
  const tagIn     = sp(clamp(localFrame - 55, 0, 999), 0, 1, 14, 140);
  const doParticles = localFrame > 45 && localFrame < 140;

  return (
    <div style={{ position: 'absolute', inset: 0, background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        width: 600, height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${CYAN}22 0%, transparent 70%)`,
        opacity: glowVal,
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
      }} />

      {doParticles && <Particles count={30} frame={localFrame} startFrame={46} />}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {/* Logo — own spring, completely static otherwise */}
        <div style={{
          transform: `scale(${logoScale})`,
          filter: 'drop-shadow(0 0 30px rgba(0,212,240,0.6))',
        }}>
          <LogoMark size={120} />
        </div>

        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 130,
          letterSpacing: '0.06em',
          color: WHITE,
          opacity: wordIn,
          transform: `translateY(${interpolate(wordIn, [0, 1], [20, 0])}px)`,
          textShadow: `0 0 60px ${CYAN}66`,
        }}>
          STRIKE<span style={{ color: CYAN }}>PANEL</span>
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 26,
          letterSpacing: '0.35em',
          color: CYAN,
          opacity: tagIn,
          transform: `translateY(${interpolate(tagIn, [0, 1], [12, 0])}px)`,
        }}>
          TRAINING INTELLIGENCE
        </div>
      </div>
    </div>
  );
}

// ─── Scene 4: Widget demo (frames 450–720) ───────────────────────────────────
function MiniWidget({ frame, localFrame }) {
  const athletes = [
    { name: 'Priya',  score: 91, color: '#10b981', badge: 'Push Hard' },
    { name: 'Jake',   score: 74, color: CYAN,       badge: 'Train Normal' },
    { name: 'Marcus', score: 38, color: '#ef4444',  badge: 'Rest Day' },
  ];

  const widgetIn = sp(clamp(localFrame - 20, 0, 999), 0, 1, 14, 160);

  return (
    <div style={{
      background: 'rgba(4, 7, 15, 0.88)',
      border: `1px solid ${CYAN}44`,
      borderRadius: 24,
      padding: '32px 36px',
      width: 520,
      backdropFilter: 'blur(20px)',
      transform: `translateX(${interpolate(widgetIn, [0, 1], [80, 0])}px)`,
      opacity: widgetIn,
      boxShadow: `0 0 60px ${CYAN}22`,
    }}>
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 18,
        color: CYAN,
        letterSpacing: '0.3em',
        marginBottom: 24,
        opacity: 0.8,
      }}>
        MORNING BRIEF
      </div>
      {athletes.map((a, i) => {
        const rowIn = sp(clamp(localFrame - 40 - i * 15, 0, 999), 0, 1, 14, 180);
        const scoreVal = Math.round(interpolate(
          clamp(localFrame - 60, 0, 50),
          [0, 50], [0, a.score],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) },
        ));
        const barFill = interpolate(
          clamp(localFrame - 60, 0, 60),
          [0, 60], [0, a.score],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );

        return (
          <div key={a.name} style={{
            marginBottom: 20,
            opacity: rowIn,
            transform: `translateX(${interpolate(rowIn, [0, 1], [-30, 0])}px)`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", color: WHITE, fontSize: 20 }}>{a.name}</span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", color: a.color, fontSize: 36, lineHeight: 1 }}>{scoreVal}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
              <div style={{ height: '100%', width: `${barFill}%`, background: a.color, borderRadius: 3 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Scene4({ frame }) {
  const localFrame = frame - 450;
  const textIn1 = sp(clamp(localFrame - 130, 0, 999), 0, 1, 12, 180);
  const textIn2 = sp(clamp(localFrame - 160, 0, 999), 0, 1, 12, 180);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/boxer.mp4')} fallbackColor="#06101a" />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(4,7,15,0.7) 0%, rgba(0,212,240,0.08) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 48, padding: '0 60px',
      }}>
        <MiniWidget frame={frame} localFrame={localFrame} />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 96,
            color: WHITE,
            letterSpacing: '0.04em',
            lineHeight: 1,
            opacity: textIn1,
            transform: `translateY(${interpolate(textIn1, [0, 1], [30, 0])}px)`,
          }}>
            KNOW WHO TO PUSH.
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 96,
            color: AMBER,
            letterSpacing: '0.04em',
            lineHeight: 1,
            opacity: textIn2,
            transform: `translateY(${interpolate(textIn2, [0, 1], [30, 0])}px)`,
          }}>
            KNOW WHO TO PROTECT.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scene 5: Feature flash cuts (frames 720–810) ────────────────────────────
const FEATURES = [
  { text: 'MORNING BRIEF',       sub: 'Daily athlete readiness',   color: CYAN        },
  { text: 'FIGHT CAMP',          sub: 'Camp load & phase tracking', color: AMBER       },
  { text: 'WEIGHT CUT PLANNER',  sub: 'Cut timeline & safety',     color: '#10b981'   },
  { text: 'AI SESSIONS',         sub: 'Auto-generated session plans', color: '#8b5cf6' },
];

function Scene5({ frame }) {
  const localFrame = frame - 720;
  const cutLen = 22;
  const cutIdx = Math.floor(localFrame / cutLen);
  const cutAge = localFrame % cutLen;
  const feat = FEATURES[clamp(cutIdx, 0, FEATURES.length - 1)];
  const isGlitch = cutAge < 4;

  const fadeIn = interpolate(cutAge, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/boxer.mp4')} fallbackColor="#080c14" />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(4,7,15,0.55)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 16,
      }}>
        <GlitchText
          active={isGlitch}
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 120,
            color: feat.color,
            letterSpacing: '0.04em',
            lineHeight: 1,
            opacity: fadeIn,
            textShadow: `0 0 40px ${feat.color}88`,
          }}
        >
          {feat.text}
        </GlitchText>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 28,
          color: 'rgba(255,255,255,0.6)',
          letterSpacing: '0.2em',
          opacity: fadeIn,
        }}>
          {feat.sub}
        </div>
      </div>
      {/* Scan line on glitch */}
      {isGlitch && (
        <div style={{
          position: 'absolute', left: 0, right: 0,
          top: `${20 + (cutAge * 8)}%`,
          height: 3,
          background: `${feat.color}88`,
        }} />
      )}
    </div>
  );
}

// ─── Scene 6: CTA (frames 810–900) ───────────────────────────────────────────
function Scene6({ frame }) {
  const localFrame = frame - 810;

  const bgIn  = interpolate(localFrame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const p1In  = sp(clamp(localFrame - 10, 0, 999), 0, 1, 12, 180);
  const p2In  = sp(clamp(localFrame - 28, 0, 999), 0, 1, 12, 180);
  const p3In  = sp(clamp(localFrame - 46, 0, 999), 0, 1, 12, 180);
  const ctaIn = sp(clamp(localFrame - 60, 0, 999), 0, 1, 10, 200);

  const price = Math.round(interpolate(
    clamp(localFrame - 15, 0, 35),
    [0, 35], [0, 99],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) },
  ));

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: DARK,
      opacity: bgIn,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 0,
    }}>
      {/* Cyan top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 6,
        background: CYAN,
        scaleX: p1In,
        transformOrigin: 'left',
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
        {/* Price */}
        <div style={{
          opacity: p1In,
          transform: `translateY(${interpolate(p1In, [0, 1], [40, 0])}px)`,
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 200,
            color: CYAN,
            lineHeight: 0.85,
            letterSpacing: '0.02em',
            textShadow: `0 0 100px ${CYAN}66`,
          }}>
            ${price}
          </div>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 22,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.25em',
          }}>
            ONE-TIME
          </div>
        </div>

        {/* No sub */}
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 64,
          color: AMBER,
          letterSpacing: '0.04em',
          opacity: p2In,
          transform: `translateY(${interpolate(p2In, [0, 1], [20, 0])}px)`,
        }}>
          NO SUBSCRIPTION. EVER.
        </div>

        {/* URL */}
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 30,
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: '0.18em',
          opacity: p3In,
        }}>
          strikepanel.vercel.app/demo
        </div>

        {/* CTA button */}
        <div style={{
          marginTop: 24,
          border: `2px solid ${CYAN}`,
          borderRadius: 60,
          padding: '20px 64px',
          opacity: ctaIn,
          transform: `scale(${interpolate(ctaIn, [0, 1], [0.85, 1])})`,
          boxShadow: `0 0 40px ${CYAN}44`,
        }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 44,
            color: WHITE,
            letterSpacing: '0.12em',
          }}>
            GET EARLY ACCESS
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Root composition ─────────────────────────────────────────────────────────
export function CinematicAd() {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender('fonts'));

  useEffect(() => {
    Promise.all([bebasFont.waitUntilDone(), dmMonoFont.waitUntilDone()])
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);

  return (
    <div style={{
      width: W, height: H,
      background: DARK,
      overflow: 'hidden',
      fontFamily: "'Bebas Neue', sans-serif",
    }}>
      {/* Global film grain */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="overlay" />
          </filter>
        </defs>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 99, pointerEvents: 'none',
        filter: 'url(#grain)', opacity: 0.04,
        background: WHITE,
      }} />

      {/* Scenes */}
      <Sequence from={0}   durationInFrames={90}>
        <Scene1 frame={frame} />
      </Sequence>
      <Sequence from={90}  durationInFrames={180}>
        <Scene2 frame={frame} />
      </Sequence>
      <Sequence from={270} durationInFrames={180}>
        <Scene3 frame={frame} />
      </Sequence>
      <Sequence from={450} durationInFrames={270}>
        <Scene4 frame={frame} />
      </Sequence>
      <Sequence from={720} durationInFrames={90}>
        <Scene5 frame={frame} />
      </Sequence>
      <Sequence from={810} durationInFrames={90}>
        <Scene6 frame={frame} />
      </Sequence>
    </div>
  );
}
