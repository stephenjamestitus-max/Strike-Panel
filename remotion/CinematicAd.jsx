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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

function sp(frame, from, to, damping = 14, stiffness = 160, mass = 1) {
  return spring({ frame, fps: 30, config: { damping, stiffness, mass }, from, to });
}

function fadeIn(localFrame, startFrame, duration = 8) {
  return clamp((localFrame - startFrame) / duration, 0, 1);
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

// ─── Shared: line-by-line text reveal ────────────────────────────────────────
function NarrativeLine({ localFrame, startFrame, text, size = 95, color = WHITE, weight = 'normal', align = 'left', tracking = '0.02em', maxWidth }) {
  const age  = clamp(localFrame - startFrame, 0, 999);
  const inSp = sp(age, 0, 1, 22, 120);
  return (
    <div style={{
      fontFamily: BEBAS,
      fontSize: size,
      lineHeight: 1.05,
      color,
      letterSpacing: tracking,
      textAlign: align,
      opacity: inSp,
      transform: `translateY(${interpolate(inSp, [0, 1], [28, 0])}px)`,
      maxWidth: maxWidth || 'none',
    }}>
      {text}
    </div>
  );
}

// ─── ACT 1: The Burden (frames 0–240) ────────────────────────────────────────
function Act1({ localFrame }) {
  const vignette = (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.88) 100%)',
    }} />
  );

  const bgFade = clamp(localFrame / 15, 0, 1);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/boxer.mp4')} brightness={0.15} fallbackColor="#030507" />
      {vignette}

      <div style={{
        position: 'absolute', left: 72, right: 72,
        top: '38%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 16,
        opacity: bgFade,
      }}>
        <NarrativeLine localFrame={localFrame} startFrame={30}  text="You've been coaching" size={100} />
        <NarrativeLine localFrame={localFrame} startFrame={30}  text="for years." size={100} color={CYAN} />
        <div style={{ height: 18 }} />
        <NarrativeLine localFrame={localFrame} startFrame={95}  text="Every fighter." size={88} />
        <NarrativeLine localFrame={localFrame} startFrame={118} text="Every camp." size={88} />
        <div style={{ height: 10 }} />
        <NarrativeLine localFrame={localFrame} startFrame={162} text="You carry it all." size={128} tracking="0.04em" />
      </div>
    </div>
  );
}

// ─── ACT 2: The Problem (frames 240–540) ─────────────────────────────────────
const CHAOS_MSGS = [
  { text: "Jake: weight stuck at 143.2",      x: 60,  y: 160, rot: -1.2, delay: 10 },
  { text: "Priya: shoulder feels off tbh",     x: 380, y: 240, rot: 1.5,  delay: 28 },
  { text: "Marcus: didn't sleep, stressed",    x: 50,  y: 380, rot: -0.8, delay: 46 },
  { text: "Sparring tomorrow — who's ready?",  x: 300, y: 480, rot: 1.2,  delay: 62 },
  { text: "Is the cut happening tmrw??",       x: 70,  y: 590, rot: -1.5, delay: 78 },
];

function ChaosMessages({ localFrame }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {CHAOS_MSGS.map((m, i) => {
        const age = clamp(localFrame - m.delay, 0, 999);
        const inSp = sp(age, 0, 1, 14, 180);
        return (
          <div key={i} style={{
            position: 'absolute',
            left: m.x, top: m.y,
            background: 'rgba(0,200,80,0.12)',
            border: '1px solid rgba(0,200,80,0.25)',
            borderRadius: 12,
            padding: '10px 18px',
            opacity: inSp * 0.35,
            transform: `rotate(${m.rot}deg) translateY(${interpolate(inSp, [0, 1], [-20, 0])}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 26, color: 'rgba(255,255,255,0.8)' }}>
              {m.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Act2({ localFrame }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/boxer.mp4')} brightness={0.2} fallbackColor="#060810" />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(4,7,15,0.5) 0%, rgba(4,7,15,0.85) 100%)',
      }} />

      <ChaosMessages localFrame={localFrame} />

      <div style={{
        position: 'absolute', left: 72, right: 72,
        bottom: '28%',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <NarrativeLine localFrame={localFrame} startFrame={20}  text="But every morning" size={88} />
        <NarrativeLine localFrame={localFrame} startFrame={20}  text="you wake up guessing." size={88} color={AMBER} />
        <div style={{ height: 12 }} />
        <NarrativeLine localFrame={localFrame} startFrame={100} text="Who's ready? Who's not?" size={80} />
        <NarrativeLine localFrame={localFrame} startFrame={148} text="Is the cut on track?" size={80} />
        <div style={{ height: 16 }} />
        <NarrativeLine localFrame={localFrame} startFrame={200} text="You don't know." size={130} color={AMBER} tracking="0.03em" />
        <NarrativeLine localFrame={localFrame} startFrame={248} text="You never know." size={100} color={RED} />
      </div>
    </div>
  );
}

// ─── ACT 3: The Shift (frames 540–840) ───────────────────────────────────────
function Act3({ localFrame }) {
  const untilNowIn  = sp(clamp(localFrame - 55, 0, 999), 0, 1, 28, 70);
  const logoScale   = sp(clamp(localFrame - 130, 0, 999), 0, 1, 20, 100);
  const wordIn      = sp(clamp(localFrame - 160, 0, 999), 0, 1, 14, 140);
  const tagIn       = sp(clamp(localFrame - 190, 0, 999), 0, 1, 16, 120);

  const glowOp = interpolate(localFrame, [120, 200], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Particle burst after logo appears
  const doParticles = localFrame > 135 && localFrame < 230;
  const age = localFrame - 136;

  return (
    <div style={{ position: 'absolute', inset: 0, background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        width: 700, height: 700,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${CYAN}18 0%, transparent 65%)`,
        opacity: glowOp,
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
      }} />

      {/* Particles */}
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

      {/* "Until now." */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: BEBAS,
        fontSize: 180,
        color: WHITE,
        letterSpacing: '0.04em',
        opacity: untilNowIn,
        transform: `translateY(${interpolate(untilNowIn, [0, 1], [40, 0])}px)`,
        textShadow: `0 0 120px ${WHITE}22`,
      }}>
        Until now.
      </div>

      {/* Logo + wordmark */}
      <div style={{
        position: 'absolute',
        bottom: '28%',
        left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
      }}>
        <div style={{
          transform: `scale(${logoScale})`,
          filter: 'drop-shadow(0 0 30px rgba(0,212,240,0.6))',
        }}>
          <LogoMark size={120} />
        </div>
        <div style={{
          fontFamily: BEBAS,
          fontSize: 120,
          letterSpacing: '0.07em',
          color: WHITE,
          opacity: wordIn,
          transform: `translateY(${interpolate(wordIn, [0, 1], [18, 0])}px)`,
          textShadow: `0 0 60px ${CYAN}55`,
        }}>
          STRIKE<span style={{ color: CYAN }}>PANEL</span>
        </div>
        <div style={{
          fontFamily: MONO,
          fontSize: 24,
          letterSpacing: '0.3em',
          color: CYAN,
          opacity: tagIn,
          transform: `translateY(${interpolate(tagIn, [0, 1], [10, 0])}px)`,
        }}>
          TRAINING INTELLIGENCE
        </div>
      </div>
    </div>
  );
}

// ─── ACT 4: The Product (frames 840–1350) ────────────────────────────────────
const ATHLETES = [
  { name: 'Priya',  score: 91, color: GREEN, badge: 'Push Hard' },
  { name: 'Jake',   score: 74, color: CYAN,  badge: 'Train Normal' },
  { name: 'Marcus', score: 38, color: RED,   badge: 'Rest Day' },
];

function MorningBriefWidget({ localFrame }) {
  const widgetIn = sp(clamp(localFrame - 10, 0, 999), 0, 1, 16, 140);

  return (
    <div style={{
      background: 'rgba(4,7,15,0.92)',
      border: `1px solid ${CYAN}55`,
      borderRadius: 28,
      padding: '36px 42px',
      width: 580,
      boxShadow: `0 0 80px ${CYAN}1A`,
      opacity: widgetIn,
      transform: `translateX(${interpolate(widgetIn, [0, 1], [60, 0])}px)`,
    }}>
      <div style={{ fontFamily: MONO, fontSize: 18, color: CYAN, letterSpacing: '0.3em', marginBottom: 28, opacity: 0.8 }}>
        ◎ MORNING BRIEF
      </div>
      {ATHLETES.map((a, i) => {
        const rowIn = sp(clamp(localFrame - 30 - i * 18, 0, 999), 0, 1, 16, 170);
        const scoreVal = Math.round(interpolate(
          clamp(localFrame - 55, 0, 55),
          [0, 55], [0, a.score],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) },
        ));
        const barFill = interpolate(
          clamp(localFrame - 55, 0, 65),
          [0, 65], [0, a.score],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );
        return (
          <div key={a.name} style={{
            marginBottom: 24,
            opacity: rowIn,
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
  const cardIn = sp(clamp(localFrame - 230, 0, 999), 0, 1, 16, 140);
  const barW   = interpolate(clamp(localFrame - 250, 0, 60), [0, 60], [0, 78], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      background: 'rgba(4,7,15,0.88)',
      border: `1px solid ${AMBER}44`,
      borderRadius: 20,
      padding: '28px 38px',
      width: 580,
      opacity: cardIn,
      transform: `translateX(${interpolate(cardIn, [0, 1], [60, 0])}px)`,
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
  const txt1In = sp(clamp(localFrame - 110, 0, 999), 0, 1, 18, 130);
  const txt2In = sp(clamp(localFrame - 148, 0, 999), 0, 1, 18, 130);
  const txt3In = sp(clamp(localFrame - 186, 0, 999), 0, 1, 18, 130);
  const txt4In = sp(clamp(localFrame - 320, 0, 999), 0, 1, 18, 130);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/boxer.mp4')} brightness={0.18} fallbackColor="#05080f" />
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(160deg, rgba(4,7,15,0.72) 0%, rgba(0,212,240,0.06) 100%)`,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 36, padding: '0 72px',
      }}>
        <MorningBriefWidget localFrame={localFrame} />

        <div style={{ width: 580, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            fontFamily: BEBAS, fontSize: 82, color: WHITE, letterSpacing: '0.03em', lineHeight: 1.05,
            opacity: txt1In, transform: `translateY(${interpolate(txt1In, [0, 1], [20, 0])}px)`,
          }}>
            Every athlete. Scored.
          </div>
          <div style={{
            fontFamily: BEBAS, fontSize: 82, color: WHITE, letterSpacing: '0.03em', lineHeight: 1.05,
            opacity: txt2In, transform: `translateY(${interpolate(txt2In, [0, 1], [20, 0])}px)`,
          }}>
            Every morning.
          </div>
          <div style={{
            fontFamily: BEBAS, fontSize: 68, color: CYAN, letterSpacing: '0.03em', lineHeight: 1.05,
            opacity: txt3In, transform: `translateY(${interpolate(txt3In, [0, 1], [20, 0])}px)`,
          }}>
            Before you leave the house.
          </div>
        </div>

        <FightCampCard localFrame={localFrame} />

        <div style={{
          fontFamily: BEBAS, fontSize: 90, color: WHITE, letterSpacing: '0.04em',
          opacity: txt4In, transform: `translateY(${interpolate(txt4In, [0, 1], [20, 0])}px)`,
          textAlign: 'center',
        }}>
          Your whole camp.<br />
          <span style={{ color: CYAN }}>One place.</span>
        </div>
      </div>
    </div>
  );
}

// ─── ACT 5: The Result (frames 1350–1650) ────────────────────────────────────
const RESULT_ATHLETES = [
  { name: 'Priya',  call: 'Push hard.',    color: GREEN },
  { name: 'Jake',   call: 'Train normal.', color: CYAN  },
  { name: 'Marcus', call: 'Rest day.',     color: RED   },
];

function Act5({ localFrame }) {
  const knewIn = sp(clamp(localFrame - 240, 0, 999), 0, 1, 22, 90);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#020509', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(0,212,240,0.04) 0%, transparent 70%)',
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '0 72px', width: '100%' }}>
        {RESULT_ATHLETES.map((a, i) => {
          const rowIn = sp(clamp(localFrame - i * 60, 0, 999), 0, 1, 18, 140);
          return (
            <div key={a.name} style={{
              display: 'flex', alignItems: 'baseline', gap: 24,
              borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              paddingBottom: 32, marginBottom: 32,
              opacity: rowIn,
              transform: `translateX(${interpolate(rowIn, [0, 1], [-50, 0])}px)`,
            }}>
              <span style={{ fontFamily: BEBAS, fontSize: 130, color: WHITE, letterSpacing: '0.04em', lineHeight: 1, flex: 1 }}>
                {a.name}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 30, color: a.color, letterSpacing: '0.15em', lineHeight: 1 }}>
                {a.call}
              </span>
            </div>
          );
        })}

        <div style={{
          marginTop: 24,
          fontFamily: BEBAS,
          fontSize: 110,
          color: WHITE,
          letterSpacing: '0.03em',
          lineHeight: 1.05,
          opacity: knewIn,
          transform: `translateY(${interpolate(knewIn, [0, 1], [30, 0])}px)`,
          textShadow: `0 0 80px ${WHITE}22`,
        }}>
          You already knew.
        </div>
      </div>
    </div>
  );
}

// ─── ACT 6: CTA (frames 1650–1800) ───────────────────────────────────────────
function Act6({ localFrame }) {
  const logoScale = sp(clamp(localFrame - 5, 0, 999), 0, 1, 20, 100);
  const wordIn    = sp(clamp(localFrame - 25, 0, 999), 0, 1, 16, 140);
  const l1In      = sp(clamp(localFrame - 48, 0, 999), 0, 1, 16, 140);
  const l2In      = sp(clamp(localFrame - 66, 0, 999), 0, 1, 16, 140);
  const priceIn   = sp(clamp(localFrame - 86, 0, 999), 0, 1, 14, 160);

  const topBar = interpolate(localFrame, [0, 18], [0, 1080], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Top cyan bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, height: 5, width: topBar, background: CYAN }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <div style={{
          transform: `scale(${logoScale})`,
          filter: 'drop-shadow(0 0 30px rgba(0,212,240,0.5))',
        }}>
          <LogoMark size={90} />
        </div>

        <div style={{
          fontFamily: BEBAS, fontSize: 110, letterSpacing: '0.06em', color: WHITE,
          opacity: wordIn, transform: `translateY(${interpolate(wordIn, [0, 1], [16, 0])}px)`,
          textShadow: `0 0 50px ${CYAN}44`,
        }}>
          STRIKE<span style={{ color: CYAN }}>PANEL™</span>
        </div>

        <div style={{
          fontFamily: BEBAS, fontSize: 72, color: WHITE, letterSpacing: '0.03em',
          opacity: l1In, transform: `translateY(${interpolate(l1In, [0, 1], [14, 0])}px)`,
          textAlign: 'center',
        }}>
          Know who to push.
        </div>
        <div style={{
          fontFamily: BEBAS, fontSize: 72, color: CYAN, letterSpacing: '0.03em',
          opacity: l2In, transform: `translateY(${interpolate(l2In, [0, 1], [14, 0])}px)`,
          textAlign: 'center',
        }}>
          Know who to protect.
        </div>

        <div style={{
          fontFamily: MONO, fontSize: 28, color: AMBER, letterSpacing: '0.18em',
          opacity: priceIn, transform: `translateY(${interpolate(priceIn, [0, 1], [10, 0])}px)`,
          textAlign: 'center',
          marginTop: 12,
        }}>
          $99. Once. Yours forever.
        </div>

        <div style={{
          fontFamily: MONO, fontSize: 22, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em',
          opacity: priceIn,
          marginTop: 4,
        }}>
          strikepanel.vercel.app/demo
        </div>
      </div>
    </div>
  );
}

// ─── Flash cut between acts ───────────────────────────────────────────────────
function FlashCut({ localFrame, durationIn = 6, durationOut = 6 }) {
  const opacity = localFrame < durationIn
    ? interpolate(localFrame, [0, durationIn], [1, 0])
    : 0;
  if (opacity <= 0) return null;
  return <div style={{ position: 'absolute', inset: 0, background: DARK, opacity, zIndex: 10, pointerEvents: 'none' }} />;
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
      {/* Film grain */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="overlay" />
          </filter>
        </defs>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 99, pointerEvents: 'none',
        filter: 'url(#grain)', opacity: 0.045, background: WHITE,
      }} />

      {/* Acts */}
      <Sequence from={0}    durationInFrames={240}>
        <Act1 localFrame={frame - 0} />
        <FlashCut localFrame={frame - 0} />
      </Sequence>

      <Sequence from={240}  durationInFrames={300}>
        <Act2 localFrame={frame - 240} />
        <FlashCut localFrame={frame - 240} />
      </Sequence>

      <Sequence from={540}  durationInFrames={300}>
        <Act3 localFrame={frame - 540} />
        <FlashCut localFrame={frame - 540} />
      </Sequence>

      <Sequence from={840}  durationInFrames={510}>
        <Act4 localFrame={frame - 840} />
        <FlashCut localFrame={frame - 840} />
      </Sequence>

      <Sequence from={1350} durationInFrames={300}>
        <Act5 localFrame={frame - 1350} />
        <FlashCut localFrame={frame - 1350} />
      </Sequence>

      <Sequence from={1650} durationInFrames={150}>
        <Act6 localFrame={frame - 1650} />
        <FlashCut localFrame={frame - 1650} />
      </Sequence>
    </div>
  );
}
