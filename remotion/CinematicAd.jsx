import React, { useState, useEffect } from 'react';
import {
  useCurrentFrame,
  spring, interpolate, Easing,
  Sequence, Video,
  delayRender, continueRender,
  staticFile,
} from 'remotion';
import { loadFont as loadBebas } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadDMMono } from '@remotion/google-fonts/DMMono';

const bebasFont  = loadBebas();
const dmMonoFont = loadDMMono();

// ─── Constants ────────────────────────────────────────────────────────────────
const W     = 1080;
const H     = 1920;
const CYAN  = '#00D4F0';
const AMBER = '#F59E0B';
const RED   = '#ef4444';
const GREEN = '#10b981';
const DARK  = '#04070f';
const WHITE = '#FFFFFF';
const BEBAS = "'Bebas Neue', sans-serif";
const MONO  = "'DM Mono', monospace";

// Scene frame boundaries (39s @ 30fps = 1170 frames)
// Act 1  0 – 150   (5s)   "You've been coaching for years"
// Act 2  150 – 360  (7s)   "But every morning you wake up guessing"
// Act 3  360 – 540  (6s)   "Until now / StrikePanel"
// Act 4  540 – 900  (12s)  "Every athlete scored / Your whole camp"
// Act 5  900 – 1110 (7s)   "Priya / Jake / Marcus / You already knew"
// Act 6  1110 – 1170 (2s)  "$99. Once. Yours forever."

// ─── Helpers ──────────────────────────────────────────────────────────────────
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

function sp(frame, from, to, damping = 14, stiffness = 160, mass = 1) {
  return spring({ frame, fps: 30, config: { damping, stiffness, mass }, from, to });
}

// ─── Video background ────────────────────────────────────────────────────────
class VideoFallback extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div style={{ position: 'absolute', inset: 0, background: this.props.fallbackColor || '#06090f' }} />;
    return this.props.children;
  }
}

function BgVideo({ src, brightness = 0.2, fallbackColor }) {
  return (
    <VideoFallback fallbackColor={fallbackColor}>
      <Video
        src={src}
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          minWidth: '100%', minHeight: '100%',
          objectFit: 'cover',
          filter: `brightness(${brightness}) saturate(0.8)`,
        }}
        volume={0}
      />
    </VideoFallback>
  );
}

// ─── Logo (crosshair) ────────────────────────────────────────────────────────
function LogoMark({ size = 100 }) {
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

// ─── Flash cut ───────────────────────────────────────────────────────────────
function FlashCut({ localFrame, durationIn = 5 }) {
  const opacity = localFrame < durationIn
    ? interpolate(localFrame, [0, durationIn], [1, 0])
    : 0;
  if (opacity <= 0) return null;
  return <div style={{ position: 'absolute', inset: 0, background: DARK, opacity, zIndex: 10, pointerEvents: 'none' }} />;
}

// ─── ACT 1: The Burden — frames 0–150 (5s) ───────────────────────────────────
function Act1({ localFrame }) {
  const bgFade = clamp(localFrame / 12, 0, 1);

  const line = (startFrame, text, size, color = WHITE) => {
    const age = clamp(localFrame - startFrame, 0, 999);
    const inSp = sp(age, 0, 1, 22, 120);
    return (
      <div style={{
        fontFamily: BEBAS, fontSize: size, lineHeight: 1.05, color,
        letterSpacing: '0.02em',
        opacity: inSp,
        transform: `translateY(${interpolate(inSp, [0, 1], [24, 0])}px)`,
      }}>
        {text}
      </div>
    );
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/boxer.mp4')} brightness={0.15} fallbackColor="#030507" />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.88) 100%)' }} />
      <div style={{
        position: 'absolute', left: 72, right: 72, top: '38%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 14, opacity: bgFade,
      }}>
        {line(12,  "You've been coaching", 100)}
        {line(12,  "for years.", 100, CYAN)}
        <div style={{ height: 14 }} />
        {line(55,  "Every fighter.", 88)}
        {line(75,  "Every camp.", 88)}
        <div style={{ height: 10 }} />
        {line(105, "You carry it all.", 128)}
      </div>
    </div>
  );
}

// ─── ACT 2: The Problem — frames 150–360 (7s) ────────────────────────────────
const CHAOS_MSGS = [
  { text: "Jake: weight stuck at 143.2",     x: 60,  y: 160, rot: -1.2, delay: 8  },
  { text: "Priya: shoulder feels off tbh",    x: 380, y: 240, rot: 1.5,  delay: 22 },
  { text: "Marcus: didn't sleep, stressed",   x: 50,  y: 380, rot: -0.8, delay: 36 },
  { text: "Sparring tomorrow — who's ready?", x: 300, y: 480, rot: 1.2,  delay: 50 },
  { text: "Is the cut happening tmrw??",      x: 70,  y: 590, rot: -1.5, delay: 62 },
];

function Act2({ localFrame }) {
  const line = (startFrame, text, size, color = WHITE) => {
    const age = clamp(localFrame - startFrame, 0, 999);
    const inSp = sp(age, 0, 1, 22, 120);
    return (
      <div style={{
        fontFamily: BEBAS, fontSize: size, lineHeight: 1.05, color,
        letterSpacing: '0.02em',
        opacity: inSp,
        transform: `translateX(${interpolate(inSp, [0, 1], [-36, 0])}px)`,
      }}>
        {text}
      </div>
    );
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/boxer.mp4')} brightness={0.2} fallbackColor="#060810" />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,7,15,0.5) 0%, rgba(4,7,15,0.85) 100%)' }} />

      {/* Chaos message bubbles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {CHAOS_MSGS.map((m, i) => {
          const age = clamp(localFrame - m.delay, 0, 999);
          const inSp = sp(age, 0, 1, 14, 180);
          return (
            <div key={i} style={{
              position: 'absolute', left: m.x, top: m.y,
              background: 'rgba(0,200,80,0.12)', border: '1px solid rgba(0,200,80,0.25)',
              borderRadius: 12, padding: '10px 18px',
              opacity: inSp * 0.35,
              transform: `rotate(${m.rot}deg) translateY(${interpolate(inSp, [0, 1], [-20, 0])}px)`,
            }}>
              <span style={{ fontFamily: MONO, fontSize: 26, color: 'rgba(255,255,255,0.8)' }}>{m.text}</span>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', left: 72, right: 72, bottom: '28%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {line(10,  "But every morning", 88)}
        {line(10,  "you wake up guessing.", 88, AMBER)}
        <div style={{ height: 10 }} />
        {line(72,  "Who's ready? Who's not?", 80)}
        {line(110, "Is the cut on track?", 80)}
        <div style={{ height: 14 }} />
        {line(150, "You don't know.", 130, AMBER)}
        {line(183, "You never know.", 100, RED)}
      </div>
    </div>
  );
}

// ─── ACT 3: The Shift — frames 360–540 (6s) ──────────────────────────────────
function Act3({ localFrame }) {
  const untilNowIn = sp(clamp(localFrame - 25, 0, 999), 0, 1, 28, 70);
  const logoScale  = sp(clamp(localFrame - 85, 0, 999), 0, 1, 20, 100);
  const wordIn     = sp(clamp(localFrame - 108, 0, 999), 0, 1, 14, 140);
  const tagIn      = sp(clamp(localFrame - 132, 0, 999), 0, 1, 16, 120);
  const glowOp     = interpolate(localFrame, [80, 140], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const doParticles = localFrame > 90 && localFrame < 170;
  const age = localFrame - 91;

  return (
    <div style={{ position: 'absolute', inset: 0, background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        position: 'absolute', width: 700, height: 700, borderRadius: '50%',
        background: `radial-gradient(circle, ${CYAN}18 0%, transparent 65%)`,
        opacity: glowOp, top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      }} />

      {doParticles && (
        <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }} width={W} height={H}>
          {Array.from({ length: 28 }, (_, i) => {
            const angle = (i / 28) * Math.PI * 2 + i * 0.28;
            const speed = 5 + (i % 6) * 2.8;
            const life  = clamp(age / 45, 0, 1);
            const x     = W / 2 + Math.cos(angle) * speed * age;
            const y     = H / 2 + Math.sin(angle) * speed * age - 0.018 * age * age;
            const alpha = interpolate(life, [0, 0.25, 1], [0, 1, 0]);
            const r     = interpolate(life, [0, 0.4, 1], [0, 3 + (i % 4), 1]);
            const col   = i % 3 === 0 ? CYAN : i % 3 === 1 ? AMBER : WHITE;
            return <circle key={i} cx={x} cy={y} r={r} fill={col} opacity={alpha} />;
          })}
        </svg>
      )}

      <div style={{ position: 'absolute', top: '28%', left: 0, right: 0, textAlign: 'center',
        fontFamily: BEBAS, fontSize: 180, color: WHITE, letterSpacing: '0.04em',
        opacity: untilNowIn,
        transform: `translateY(${interpolate(untilNowIn, [0, 1], [40, 0])}px)`,
        textShadow: `0 0 120px ${WHITE}22`,
      }}>
        Until now.
      </div>

      <div style={{ position: 'absolute', bottom: '26%', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ transform: `scale(${logoScale})`, filter: 'drop-shadow(0 0 30px rgba(0,212,240,0.6))' }}>
          <LogoMark size={120} />
        </div>
        <div style={{
          fontFamily: BEBAS, fontSize: 120, letterSpacing: '0.07em', color: WHITE,
          opacity: wordIn, transform: `translateY(${interpolate(wordIn, [0, 1], [18, 0])}px)`,
          textShadow: `0 0 60px ${CYAN}55`,
        }}>
          STRIKE<span style={{ color: CYAN }}>PANEL</span>
        </div>
        <div style={{
          fontFamily: MONO, fontSize: 24, letterSpacing: '0.3em', color: CYAN,
          opacity: tagIn, transform: `translateY(${interpolate(tagIn, [0, 1], [10, 0])}px)`,
        }}>
          TRAINING INTELLIGENCE
        </div>
      </div>
    </div>
  );
}

// ─── ACT 4: The Product — frames 540–900 (12s) ───────────────────────────────
const ATHLETES = [
  { name: 'Priya',  score: 91, color: GREEN, badge: 'Push Hard' },
  { name: 'Jake',   score: 74, color: CYAN,  badge: 'Train Normal' },
  { name: 'Marcus', score: 38, color: RED,   badge: 'Rest Day' },
];

function MorningBriefWidget({ localFrame }) {
  const widgetIn = sp(clamp(localFrame - 8, 0, 999), 0, 1, 16, 140);
  return (
    <div style={{
      background: 'rgba(4,7,15,0.92)', border: `1px solid ${CYAN}55`,
      borderRadius: 28, padding: '36px 42px', width: 580,
      boxShadow: `0 0 80px ${CYAN}1A`,
      opacity: widgetIn, transform: `translateX(${interpolate(widgetIn, [0, 1], [60, 0])}px)`,
    }}>
      <div style={{ fontFamily: MONO, fontSize: 18, color: CYAN, letterSpacing: '0.3em', marginBottom: 28, opacity: 0.8 }}>
        ◎ MORNING BRIEF
      </div>
      {ATHLETES.map((a, i) => {
        const rowIn = sp(clamp(localFrame - 25 - i * 16, 0, 999), 0, 1, 16, 170);
        const scoreVal = Math.round(interpolate(
          clamp(localFrame - 48, 0, 50),
          [0, 50], [0, a.score],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) },
        ));
        const barFill = interpolate(
          clamp(localFrame - 48, 0, 60),
          [0, 60], [0, a.score],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );
        return (
          <div key={a.name} style={{
            marginBottom: 24, opacity: rowIn,
            transform: `translateX(${interpolate(rowIn, [0, 1], [-24, 0])}px)`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <span style={{ fontFamily: MONO, color: WHITE, fontSize: 22 }}>{a.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: MONO, fontSize: 18, color: a.color, letterSpacing: '0.15em' }}>{a.badge}</span>
                <span style={{ fontFamily: BEBAS, color: a.color, fontSize: 44, lineHeight: 1 }}>{scoreVal}</span>
              </div>
            </div>
            <div style={{ height: 7, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
              <div style={{ height: '100%', width: `${barFill}%`, background: a.color, borderRadius: 4 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FightCampCard({ localFrame }) {
  const cardIn = sp(clamp(localFrame - 210, 0, 999), 0, 1, 16, 140);
  const barW   = interpolate(clamp(localFrame - 228, 0, 55), [0, 55], [0, 78], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{
      background: 'rgba(4,7,15,0.88)', border: `1px solid ${AMBER}44`,
      borderRadius: 20, padding: '28px 38px', width: 580,
      opacity: cardIn, transform: `translateX(${interpolate(cardIn, [0, 1], [60, 0])}px)`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontFamily: MONO, fontSize: 18, color: AMBER, letterSpacing: '0.25em' }}>FIGHT CAMP</span>
        <span style={{ fontFamily: BEBAS, fontSize: 28, color: WHITE, letterSpacing: '0.1em' }}>DAY 18 / 23</span>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 14 }}>
        <div style={{ height: '100%', width: `${barW}%`, background: AMBER, borderRadius: 4 }} />
      </div>
      <div style={{ fontFamily: MONO, fontSize: 20, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.15em' }}>
        5 DAYS TO WEIGH-IN
      </div>
    </div>
  );
}

function Act4({ localFrame }) {
  const tLine = (startFrame, text, size, color = WHITE) => {
    const age = clamp(localFrame - startFrame, 0, 999);
    const inSp = sp(age, 0, 1, 18, 130);
    return (
      <div style={{
        fontFamily: BEBAS, fontSize: size, color, letterSpacing: '0.03em', lineHeight: 1.05,
        opacity: inSp, transform: `translateY(${interpolate(inSp, [0, 1], [18, 0])}px)`,
      }}>
        {text}
      </div>
    );
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/boxer.mp4')} brightness={0.18} fallbackColor="#05080f" />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, rgba(4,7,15,0.72) 0%, rgba(0,212,240,0.06) 100%)` }} />
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 72px',
      }}>
        <MorningBriefWidget localFrame={localFrame} />
        <div style={{ width: 580, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tLine(100, "Every athlete. Scored.", 82)}
          {tLine(130, "Every morning.", 82)}
          {tLine(158, "Before you leave the house.", 68, CYAN)}
        </div>
        <FightCampCard localFrame={localFrame} />
        <div style={{ textAlign: 'center' }}>
          {tLine(285, "Your whole camp.", 90)}
          {tLine(305, "One place.", 90, CYAN)}
        </div>
      </div>
    </div>
  );
}

// ─── ACT 5: The Result — frames 900–1110 (7s) ────────────────────────────────
const RESULT_ATHLETES = [
  { name: 'Priya',  call: 'Push hard.',    color: GREEN },
  { name: 'Jake',   call: 'Train normal.', color: CYAN  },
  { name: 'Marcus', call: 'Rest day.',     color: RED   },
];

function Act5({ localFrame }) {
  const knewIn = sp(clamp(localFrame - 148, 0, 999), 0, 1, 22, 90);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#020509', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,212,240,0.04) 0%, transparent 70%)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '0 72px', width: '100%' }}>
        {RESULT_ATHLETES.map((a, i) => {
          const rowIn = sp(clamp(localFrame - i * 46, 0, 999), 0, 1, 18, 140);
          return (
            <div key={a.name} style={{
              display: 'flex', alignItems: 'baseline', gap: 24,
              borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              paddingBottom: 28, marginBottom: 28,
              opacity: rowIn, transform: `translateX(${interpolate(rowIn, [0, 1], [-50, 0])}px)`,
            }}>
              <span style={{ fontFamily: BEBAS, fontSize: 130, color: WHITE, letterSpacing: '0.04em', lineHeight: 1, flex: 1 }}>{a.name}</span>
              <span style={{ fontFamily: MONO, fontSize: 30, color: a.color, letterSpacing: '0.15em', lineHeight: 1 }}>{a.call}</span>
            </div>
          );
        })}
        <div style={{
          marginTop: 20, fontFamily: BEBAS, fontSize: 110, color: WHITE,
          letterSpacing: '0.03em', lineHeight: 1.05,
          opacity: knewIn, transform: `translateY(${interpolate(knewIn, [0, 1], [28, 0])}px)`,
          textShadow: `0 0 80px ${WHITE}22`,
        }}>
          You already knew.
        </div>
      </div>
    </div>
  );
}

// ─── ACT 6: CTA — frames 1110–1170 (2s) ─────────────────────────────────────
function Act6({ localFrame }) {
  const logoScale = sp(clamp(localFrame - 2, 0, 999), 0, 1, 16, 180);
  const wordIn    = sp(clamp(localFrame - 10, 0, 999), 0, 1, 16, 200);
  const l1In      = sp(clamp(localFrame - 18, 0, 999), 0, 1, 16, 200);
  const l2In      = sp(clamp(localFrame - 26, 0, 999), 0, 1, 16, 200);
  const priceIn   = sp(clamp(localFrame - 36, 0, 999), 0, 1, 14, 200);
  const topBar    = interpolate(localFrame, [0, 12], [0, 1080], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, height: 5, width: topBar, background: CYAN }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ transform: `scale(${logoScale})`, filter: 'drop-shadow(0 0 30px rgba(0,212,240,0.5))' }}>
          <LogoMark size={90} />
        </div>
        <div style={{
          fontFamily: BEBAS, fontSize: 110, letterSpacing: '0.06em', color: WHITE,
          opacity: wordIn, transform: `translateY(${interpolate(wordIn, [0, 1], [14, 0])}px)`,
          textShadow: `0 0 50px ${CYAN}44`,
        }}>
          STRIKE<span style={{ color: CYAN }}>PANEL™</span>
        </div>
        <div style={{
          fontFamily: BEBAS, fontSize: 68, color: WHITE, letterSpacing: '0.03em',
          opacity: l1In, transform: `translateY(${interpolate(l1In, [0, 1], [12, 0])}px)`, textAlign: 'center',
        }}>
          Know who to push.
        </div>
        <div style={{
          fontFamily: BEBAS, fontSize: 68, color: CYAN, letterSpacing: '0.03em',
          opacity: l2In, transform: `translateY(${interpolate(l2In, [0, 1], [12, 0])}px)`, textAlign: 'center',
        }}>
          Know who to protect.
        </div>
        <div style={{
          fontFamily: MONO, fontSize: 28, color: AMBER, letterSpacing: '0.18em',
          opacity: priceIn, transform: `translateY(${interpolate(priceIn, [0, 1], [8, 0])}px)`,
          textAlign: 'center', marginTop: 8,
        }}>
          $99. Once. Yours forever.
        </div>
        <div style={{ fontFamily: MONO, fontSize: 20, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', opacity: priceIn }}>
          strikepanel.vercel.app/demo
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
    <div style={{ width: W, height: H, background: DARK, overflow: 'hidden' }}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="overlay" />
          </filter>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, zIndex: 99, pointerEvents: 'none', filter: 'url(#grain)', opacity: 0.045, background: WHITE }} />

      <Sequence from={0}    durationInFrames={150}>
        <Act1 localFrame={frame - 0} />
        <FlashCut localFrame={frame - 0} />
      </Sequence>
      <Sequence from={150}  durationInFrames={210}>
        <Act2 localFrame={frame - 150} />
        <FlashCut localFrame={frame - 150} />
      </Sequence>
      <Sequence from={360}  durationInFrames={180}>
        <Act3 localFrame={frame - 360} />
        <FlashCut localFrame={frame - 360} />
      </Sequence>
      <Sequence from={540}  durationInFrames={360}>
        <Act4 localFrame={frame - 540} />
        <FlashCut localFrame={frame - 540} />
      </Sequence>
      <Sequence from={900}  durationInFrames={210}>
        <Act5 localFrame={frame - 900} />
        <FlashCut localFrame={frame - 900} />
      </Sequence>
      <Sequence from={1110} durationInFrames={60}>
        <Act6 localFrame={frame - 1110} />
        <FlashCut localFrame={frame - 1110} />
      </Sequence>
    </div>
  );
}
