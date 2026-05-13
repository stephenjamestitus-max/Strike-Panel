import React, { useState, useEffect } from 'react';
import {
  useCurrentFrame,
  spring, interpolate, Easing,
  Sequence, OffthreadVideo,
  delayRender, continueRender,
  staticFile,
} from 'remotion';
import { loadFont as loadBebas } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadDMMono } from '@remotion/google-fonts/DMMono';

const bebasFont  = loadBebas();
const dmMonoFont = loadDMMono();

const W      = 1080;
const H      = 1920;
const CYAN   = '#00D4F0';
const AMBER  = '#F59E0B';
const RED    = '#ef4444';
const GREEN  = '#10b981';
const PURPLE = '#8b5cf6';
const DARK   = '#04070f';
const WHITE  = '#FFFFFF';
const BEBAS  = "'Bebas Neue', sans-serif";
const MONO   = "'DM Mono', monospace";

const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  angle:   (i / 40) * Math.PI * 2 + (i % 7) * 0.31,
  maxDist: 200 + (i % 8) * 25,
  size:    1.5 + (i % 4),
  delay:   (i % 5) * 2,
  color:   i % 4 === 0 ? CYAN : i % 4 === 1 ? AMBER : i % 4 === 2 ? WHITE : PURPLE,
}));

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function sp(frame, from = 0, to = 1, damping = 12, stiffness = 160) {
  return spring({ frame, fps: 30, config: { damping, stiffness }, from, to });
}

// ─── Error boundary for video ─────────────────────────────────────────────────
class VideoFallback extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div style={{ position: 'absolute', inset: 0, background: this.props.fallbackColor || '#030507' }} />;
    return this.props.children;
  }
}

function BgVideo({ src, brightness = 0.2, contrast = 1.1, saturate = 0.85, fallbackColor }) {
  return (
    <VideoFallback fallbackColor={fallbackColor}>
      <OffthreadVideo
        src={src}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          minWidth: '100%', minHeight: '100%', objectFit: 'cover',
          filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`,
        }}
        volume={0}
      />
    </VideoFallback>
  );
}

// ─── Logo with SP text ────────────────────────────────────────────────────────
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

// ─── Shared UI components ─────────────────────────────────────────────────────
function Scanlines({ opacity = 0.035 }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 90,
      background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)',
      opacity,
    }} />
  );
}

function GlitchText({ children, style, active }) {
  if (!active) return <div style={style}>{children}</div>;
  return (
    <div style={{ position: 'relative', ...style }}>
      <div style={{ position: 'absolute', color: '#ff0040', left: -4, top:  4, opacity: 0.85 }}>{children}</div>
      <div style={{ position: 'absolute', color: '#00ffee', left:  4, top: -4, opacity: 0.85 }}>{children}</div>
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}

function CutFlash({ lf, at = 0 }) {
  const age = lf - at;
  if (age < 0 || age > 3) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, background: WHITE,
      opacity: interpolate(age, [0, 3], [0.9, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      zIndex: 50, pointerEvents: 'none',
    }} />
  );
}

function DarkFlash({ lf, duration = 6 }) {
  if (lf >= duration) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, background: DARK,
      opacity: interpolate(lf, [0, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      zIndex: 10, pointerEvents: 'none',
    }} />
  );
}

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

// ━━━ SCENE 1 — COLD OPEN (0–120, 0–4s) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// fighter-prep.mp4: wrapping hands, brightness 0.3, high contrast
function Scene1({ lf }) {
  const everySp = sp(clamp(lf - 20, 0, 999), 3, 1, 10, 300);
  const everyOp = interpolate(lf, [20, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const mornSp  = sp(clamp(lf - 55, 0, 999), 3, 1, 10, 300);
  const mornOp  = interpolate(lf, [55, 59], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/fighter-prep.mp4')} brightness={0.3} contrast={1.35} saturate={0.65} fallbackColor="#06080f" />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,7,15,0.5) 0%, rgba(4,7,15,0.1) 50%, rgba(4,7,15,0.75) 100%)' }} />
      <Scanlines opacity={0.04} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          fontFamily: BEBAS, fontSize: 180, color: WHITE, letterSpacing: '0.08em', lineHeight: 1,
          transform: `scale(${everySp})`, opacity: everyOp,
          textShadow: `0 0 60px rgba(255,255,255,0.5)`,
        }}>EVERY</div>
        <div style={{
          fontFamily: BEBAS, fontSize: 180, color: AMBER, letterSpacing: '0.08em', lineHeight: 1,
          transform: `scale(${mornSp})`, opacity: mornOp,
          textShadow: `0 0 80px ${AMBER}aa`,
        }}>MORNING.</div>
      </div>
    </div>
  );
}

// ━━━ SCENE 2 — THE PROBLEM (120–300, 4–10s) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Three 60-frame cuts, each with its own footage and text
function S2Cut({ lf, videoSrc, text, brightness, contrast }) {
  const textSp = sp(clamp(lf - 8, 0, 999), 0, 1, 14, 180);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile(videoSrc)} brightness={brightness} contrast={contrast} saturate={0.75} fallbackColor="#060810" />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,7,15,0.65) 0%, rgba(4,7,15,0.2) 50%, rgba(4,7,15,0.85) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, transparent 35%, rgba(245,158,11,0.07) 100%)` }} />
      <Scanlines opacity={0.05} />

      {/* White flash at cut boundary */}
      <CutFlash lf={lf} at={0} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          fontFamily: BEBAS, fontSize: 96, color: WHITE, letterSpacing: '0.04em',
          textAlign: 'center', paddingLeft: 64, paddingRight: 64, lineHeight: 1.12,
          opacity: textSp,
          transform: `translateY(${interpolate(textSp, [0, 1], [50, 0])}px)`,
          textShadow: `0 0 40px rgba(255,255,255,0.25)`,
        }}>{text}</div>
      </div>
    </div>
  );
}

// ━━━ SCENE 3 — THE SILENCE (300–450, 10–15s) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// mma-training fades to black, "UNTIL NOW." slams
function Scene3({ lf }) {
  const videoOp = interpolate(lf, [70, 92], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const untilOp = interpolate(lf, [45, 62], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                * interpolate(lf, [92, 108], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const nowSp   = sp(clamp(lf - 78, 0, 999), 3, 1, 8, 280);
  const nowOp   = interpolate(lf, [78, 82], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, background: DARK }}>
      <div style={{ position: 'absolute', inset: 0, opacity: videoOp }}>
        <BgVideo src={staticFile('footage/mma-training.mp4')} brightness={0.22} contrast={1.2} fallbackColor="#04070f" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,7,15,0.4) 0%, rgba(4,7,15,0.1) 50%, rgba(4,7,15,0.65) 100%)' }} />
      </div>
      <div style={{
        position: 'absolute', top: '38%', left: 0, right: 0, textAlign: 'center',
        fontFamily: BEBAS, fontSize: 110, color: WHITE, letterSpacing: '0.1em',
        opacity: untilOp,
      }}>UNTIL</div>
      <div style={{
        position: 'absolute', top: '48%', left: 0, right: 0, textAlign: 'center',
        fontFamily: BEBAS, fontSize: 200, color: WHITE, letterSpacing: '0.06em',
        transform: `scale(${nowSp})`, opacity: nowOp,
        textShadow: `0 0 80px rgba(255,255,255,0.9)`,
      }}>NOW.</div>
    </div>
  );
}

// ━━━ SCENE 4 — LOGO REVEAL (450–600, 15–20s) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Scene4({ lf }) {
  const glowOp    = sp(clamp(lf, 0, 999), 0, 1, 14, 100);
  const logoScale = sp(clamp(lf - 10, 0, 999), 0, 1, 15, 120);
  const wordIn    = sp(clamp(lf - 40, 0, 999), 0, 1, 16, 140);
  const tagIn     = sp(clamp(lf - 70, 0, 999), 0, 1, 18, 120);

  return (
    <div style={{ position: 'absolute', inset: 0, background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        position: 'absolute', width: 900, height: 900, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(0,212,240,0.22) 0%, transparent 60%)`,
        opacity: glowOp, top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      }} />
      {lf >= 88 && lf < 148 && <ParticleBurst lf={lf} startLf={88} />}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <div style={{ transform: `scale(${logoScale})`, filter: 'drop-shadow(0 0 40px rgba(0,212,240,0.8))' }}>
          <LogoMark size={160} />
        </div>
        <div style={{
          fontFamily: BEBAS, fontSize: 96, letterSpacing: '0.08em', color: WHITE,
          opacity: wordIn, transform: `translateY(${interpolate(wordIn, [0, 1], [20, 0])}px)`,
          textShadow: `0 0 50px ${CYAN}55`,
        }}>STRIKEPANEL™</div>
        <div style={{
          fontFamily: MONO, fontSize: 28, letterSpacing: '0.3em', color: CYAN,
          opacity: tagIn, transform: `translateY(${interpolate(tagIn, [0, 1], [10, 0])}px)`,
        }}>TRAINING INTELLIGENCE</div>
      </div>
    </div>
  );
}

// ━━━ SCENE 5 — PRODUCT (600–990, 20–33s) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ATHLETES = [
  { name: 'Priya',  score: 91, color: GREEN, badge: 'PUSH HARD'    },
  { name: 'Jake',   score: 74, color: CYAN,  badge: 'TRAIN NORMAL' },
  { name: 'Marcus', score: 38, color: RED,   badge: 'REST DAY'     },
];

function MorningBriefCard({ lf }) {
  const cardIn  = sp(clamp(lf, 0, 999), 0, 1, 16, 140);
  const cardOut = interpolate(lf, [130, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardX   = interpolate(cardIn, [0, 1], [140, 0]) - cardOut * (W + 100);
  const cardOp  = interpolate(lf, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      background: 'rgba(4,7,15,0.92)', border: `1px solid ${CYAN}66`, borderRadius: 28,
      padding: '32px 40px', width: 920,
      boxShadow: `0 0 60px ${CYAN}22, inset 0 0 40px rgba(0,212,240,0.04)`,
      transform: `translateX(${cardX}px)`, opacity: cardOp,
    }}>
      <div style={{ fontFamily: MONO, fontSize: 20, color: CYAN, letterSpacing: '0.25em', marginBottom: 28, opacity: 0.85 }}>
        ◎ MORNING BRIEF · TODAY
      </div>
      {ATHLETES.map((a, i) => {
        const rowIn    = sp(clamp(lf - 18 - i * 20, 0, 999), 0, 1, 16, 170);
        const scoreVal = Math.round(interpolate(
          clamp(lf - 45, 0, 55), [0, 55], [0, a.score],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) },
        ));
        const barFill = interpolate(clamp(lf - 45, 0, 65), [0, 65], [0, a.score], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <div key={a.name} style={{ marginBottom: 22, opacity: rowIn, transform: `translateX(${interpolate(rowIn, [0, 1], [-28, 0])}px)` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ color: a.color, fontSize: 18 }}>●</span>
                <span style={{ fontFamily: MONO, color: WHITE, fontSize: 24, letterSpacing: '0.05em' }}>{a.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontFamily: MONO, fontSize: 18, color: a.color, letterSpacing: '0.15em' }}>{a.badge}</span>
                <span style={{ fontFamily: BEBAS, color: a.color, fontSize: 46, lineHeight: 1 }}>{scoreVal}</span>
              </div>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
              <div style={{ height: '100%', width: `${barFill}%`, background: `linear-gradient(90deg, ${a.color}88, ${a.color})`, borderRadius: 3 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FightCampCard({ lf }) {
  const local   = lf - 150;
  const cardIn  = sp(clamp(local, 0, 999), 0, 1, 16, 140);
  const cardOut = interpolate(local, [105, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardX   = interpolate(cardIn, [0, 1], [140, 0]) - cardOut * (W + 100);
  const cardOp  = interpolate(local, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pulseOp = 0.65 + Math.sin(local * 0.25) * 0.35;
  const barFill = interpolate(clamp(local - 20, 0, 55), [0, 55], [0, 57], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      background: 'rgba(4,7,15,0.92)', border: `1px solid ${AMBER}55`, borderRadius: 28,
      padding: '32px 40px', width: 920, boxShadow: `0 0 60px ${AMBER}15`,
      transform: `translateX(${cardX}px)`, opacity: cardOp,
    }}>
      <div style={{ fontFamily: MONO, fontSize: 20, color: AMBER, letterSpacing: '0.25em', marginBottom: 24, opacity: 0.85 }}>
        ⚡ FIGHT CAMP · ACTIVE
      </div>
      <div style={{ fontFamily: BEBAS, fontSize: 72, color: RED, letterSpacing: '0.03em', lineHeight: 1, marginBottom: 20, textShadow: `0 0 40px ${RED}66` }}>
        10 DAYS TO FIGHT NIGHT
      </div>
      <div style={{ fontFamily: MONO, fontSize: 22, color: WHITE, letterSpacing: '0.1em', marginBottom: 16 }}>
        <span style={{ color: 'rgba(255,255,255,0.45)' }}>WEIGHT  </span>
        <span>81.5kg → 77kg  </span>
        <span style={{ color: GREEN }}>ON TRACK</span>
      </div>
      <div style={{ height: 7, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 20 }}>
        <div style={{ height: '100%', width: `${barFill}%`, background: AMBER, borderRadius: 4 }} />
      </div>
      <div style={{
        display: 'inline-block', background: `${AMBER}22`, border: `1px solid ${AMBER}66`,
        borderRadius: 20, padding: '8px 24px',
        fontFamily: MONO, fontSize: 20, color: AMBER, letterSpacing: '0.2em', opacity: pulseOp,
      }}>PEAK WEEK</div>
    </div>
  );
}

const FEATURES = [
  { text: 'MORNING BRIEF', color: CYAN   },
  { text: 'FIGHT CAMP',    color: AMBER  },
  { text: 'WEIGHT CUT',    color: GREEN  },
  { text: 'AI SESSIONS',   color: PURPLE },
];

function FeatureCuts({ lf }) {
  const local    = lf - 270;
  if (local < 0) return null;
  const cutLen   = 22;
  const cutIdx   = clamp(Math.floor(local / cutLen), 0, FEATURES.length - 1);
  const cutAge   = local % cutLen;
  const feat     = FEATURES[cutIdx];
  const isGlitch = cutAge < 4;
  const fadeIn   = interpolate(cutAge, [0, 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, background: DARK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      {cutAge < 2 && (
        <div style={{
          position: 'absolute', inset: 0, background: WHITE,
          opacity: interpolate(cutAge, [0, 2], [0.75, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          zIndex: 50,
        }} />
      )}
      <GlitchText active={isGlitch} style={{
        fontFamily: BEBAS, fontSize: 130, color: feat.color, letterSpacing: '0.04em', lineHeight: 1,
        opacity: fadeIn, textShadow: `0 0 50px ${feat.color}99`, textAlign: 'center',
      }}>{feat.text}</GlitchText>
      <div style={{ width: 220, height: 2, background: `linear-gradient(90deg, transparent, ${feat.color}, transparent)`, opacity: fadeIn }} />
    </div>
  );
}

function S5LeftText({ lf }) {
  const line = (startLf, text, color) => {
    const inSp = sp(clamp(lf - startLf, 0, 999), 0, 1, 16, 140);
    return (
      <div style={{
        fontFamily: BEBAS, fontSize: 76, color, letterSpacing: '0.04em', lineHeight: 1.15,
        opacity: inSp, transform: `translateX(${interpolate(inSp, [0, 1], [-30, 0])}px)`,
      }}>{text}</div>
    );
  };
  const aOp = interpolate(lf, [135, 150], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bOp = interpolate(lf, [255, 268], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', left: 72, top: 140 }}>
      {lf < 152 && (
        <div style={{ opacity: aOp }}>
          {line(75,  'KNOW WHO',    WHITE)}
          {line(90,  'TO PUSH.',    GREEN)}
          <div style={{ height: 20 }} />
          {line(110, 'KNOW WHO',    WHITE)}
          {line(125, 'TO PROTECT.', RED)}
        </div>
      )}
      {lf >= 152 && lf < 270 && (
        <div style={{ opacity: bOp }}>
          {line(195, 'YOUR WHOLE CAMP.', WHITE)}
          {line(215, 'ONE PLACE.',       AMBER)}
        </div>
      )}
    </div>
  );
}

function Scene5({ lf }) {
  const showA = lf < 155;
  const showB = lf >= 148 && lf < 272;
  const showC = lf >= 270;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/gym-dark.mp4')} brightness={0.1} contrast={1.15} saturate={0.55} fallbackColor="#050810" />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(4,7,15,0.88) 0%, rgba(4,7,15,0.35) 50%, rgba(4,7,15,0.88) 100%)' }} />
      <Scanlines opacity={0.035} />
      {showA && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 140, display: 'flex', justifyContent: 'center' }}>
          <MorningBriefCard lf={lf} />
        </div>
      )}
      {showB && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 140, display: 'flex', justifyContent: 'center' }}>
          <FightCampCard lf={lf} />
        </div>
      )}
      {showC && <FeatureCuts lf={lf} />}
      {!showC && <S5LeftText lf={lf} />}
    </div>
  );
}

// ━━━ SCENE 6 — ATHLETE RESULT (990–1200, 33–40s) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// fighter-rest (exhausted) → cut → mma-training (sharp/focused)
const RESULTS = [
  { name: 'PRIYA',  call: 'PUSH HARD.',    color: GREEN },
  { name: 'JAKE',   call: 'TRAIN NORMAL.', color: CYAN  },
  { name: 'MARCUS', call: 'REST DAY.',     color: RED   },
];

function Scene6({ lf }) {
  const cutAt   = 100;
  const showMMA = lf >= cutAt;
  const fadeAll = interpolate(lf, [195, 208], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const knewIn  = sp(clamp(lf - 130, 0, 999), 0, 1, 22, 90);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: fadeAll }}>
      {!showMMA && <BgVideo src={staticFile('footage/fighter-rest.mp4')} brightness={0.2} contrast={1.05} fallbackColor="#04070a" />}
      {showMMA  && <BgVideo src={staticFile('footage/mma-training.mp4')} brightness={0.25} contrast={1.15} saturate={0.85} fallbackColor="#04070a" />}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 25%, rgba(245,158,11,0.08) 100%)' }} />
      <Scanlines opacity={0.04} />
      <CutFlash lf={lf} at={cutAt} />

      <div style={{ position: 'absolute', left: 72, right: 72, top: '26%', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {RESULTS.map((r, i) => {
          const lineAge = clamp(lf - i * 30 - 2, 0, 22);
          const lineW   = interpolate(lineAge, [0, 22], [0, W - 144], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const rowIn   = sp(clamp(lf - i * 30 - 22, 0, 999), 0, 1, 18, 140);
          return (
            <div key={r.name} style={{ marginBottom: 44 }}>
              <div style={{ height: 2, width: lineW, background: r.color, opacity: 0.55, marginBottom: 14 }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, opacity: rowIn, transform: `translateX(${interpolate(rowIn, [0, 1], [-44, 0])}px)` }}>
                <span style={{ fontFamily: MONO, fontSize: 32, color: AMBER, letterSpacing: '0.08em' }}>{r.name}</span>
                <span style={{ fontFamily: MONO, fontSize: 24, color: 'rgba(255,255,255,0.35)' }}>—</span>
                <span style={{ fontFamily: BEBAS, fontSize: 64, color: r.color, letterSpacing: '0.04em', lineHeight: 1 }}>{r.call}</span>
              </div>
            </div>
          );
        })}
        <div style={{
          marginTop: 20, fontFamily: BEBAS, fontSize: 72, color: WHITE, letterSpacing: '0.04em',
          opacity: knewIn, transform: `translateY(${interpolate(knewIn, [0, 1], [24, 0])}px)`,
        }}>YOU ALREADY KNEW.</div>
      </div>
    </div>
  );
}

// ━━━ SCENE 7 — CTA (1200–1350, 40–45s) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Scene7({ lf }) {
  const logoSp    = sp(clamp(lf - 10, 0, 999), 0, 1, 14, 200);
  const wordIn    = sp(clamp(lf - 20, 0, 999), 0, 1, 16, 200);
  const ruleW     = interpolate(clamp(lf - 30, 0, 28), [0, 28], [0, 560], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const price     = Math.round(interpolate(
    clamp(lf - 42, 0, 22), [0, 22], [0, 99],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) },
  ));
  const onceIn    = sp(clamp(lf - 52, 0, 999), 0, 1, 16, 200);
  const noSubIn   = sp(clamp(lf - 62, 0, 999), 0, 1, 18, 180);
  const urlPulse  = lf >= 72 ? 0.5 + Math.sin((lf - 72) * 0.2) * 0.18 : 0;
  const glowBurst = interpolate(lf, [106, 112, 120], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const mainFade  = interpolate(lf, [115, 124], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const endLogoOp = interpolate(lf, [122, 126], [0, 0.7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, background: DARK }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at center, rgba(0,212,240,${0.05 + glowBurst * 0.15}) 0%, transparent 55%)` }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: mainFade }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ transform: `scale(${logoSp})`, filter: `drop-shadow(0 0 30px rgba(0,212,240,${0.5 + glowBurst * 0.4}))` }}>
            <LogoMark size={80} />
          </div>
          <div style={{ fontFamily: BEBAS, fontSize: 72, letterSpacing: '0.07em', color: WHITE, opacity: wordIn, textShadow: `0 0 40px ${CYAN}44` }}>
            STRIKEPANEL™
          </div>
          <div style={{ width: ruleW, height: 1, background: CYAN, opacity: 0.55 }} />
          <div style={{ fontFamily: BEBAS, fontSize: 120, color: AMBER, letterSpacing: '0.04em', lineHeight: 1, textShadow: `0 0 60px ${AMBER}77`, opacity: lf >= 42 ? 1 : 0 }}>
            ${price}
          </div>
          <div style={{ fontFamily: BEBAS, fontSize: 80, color: WHITE, letterSpacing: '0.06em', opacity: onceIn }}>ONCE.</div>
          <div style={{ fontFamily: MONO, fontSize: 22, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.2em', opacity: noSubIn }}>
            NO SUBSCRIPTION. EVER.
          </div>
          <div style={{ fontFamily: MONO, fontSize: 26, color: CYAN, letterSpacing: '0.18em', opacity: urlPulse }}>
            strikepanel.vercel.app/demo
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', inset: 0, background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: endLogoOp }}>
        <div style={{ filter: 'drop-shadow(0 0 20px rgba(0,212,240,0.45))' }}>
          <LogoMark size={40} />
        </div>
      </div>
    </div>
  );
}

// ━━━ Root ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function Trailer() {
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
      <div style={{ position: 'absolute', inset: 0, zIndex: 95, pointerEvents: 'none', filter: 'url(#grain)', opacity: 0.05, background: WHITE }} />

      {/* S1: Cold Open — fighter-prep.mp4 */}
      <Sequence from={0} durationInFrames={120}>
        <Scene1 lf={frame} />
        <DarkFlash lf={frame} />
      </Sequence>

      {/* S2: The Problem — 3 cuts */}
      <Sequence from={120} durationInFrames={60}>
        <S2Cut lf={frame - 120} videoSrc="footage/boxer-bag.mp4"    text="COACHES WALK IN BLIND."     brightness={0.25} contrast={1.25} />
      </Sequence>
      <Sequence from={180} durationInFrames={60}>
        <S2Cut lf={frame - 180} videoSrc="footage/coach.mp4"        text="GUESSING WHO'S READY."      brightness={0.3}  contrast={1.2}  />
      </Sequence>
      <Sequence from={240} durationInFrames={60}>
        <S2Cut lf={frame - 240} videoSrc="footage/fighter-rest.mp4" text="GUESSING WHO NEEDS REST."   brightness={0.25} contrast={1.15} />
      </Sequence>

      {/* S3: The Silence — mma-training.mp4 */}
      <Sequence from={300} durationInFrames={150}>
        <Scene3 lf={frame - 300} />
        <DarkFlash lf={frame - 300} />
      </Sequence>

      {/* S4: Logo Reveal */}
      <Sequence from={450} durationInFrames={150}>
        <Scene4 lf={frame - 450} />
        <DarkFlash lf={frame - 450} />
      </Sequence>

      {/* S5: Product — gym-dark.mp4 */}
      <Sequence from={600} durationInFrames={390}>
        <Scene5 lf={frame - 600} />
        <DarkFlash lf={frame - 600} />
      </Sequence>

      {/* S6: Athlete Result — fighter-rest → mma-training cut */}
      <Sequence from={990} durationInFrames={210}>
        <Scene6 lf={frame - 990} />
        <DarkFlash lf={frame - 990} />
      </Sequence>

      {/* S7: CTA */}
      <Sequence from={1200} durationInFrames={150}>
        <Scene7 lf={frame - 1200} />
      </Sequence>
    </div>
  );
}
