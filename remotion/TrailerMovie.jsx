import React, { useState, useEffect } from 'react';
import {
  useCurrentFrame, spring, interpolate, Easing,
  Sequence, OffthreadVideo, delayRender, continueRender, staticFile,
} from 'remotion';
import { loadFont as loadBebas } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadDMMono } from '@remotion/google-fonts/DMMono';

const bebasFont  = loadBebas();
const dmMonoFont = loadDMMono();

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

// Standard cinematic grade
const GB = 0.55, GC = 1.4, GS = 0.7, GSP = 0.3;

const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  angle:   (i / 40) * Math.PI * 2 + (i % 7) * 0.31,
  maxDist: 200 + (i % 8) * 25,
  size:    1.5 + (i % 4),
  delay:   (i % 5) * 2,
  color:   i % 4 === 0 ? CYAN : i % 4 === 1 ? AMBER : i % 4 === 2 ? WHITE : '#8b5cf6',
}));

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function sp(frame, from = 0, to = 1, damping = 12, stiffness = 160) {
  return spring({ frame, fps: 30, config: { damping, stiffness }, from, to });
}

// ─── Error boundary ───────────────────────────────────────────────────────────
class VideoFallback extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div style={{ position: 'absolute', inset: 0, background: this.props.fallbackColor || '#030507' }} />;
    return this.props.children;
  }
}

function BgVideo({ src, startFrom = 0, brightness = GB, contrast = GC, saturate = GS, sepia = GSP, fallbackColor, transformExtra = '' }) {
  return (
    <VideoFallback fallbackColor={fallbackColor}>
      <OffthreadVideo
        src={src}
        startFrom={startFrom}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: `translate(-50%,-50%) ${transformExtra}`,
          minWidth: '100%', minHeight: '100%', objectFit: 'cover',
          filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturate}) sepia(${sepia})`,
        }}
        volume={0}
      />
    </VideoFallback>
  );
}

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
      <text x="45" y="49" fontFamily="'Barlow Condensed', sans-serif" fontSize="9" fontWeight="800"
        fill="#0b0d14" textAnchor="middle" letterSpacing="0.5">SP</text>
    </svg>
  );
}

function Scanlines() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 88,
      background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)',
      opacity: 0.04,
    }} />
  );
}

function CutFlash({ lf, at = 0 }) {
  const age = lf - at;
  if (age < 0 || age > 3) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, background: WHITE, zIndex: 50, pointerEvents: 'none',
      opacity: interpolate(age, [0, 3], [0.9, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    }} />
  );
}

function Vignette({ color }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `radial-gradient(ellipse at center, transparent 35%, ${color} 100%)`,
    }} />
  );
}

// Subtle Ken Burns — 5% movement over 150 frames
function kb(lf, motion) {
  const t = interpolate(lf, [0, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (motion === 'zoom-in')   return `scale(${1 + 0.05 * t})`;
  if (motion === 'zoom-out')  return `scale(${1.05 - 0.05 * t})`;
  if (motion === 'pan-left')  return `translateX(${-27 * t}px)`;
  if (motion === 'pan-right') return `translateX(${27 * (1 - t)}px)`;
  if (motion === 'tilt-up')   return `translateY(${22 * (1 - t)}px)`;
  if (motion === 'tilt-down') return `translateY(${-22 * (1 - t)}px)`;
  return '';
}

function GradOverlay() {
  return <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,7,15,0.5) 0%, rgba(4,7,15,0.05) 50%, rgba(4,7,15,0.72) 100%)' }} />;
}

// ─── CLIP 1 — Alarm (0–5s) ────────────────────────────────────────────────────
function Clip1({ lf }) {
  const titleOp = interpolate(lf, [20, 34], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const subOp   = interpolate(lf, [48, 62], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/clip-01-alarm.mp4')} startFrom={0} transformExtra={kb(lf, 'zoom-in')} />
      <GradOverlay /><Scanlines />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: BEBAS, fontSize: 100, color: WHITE, letterSpacing: '0.06em', opacity: titleOp }}>
          EVERY MORNING.
        </div>
        <div style={{ fontFamily: MONO, fontSize: 24, color: CYAN, letterSpacing: '0.3em', marginTop: 18, opacity: subOp }}>
          5:30 AM
        </div>
      </div>
    </div>
  );
}

// ─── CLIP 2 — Wake Up (5–10s) ─────────────────────────────────────────────────
function Clip2({ lf }) {
  const textSp = sp(clamp(lf - 15, 0, 999), 0, 1, 14, 160);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/clip-02-wakeup.mp4')} startFrom={90} transformExtra={kb(lf, 'zoom-out')} />
      <GradOverlay /><Scanlines /><CutFlash lf={lf} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: '22%', textAlign: 'center',
        fontFamily: BEBAS, fontSize: 90, color: WHITE, letterSpacing: '0.05em',
        opacity: textSp, transform: `translateY(${interpolate(textSp, [0, 1], [80, 0])}px)`,
      }}>A COACH WAKES UP.</div>
    </div>
  );
}

// ─── CLIP 3 — Gym Enter (10–15s) ──────────────────────────────────────────────
function Clip3({ lf }) {
  const textSp = sp(clamp(lf - 20, 0, 999), 0, 1, 16, 160);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/clip-03-gym-enter.mp4')} startFrom={0} transformExtra={kb(lf, 'tilt-up')} />
      <GradOverlay /><Scanlines /><CutFlash lf={lf} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: '24%', textAlign: 'center',
        fontFamily: BEBAS, fontSize: 90, color: WHITE, letterSpacing: '0.05em',
        opacity: textSp, transform: `translateY(${interpolate(textSp, [0, 1], [60, 0])}px)`,
      }}>WALKS INTO THE GYM.</div>
    </div>
  );
}

// ─── CLIP 4 — Gym Empty (15–20s) — 3 staggered red lines ─────────────────────
const S4_LINES = [
  { text: "GUESSING WHO'S READY.",            startLf: 15, size: 72 },
  { text: 'GUESSING WHO NEEDS REST.',         startLf: 45, size: 72 },
  { text: 'GUESSING IF THE CUT IS ON TRACK.', startLf: 75, size: 58 },
];
function Clip4({ lf }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/clip-04-gym-empty.mp4')} startFrom={0} transformExtra={kb(lf, 'pan-left')} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,7,15,0.65) 0%, rgba(4,7,15,0.3) 50%, rgba(4,7,15,0.78) 100%)' }} />
      <Scanlines /><CutFlash lf={lf} />
      <div style={{ position: 'absolute', left: 72, right: 72, top: '32%', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {S4_LINES.map((l, i) => {
          const inSp = sp(clamp(lf - l.startLf, 0, 999), 0, 1, 14, 180);
          return (
            <div key={i} style={{
              fontFamily: BEBAS, fontSize: l.size, color: RED, letterSpacing: '0.04em', lineHeight: 1.1,
              opacity: inSp, transform: `translateX(${interpolate(inSp, [0, 1], [-70, 0])}px)`,
              textShadow: `0 0 30px ${RED}55`,
            }}>{l.text}</div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CLIP 5 — Phone (20–25s) — UNTIL NOW. slam, black at end ─────────────────
function Clip5({ lf }) {
  const bright   = interpolate(lf, [0, 60, 90], [0.55, 0.55, 0.72], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const slamSp   = sp(clamp(lf - 25, 0, 999), 3, 1, 8, 280);
  const slamOp   = interpolate(lf, [25, 29], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const blackOp  = interpolate(lf, [120, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <VideoFallback fallbackColor="#04070f">
        <OffthreadVideo src={staticFile('footage/clip-05-phone.mp4')} startFrom={60}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: `translate(-50%,-50%) ${kb(lf, 'zoom-in')}`,
            minWidth: '100%', minHeight: '100%', objectFit: 'cover',
            filter: `brightness(${bright}) contrast(${GC}) saturate(${GS}) sepia(${GSP})`,
          }} volume={0} />
      </VideoFallback>
      <GradOverlay /><Scanlines /><CutFlash lf={lf} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          fontFamily: BEBAS, fontSize: 140, color: WHITE, letterSpacing: '0.05em',
          transform: `scale(${slamSp})`, opacity: slamOp,
          textShadow: '0 0 80px rgba(255,255,255,0.9)',
        }}>UNTIL NOW.</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: DARK, opacity: blackOp, zIndex: 20, pointerEvents: 'none' }} />
    </div>
  );
}

// ─── Morning Brief mini card (for Clip 6) ────────────────────────────────────
const MB_ATHLETES = [
  { name: 'PRIYA',  score: 91, color: GREEN, badge: 'PUSH HARD'    },
  { name: 'JAKE',   score: 74, color: CYAN,  badge: 'TRAIN NORMAL' },
  { name: 'MARCUS', score: 38, color: RED,   badge: 'REST DAY'     },
];
function MorningBriefMini({ lf }) {
  const cardSp = sp(clamp(lf - 20, 0, 999), 0, 1, 14, 140);
  const cardX  = interpolate(cardSp, [0, 1], [420, 0]);
  const cardOp = interpolate(lf, [20, 32], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{
      background: 'rgba(4,7,15,0.91)', border: `1.5px solid ${CYAN}77`,
      borderRadius: 24, padding: '24px 32px', width: 860,
      boxShadow: `0 0 50px ${CYAN}22`,
      transform: `translateX(${cardX}px)`, opacity: cardOp,
    }}>
      <div style={{ fontFamily: MONO, fontSize: 18, color: CYAN, letterSpacing: '0.25em', marginBottom: 22, opacity: 0.85 }}>
        ◎ MORNING BRIEF · TODAY
      </div>
      {MB_ATHLETES.map((a, i) => {
        const rowIn = sp(clamp(lf - 32 - i * 16, 0, 999), 0, 1, 16, 160);
        const score = Math.round(interpolate(
          clamp(lf - 55, 0, 40), [0, 40], [0, a.score],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) },
        ));
        return (
          <div key={a.name} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 14, opacity: rowIn,
            transform: `translateX(${interpolate(rowIn, [0, 1], [-20, 0])}px)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: a.color, fontSize: 14 }}>●</span>
              <span style={{ fontFamily: MONO, color: WHITE, fontSize: 22 }}>{a.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontFamily: MONO, fontSize: 16, color: a.color, letterSpacing: '0.12em' }}>{a.badge}</span>
              <span style={{ fontFamily: BEBAS, color: a.color, fontSize: 40, lineHeight: 1 }}>{score}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CLIP 6 — Fighter Arrives (25–30s) ───────────────────────────────────────
function Clip6({ lf }) {
  const logoSp   = sp(clamp(lf - 8,  0, 999), 0, 1, 14, 120);
  const textSp   = sp(clamp(lf - 62, 0, 999), 0, 1, 16, 140);
  const scoredSp = sp(clamp(lf - 82, 0, 999), 0, 1, 14, 160);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/clip-06-fighter-arrives.mp4')} startFrom={0} transformExtra={kb(lf, 'pan-right')} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,7,15,0.6) 0%, rgba(4,7,15,0.1) 50%, rgba(4,7,15,0.78) 100%)' }} />
      <Scanlines /><CutFlash lf={lf} />

      {/* Logo top centre */}
      <div style={{
        position: 'absolute', top: 80, left: '50%',
        transform: `translateX(-50%) scale(${logoSp})`,
        filter: 'drop-shadow(0 0 20px rgba(0,212,240,0.6))',
      }}>
        <LogoMark size={80} />
      </div>

      {/* Morning Brief card — centre */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: '36%', display: 'flex', justifyContent: 'center' }}>
        <MorningBriefMini lf={lf} />
      </div>

      {/* EVERY ATHLETE. / SCORED. — bottom left */}
      <div style={{ position: 'absolute', left: 72, bottom: '16%' }}>
        <div style={{
          fontFamily: BEBAS, fontSize: 72, color: WHITE, letterSpacing: '0.05em', lineHeight: 1.1,
          opacity: textSp, transform: `translateX(${interpolate(textSp, [0, 1], [-40, 0])}px)`,
        }}>EVERY ATHLETE.</div>
        <div style={{
          fontFamily: BEBAS, fontSize: 72, color: AMBER, letterSpacing: '0.05em', lineHeight: 1.1,
          opacity: scoredSp, transform: `translateX(${interpolate(scoredSp, [0, 1], [-40, 0])}px)`,
          textShadow: `0 0 40px ${AMBER}77`,
        }}>SCORED.</div>
      </div>
    </div>
  );
}

// ─── CLIP 7 — Coach Watches (30–35s) ─────────────────────────────────────────
function Clip7({ lf }) {
  const titleSp = sp(clamp(lf - 15, 0, 999), 0, 1, 16, 160);
  const subOp   = interpolate(lf, [45, 58], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/clip-07-coach-watches.mp4')} startFrom={60} transformExtra={kb(lf, 'tilt-down')} />
      <GradOverlay /><Scanlines /><CutFlash lf={lf} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={{
          fontFamily: BEBAS, fontSize: 72, color: WHITE, letterSpacing: '0.06em',
          opacity: titleSp, transform: `translateY(${interpolate(titleSp, [0, 1], [40, 0])}px)`,
        }}>EVERY MORNING.</div>
        <div style={{ fontFamily: MONO, fontSize: 28, color: CYAN, letterSpacing: '0.18em', opacity: subOp }}>
          Before you leave the house.
        </div>
      </div>
    </div>
  );
}

// ─── CLIP 8 — Exhausted (35–40s) — pulsing red vignette ──────────────────────
function Clip8({ lf }) {
  const pulse  = `rgba(239,68,68,${(0.12 + Math.sin(lf * 0.2) * 0.06).toFixed(3)})`;
  const t1     = sp(clamp(lf - 15, 0, 999), 0, 1, 16, 160);
  const t2     = sp(clamp(lf - 40, 0, 999), 0, 1, 14, 180);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/clip-08-exhausted.mp4')} startFrom={0} transformExtra={kb(lf, 'zoom-in')} />
      <GradOverlay />
      <Vignette color={pulse} />
      <Scanlines /><CutFlash lf={lf} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: BEBAS, fontSize: 80, color: WHITE, letterSpacing: '0.06em', opacity: t1, transform: `translateY(${interpolate(t1, [0, 1], [40, 0])}px)` }}>KNOW WHO</div>
        <div style={{ fontFamily: BEBAS, fontSize: 80, color: RED, letterSpacing: '0.06em', opacity: t2, transform: `translateY(${interpolate(t2, [0, 1], [40, 0])}px)`, textShadow: `0 0 50px ${RED}99` }}>NEEDS REST.</div>
      </div>
    </div>
  );
}

// ─── CLIP 9 — Decision (40–45s) — amber vignette ─────────────────────────────
function Clip9({ lf }) {
  const t1 = sp(clamp(lf - 15, 0, 999), 0, 1, 16, 160);
  const t2 = sp(clamp(lf - 40, 0, 999), 0, 1, 14, 180);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/clip-09-decision.mp4')} startFrom={0} transformExtra={kb(lf, 'pan-left')} />
      <GradOverlay />
      <Vignette color="rgba(245,158,11,0.14)" />
      <Scanlines /><CutFlash lf={lf} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: BEBAS, fontSize: 80, color: WHITE, letterSpacing: '0.06em', opacity: t1, transform: `translateY(${interpolate(t1, [0, 1], [40, 0])}px)` }}>KNOW WHO</div>
        <div style={{ fontFamily: BEBAS, fontSize: 80, color: AMBER, letterSpacing: '0.06em', opacity: t2, transform: `translateY(${interpolate(t2, [0, 1], [40, 0])}px)`, textShadow: `0 0 50px ${AMBER}99` }}>TO PROTECT.</div>
      </div>
    </div>
  );
}

// ─── CLIP 10 — Fight Night (45–50s) — green vignette, brightness 0.7 ─────────
function Clip10({ lf }) {
  const t1 = sp(clamp(lf - 15, 0, 999), 0, 1, 16, 160);
  const t2 = sp(clamp(lf - 40, 0, 999), 0, 1, 14, 180);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/clip-10-fightnight.mp4')} startFrom={0} brightness={0.7} transformExtra={kb(lf, 'zoom-out')} />
      <GradOverlay />
      <Vignette color="rgba(16,185,129,0.14)" />
      <Scanlines /><CutFlash lf={lf} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: BEBAS, fontSize: 80, color: WHITE, letterSpacing: '0.06em', opacity: t1, transform: `translateY(${interpolate(t1, [0, 1], [40, 0])}px)` }}>KNOW WHO</div>
        <div style={{ fontFamily: BEBAS, fontSize: 80, color: GREEN, letterSpacing: '0.06em', opacity: t2, transform: `translateY(${interpolate(t2, [0, 1], [40, 0])}px)`, textShadow: `0 0 50px ${GREEN}99` }}>TO PUSH.</div>
      </div>
    </div>
  );
}

// ─── Particle burst ───────────────────────────────────────────────────────────
function ParticleBurst({ lf, startLf }) {
  const age = clamp(lf - startLf, 0, 72);
  if (lf < startLf) return null;
  return (
    <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }} width={W} height={H}>
      {PARTICLES.map((p, i) => {
        const pAge  = clamp(age - p.delay, 0, 62);
        const dist  = p.maxDist * (pAge / 62);
        const x     = W / 2 + Math.cos(p.angle) * dist;
        const y     = H / 2 + Math.sin(p.angle) * dist;
        const alpha = interpolate(pAge / 62, [0, 0.2, 1], [0, 1, 0]);
        return <circle key={i} cx={x} cy={y} r={p.size} fill={p.color} opacity={alpha} />;
      })}
    </svg>
  );
}

// ─── FINAL SCENE — Black (50–58s, 240 frames) ────────────────────────────────
function FinalScene({ lf }) {
  const logoSp    = sp(clamp(lf,      0, 999), 0, 1, 14, 140);
  const wordIn    = sp(clamp(lf - 20, 0, 999), 0, 1, 16, 180);
  const ruleW     = interpolate(clamp(lf - 30, 0, 28), [0, 28], [0, 560], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const price     = Math.round(interpolate(
    clamp(lf - 40, 0, 22), [0, 22], [0, 99],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) },
  ));
  const onceIn    = sp(clamp(lf - 50, 0, 999), 0, 1, 18, 180);
  const urlPulse  = lf >= 60 ? 0.5 + Math.sin((lf - 60) * 0.2) * 0.18 : 0;
  const mainFade  = interpolate(lf, [80, 220], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const endLogoOp = interpolate(lf, [215, 222], [0, 0.7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, background: DARK }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at center, rgba(0,212,240,${0.04 + logoSp * 0.08}) 0%, transparent 55%)` }} />
      {lf >= 5 && lf < 78 && <ParticleBurst lf={lf} startLf={5} />}

      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: mainFade }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ transform: `scale(${logoSp})`, filter: 'drop-shadow(0 0 35px rgba(0,212,240,0.8))' }}>
            <LogoMark size={100} />
          </div>
          <div style={{ fontFamily: BEBAS, fontSize: 80, letterSpacing: '0.08em', color: WHITE, opacity: wordIn, transform: `translateY(${interpolate(wordIn, [0, 1], [16, 0])}px)`, textShadow: `0 0 40px ${CYAN}44` }}>
            STRIKEPANEL™
          </div>
          <div style={{ width: ruleW, height: 1, background: CYAN, opacity: 0.6 }} />
          <div style={{ fontFamily: BEBAS, fontSize: 140, color: AMBER, letterSpacing: '0.04em', lineHeight: 1, textShadow: `0 0 70px ${AMBER}88`, opacity: lf >= 40 ? 1 : 0 }}>
            ${price}.
          </div>
          <div style={{ fontFamily: BEBAS, fontSize: 60, color: WHITE, letterSpacing: '0.06em', opacity: onceIn }}>
            ONCE. YOURS FOREVER.
          </div>
          <div style={{ fontFamily: MONO, fontSize: 26, color: CYAN, letterSpacing: '0.18em', opacity: urlPulse }}>
            strikepanel.vercel.app/demo
          </div>
        </div>
      </div>

      {/* Tiny logo — very last frames */}
      <div style={{ position: 'absolute', inset: 0, background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: endLogoOp }}>
        <div style={{ filter: 'drop-shadow(0 0 16px rgba(0,212,240,0.5))' }}>
          <LogoMark size={40} />
        </div>
      </div>
    </div>
  );
}

// ━━━ Root ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function TrailerMovie() {
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
      <div style={{ position: 'absolute', inset: 0, zIndex: 95, pointerEvents: 'none', filter: 'url(#grain)', opacity: 0.05, background: WHITE }} />

      <Sequence from={0}    durationInFrames={150}><Clip1  lf={frame}        /></Sequence>
      <Sequence from={150}  durationInFrames={150}><Clip2  lf={frame - 150}  /></Sequence>
      <Sequence from={300}  durationInFrames={150}><Clip3  lf={frame - 300}  /></Sequence>
      <Sequence from={450}  durationInFrames={150}><Clip4  lf={frame - 450}  /></Sequence>
      <Sequence from={600}  durationInFrames={150}><Clip5  lf={frame - 600}  /></Sequence>
      <Sequence from={750}  durationInFrames={150}><Clip6  lf={frame - 750}  /></Sequence>
      <Sequence from={900}  durationInFrames={150}><Clip7  lf={frame - 900}  /></Sequence>
      <Sequence from={1050} durationInFrames={150}><Clip8  lf={frame - 1050} /></Sequence>
      <Sequence from={1200} durationInFrames={150}><Clip9  lf={frame - 1200} /></Sequence>
      <Sequence from={1350} durationInFrames={150}><Clip10 lf={frame - 1350} /></Sequence>
      <Sequence from={1500} durationInFrames={240}><FinalScene lf={frame - 1500} /></Sequence>
    </div>
  );
}
