import React from 'react';
import {
  useCurrentFrame, useVideoConfig,
  spring, interpolate, Easing,
  Sequence, OffthreadVideo, staticFile,
} from 'remotion';
import { loadFont as loadBebas } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadDMMono } from '@remotion/google-fonts/DMMono';

loadBebas();
loadDMMono();

const W = 1080, H = 1920;
const CYAN  = '#00D4F0';
const AMBER = '#c8892a';
const RED   = '#ef4444';
const GREEN = '#10b981';
const WHITE = '#FFFFFF';
const DARK  = '#04070f';
const BEBAS = "'Bebas Neue', sans-serif";
const MONO  = "'DM Mono', monospace";

function sp(frame, from = 0, to = 1, damping = 14, stiffness = 160) {
  return spring({ frame, fps: 30, config: { damping, stiffness }, from, to });
}

// ── Film grain ─────────────────────────────────────────────────────────────────
function FilmGrain() {
  const frame = useCurrentFrame();
  const seed = (frame * 1.7) % 1000;
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', mixBlendMode: 'screen', opacity: 0.045 }}>
      <filter id={`grain-${frame % 4}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed={seed} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grain-${frame % 4})`} />
    </svg>
  );
}

// ── White flash cut ────────────────────────────────────────────────────────────
function FlashCut({ localFrame }) {
  const op = interpolate(localFrame, [0, 1, 3], [1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <div style={{ position: 'absolute', inset: 0, background: WHITE, opacity: op, pointerEvents: 'none' }} />;
}

// ── SP Crosshair logo ──────────────────────────────────────────────────────────
function SPLogo({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
      <circle cx="45" cy="45" r="43" fill="#0b0d14" stroke={CYAN} strokeWidth="1.5" />
      <circle cx="45" cy="45" r="29" fill="none" stroke={CYAN} strokeWidth="0.9" strokeOpacity="0.3" />
      <line x1="45" y1="2"  x2="45" y2="26" stroke={CYAN} strokeWidth="3" strokeLinecap="round" />
      <line x1="45" y1="64" x2="45" y2="88" stroke={CYAN} strokeWidth="3" strokeLinecap="round" />
      <line x1="2"  y1="45" x2="26" y2="45" stroke={CYAN} strokeWidth="3" strokeLinecap="round" />
      <line x1="64" y1="45" x2="88" y2="45" stroke={CYAN} strokeWidth="3" strokeLinecap="round" />
      <circle cx="45" cy="45" r="11" fill={CYAN} />
      <text x="45" y="49.5" fontFamily="'Bebas Neue', sans-serif" fontSize="9" fontWeight="800"
        fill="#0b0d14" textAnchor="middle" letterSpacing="0.5">SP</text>
    </svg>
  );
}

// ── RGB Glitch text ────────────────────────────────────────────────────────────
function GlitchText({ text, style, localFrame, startFrame = 0 }) {
  const t = Math.max(0, localFrame - startFrame);
  const progress = interpolate(t, [0, 4, 8], [0, 1, 0], { extrapolateRight: 'clamp' });
  const offset = progress * 6;
  return (
    <div style={{ position: 'relative', ...style }}>
      <span style={{ position: 'absolute', color: RED,  left: -offset, top: offset,  opacity: 0.8 }}>{text}</span>
      <span style={{ position: 'absolute', color: CYAN, left: offset,  top: -offset, opacity: 0.8 }}>{text}</span>
      <span style={{ position: 'relative', color: style.color || WHITE }}>{text}</span>
    </div>
  );
}

// ── BG Video ───────────────────────────────────────────────────────────────────
function BgVideo({ src, brightness = 0.5, contrast = 1.1, sepia = 0, startFrom = 0, endAt, transformExtra = '' }) {
  const filter = `brightness(${brightness}) contrast(${contrast})${sepia > 0 ? ` sepia(${sepia})` : ''}`;
  const props = { src, volume: 0, style: { position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%,-50%) ${transformExtra}`, minWidth: '100%', minHeight: '100%', objectFit: 'cover', filter } };
  if (startFrom) props.startFrom = startFrom * 30;
  if (endAt)     props.endAt     = endAt * 30;
  return <OffthreadVideo {...props} />;
}

// ── Morning Brief Card ─────────────────────────────────────────────────────────
function MorningBriefCard({ localFrame }) {
  const slideIn = sp(Math.max(0, localFrame - 0), 120, 0);

  function AthleteRow({ name, score, color, badge, delay, maxScore }) {
    const rowFrame = Math.max(0, localFrame - delay);
    const countedScore = Math.round(interpolate(rowFrame, [0, 60], [0, score], { extrapolateRight: 'clamp' }));
    const barWidth     = interpolate(rowFrame, [0, 60], [0, (score / 100) * 220], { extrapolateRight: 'clamp' });
    const badgeBg = color === GREEN ? '#052e1a' : color === RED ? '#2d0a0a' : '#0a2030';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}` }} />
        <span style={{ fontFamily: MONO, fontSize: 18, color: WHITE, width: 72, letterSpacing: 1 }}>{name}</span>
        <span style={{ fontFamily: BEBAS, fontSize: 28, color, width: 46, textAlign: 'right' }}>{countedScore}</span>
        <div style={{ width: 220, height: 6, background: '#1a2a3a', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ width: barWidth, height: '100%', background: color, borderRadius: 3, boxShadow: `0 0 6px ${color}`, transition: 'none' }} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 12, color, background: badgeBg, border: `1px solid ${color}`, borderRadius: 3, padding: '2px 6px', letterSpacing: 1 }}>{badge}</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', right: 40, top: '50%', transform: `translateX(${slideIn}px) translateY(-50%)`, width: 480, background: '#0f1828', border: `1.5px solid ${CYAN}`, borderRadius: 12, padding: 28, boxShadow: `0 0 40px ${CYAN}44, 0 0 80px ${CYAN}22` }}>
      <div style={{ fontFamily: MONO, fontSize: 13, color: CYAN, letterSpacing: 3, marginBottom: 18, borderBottom: `1px solid ${CYAN}44`, paddingBottom: 12 }}>MORNING BRIEF · TODAY</div>
      <AthleteRow name="PRIYA"  score={91} color={GREEN} badge="PUSH HARD"   delay={20} maxScore={91} />
      <AthleteRow name="JAKE"   score={74} color={CYAN}  badge="TRAIN NORMAL" delay={35} maxScore={74} />
      <AthleteRow name="MARCUS" score={38} color={RED}   badge="REST DAY"    delay={50} maxScore={38} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 1: Cold Open (0-60)
// ═══════════════════════════════════════════════════════════════════════════════
function Scene1() {
  const f = useCurrentFrame();
  const everyScale   = sp(Math.max(0, f - 20), 3, 1);
  const everyOpacity = interpolate(f, [20, 22, 55, 60], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const morningScale   = sp(Math.max(0, f - 40), 3, 1);
  const morningOpacity = interpolate(f, [40, 42, 55, 60], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <FilmGrain />
      <div style={{ fontFamily: BEBAS, fontSize: 160, color: WHITE, letterSpacing: 8, lineHeight: 1, transform: `scale(${everyScale})`, opacity: everyOpacity, textShadow: '0 0 40px rgba(255,255,255,0.5)' }}>EVERY</div>
      <div style={{ fontFamily: BEBAS, fontSize: 160, letterSpacing: 8, lineHeight: 1, transform: `scale(${morningScale})`, opacity: morningOpacity, color: AMBER, textShadow: '0 0 60px rgba(200,137,42,0.9), 0 0 120px rgba(200,137,42,0.5)' }}>MORNING.</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2: Gym Arrival (60-150)
// ═══════════════════════════════════════════════════════════════════════════════
function Scene2() {
  const f = useCurrentFrame();
  const kenBurns = interpolate(f, [0, 90], [1, 1.08], { extrapolateRight: 'clamp' });
  const coachY   = sp(Math.max(0, f - 10), 60, 0);
  const walksY   = sp(Math.max(0, f - 20), 60, 0);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/gym-arrive-p.mp4')} brightness={0.65} sepia={0.15} startFrom={2} endAt={5} transformExtra={`scale(${kenBurns})`} />
      <FilmGrain />
      {f < 3 && <FlashCut localFrame={f} />}
      <div style={{ position: 'absolute', bottom: 260, left: 60, right: 60 }}>
        <div style={{ fontFamily: BEBAS, fontSize: 90, color: WHITE, letterSpacing: 6, transform: `translateY(${coachY}px)` }}>A COACH</div>
        <div style={{ fontFamily: BEBAS, fontSize: 90, color: AMBER, letterSpacing: 6, transform: `translateY(${walksY}px)`, textShadow: `0 0 30px ${AMBER}66` }}>WALKS IN.</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3: Fight Intense (150-210)
// ═══════════════════════════════════════════════════════════════════════════════
function Scene3() {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/fight-intense-p.mp4')} brightness={0.55} contrast={1.4} startFrom={0} endAt={2} />
      <FilmGrain />
      {f < 3 && <FlashCut localFrame={f} />}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <GlitchText
          text="GUESSING."
          localFrame={f}
          startFrame={5}
          style={{ fontFamily: BEBAS, fontSize: 120, color: RED, letterSpacing: 6, textShadow: `0 0 30px ${RED}99` }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 4: Boxer Injured (210-270)
// ═══════════════════════════════════════════════════════════════════════════════
function Scene4() {
  const f = useCurrentFrame();
  const line1Y = sp(Math.max(0, f - 8),  40, 0);
  const line2Y = sp(Math.max(0, f - 18), 40, 0);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/boxer-injured-p.mp4')} brightness={0.45} contrast={1.2} startFrom={1} endAt={3} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, #2a150080 80%, #1a0800cc 100%)' }} />
      <FilmGrain />
      {f < 3 && <FlashCut localFrame={f} />}
      <div style={{ position: 'absolute', bottom: 300, left: 60, right: 60 }}>
        <div style={{ fontFamily: BEBAS, fontSize: 80, color: WHITE, letterSpacing: 5, transform: `translateY(${line1Y}px)` }}>WHO'S READY.</div>
        <div style={{ fontFamily: BEBAS, fontSize: 80, color: RED, letterSpacing: 5, transform: `translateY(${line2Y}px)`, textShadow: `0 0 20px ${RED}66` }}>WHO NEEDS REST.</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 5: Fighter Resting (270-330)
// ═══════════════════════════════════════════════════════════════════════════════
function Scene5() {
  const f = useCurrentFrame();
  const line1Y    = sp(Math.max(0, f - 5),  40, 0);
  const slamScale = sp(Math.max(0, f - 40), 3, 1, 10, 200);
  const slamOp    = interpolate(f, [40, 42], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/fighter-rest-p.mp4')} brightness={0.4} startFrom={1} endAt={3} />
      <FilmGrain />
      {f < 3 && <FlashCut localFrame={f} />}
      <div style={{ position: 'absolute', bottom: 300, left: 60, right: 60 }}>
        <div style={{ fontFamily: BEBAS, fontSize: 80, color: WHITE, letterSpacing: 5, transform: `translateY(${line1Y}px)` }}>YOU DON'T KNOW.</div>
        <div style={{ fontFamily: BEBAS, fontSize: 100, color: RED, letterSpacing: 5, transform: `scale(${slamScale})`, transformOrigin: 'left center', opacity: slamOp, textShadow: `0 0 30px ${RED}99` }}>YOU NEVER KNOW.</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 6: The Silence (330-390)
// ═══════════════════════════════════════════════════════════════════════════════
function Scene6() {
  const f = useCurrentFrame();
  const textOp   = interpolate(f, [20, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glowSize = interpolate(f, [0, 60], [0, 400], { extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', width: glowSize, height: glowSize, borderRadius: '50%', background: `radial-gradient(circle, ${CYAN}66 0%, transparent 70%)`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
      <FilmGrain />
      <div style={{ fontFamily: BEBAS, fontSize: 130, color: WHITE, letterSpacing: 6, opacity: textOp, textShadow: '0 0 80px rgba(255,255,255,0.6), 0 0 40px rgba(0,212,240,0.5)' }}>Until now.</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 7: Product Reveal (390-540)
// ═══════════════════════════════════════════════════════════════════════════════
function Scene7() {
  const f = useCurrentFrame();
  const textLines = [
    { text: 'KNOW WHO',     color: WHITE },
    { text: 'TO PUSH.',     color: GREEN },
    { text: 'KNOW WHO',     color: WHITE },
    { text: 'TO PROTECT.',  color: RED },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/bag-work-slow.mp4')} brightness={0.15} startFrom={4} endAt={14} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #04070fcc 50%, transparent 100%)' }} />
      <FilmGrain />
      {f < 3 && <FlashCut localFrame={f} />}

      {/* Left text */}
      <div style={{ position: 'absolute', left: 50, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {textLines.map(({ text, color }, i) => {
          const lineY = sp(Math.max(0, f - 10 - i * 12), 40, 0);
          return (
            <div key={i} style={{ fontFamily: BEBAS, fontSize: 72, color, letterSpacing: 4, lineHeight: 1, transform: `translateY(${lineY}px)`, textShadow: color !== WHITE ? `0 0 20px ${color}88` : 'none' }}>
              {text}
            </div>
          );
        })}
      </div>

      {/* Morning Brief Card */}
      <MorningBriefCard localFrame={f} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 8: Aerial Shot (540-630)
// ═══════════════════════════════════════════════════════════════════════════════
function Scene8() {
  const f = useCurrentFrame();
  const line1Y = sp(Math.max(0, f - 10), 50, 0);
  const line2Y = sp(Math.max(0, f - 20), 50, 0);
  const line3Y = sp(Math.max(0, f - 30), 50, 0);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BgVideo src={staticFile('footage/fight-aerial.mp4')} brightness={0.55} contrast={1.4} startFrom={1} endAt={4} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, #04070fcc 100%)' }} />
      <FilmGrain />
      {f < 3 && <FlashCut localFrame={f} />}
      <div style={{ position: 'absolute', bottom: 200, left: 60, right: 60 }}>
        <div style={{ fontFamily: BEBAS, fontSize: 72, color: WHITE, letterSpacing: 5, transform: `translateY(${line1Y}px)` }}>EVERY ATHLETE.</div>
        <div style={{ fontFamily: BEBAS, fontSize: 72, color: CYAN, letterSpacing: 5, transform: `translateY(${line2Y}px)`, textShadow: `0 0 30px ${CYAN}99` }}>SCORED.</div>
        <div style={{ fontFamily: MONO, fontSize: 28, color: '#888', letterSpacing: 3, transform: `translateY(${line3Y}px)`, marginTop: 8 }}>EVERY MORNING.</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 9: CTA (630-720)
// ═══════════════════════════════════════════════════════════════════════════════
function Scene9() {
  const f = useCurrentFrame();

  const logoScale  = sp(Math.max(0, f - 10), 0, 1);
  const nameOp     = interpolate(f, [25, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lineWidth  = interpolate(f, [35, 55], [0, 960], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const priceCount = Math.round(interpolate(f, [45, 75], [0, 99], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const priceOp    = interpolate(f, [45, 47], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sub1Op     = interpolate(f, [60, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sub2Op     = interpolate(f, [75, 85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const glowPulse = interpolate(Math.sin(f * 0.15), [-1, 1], [0.3, 0.6]);
  const glowSize  = interpolate(Math.sin(f * 0.1), [-1, 1], [300, 500]);

  return (
    <div style={{ position: 'absolute', inset: 0, background: DARK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
      <div style={{ position: 'absolute', width: glowSize, height: glowSize, borderRadius: '50%', background: `radial-gradient(circle, ${CYAN}${Math.round(glowPulse * 255).toString(16).padStart(2,'0')} 0%, transparent 70%)`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
      <FilmGrain />

      <div style={{ transform: `scale(${logoScale})` }}>
        <SPLogo size={140} />
      </div>
      <div style={{ fontFamily: BEBAS, fontSize: 90, color: WHITE, letterSpacing: 8, marginTop: 20, opacity: nameOp, textShadow: '0 0 30px rgba(255,255,255,0.4)' }}>STRIKEPANEL™</div>
      <div style={{ width: lineWidth, height: 1, background: CYAN, margin: '16px 0', boxShadow: `0 0 10px ${CYAN}` }} />
      <div style={{ fontFamily: BEBAS, fontSize: 160, color: AMBER, letterSpacing: 4, opacity: priceOp, textShadow: '0 0 60px rgba(200,137,42,1), 0 0 120px rgba(200,137,42,0.6)', lineHeight: 1 }}>${priceCount}.</div>
      <div style={{ fontFamily: BEBAS, fontSize: 50, color: WHITE, letterSpacing: 4, opacity: sub1Op, marginTop: 8 }}>ONCE. YOURS FOREVER.</div>
      <div style={{ fontFamily: MONO, fontSize: 22, color: '#666', letterSpacing: 3, opacity: sub2Op, marginTop: 10 }}>NO SUBSCRIPTION. EVER.</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 10: Outro (720-750)
// ═══════════════════════════════════════════════════════════════════════════════
function Scene10() {
  const f = useCurrentFrame();
  const urlPulse  = interpolate(Math.sin(f * 0.4), [-1, 1], [0.6, 1]);
  const fadeOut   = interpolate(f, [20, 30], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const logoOp    = interpolate(f, [25, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <FilmGrain />
      <div style={{ fontFamily: MONO, fontSize: 26, color: CYAN, letterSpacing: 2, opacity: urlPulse * fadeOut, textShadow: `0 0 20px ${CYAN}99` }}>strikepanel.vercel.app/demo</div>
      <div style={{ position: 'absolute', bottom: 100, opacity: logoOp }}>
        <SPLogo size={60} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════════
export function Reel() {
  return (
    <div style={{ width: W, height: H, background: DARK, overflow: 'hidden', position: 'relative' }}>
      <Sequence from={0}   durationInFrames={60}>  <Scene1 /></Sequence>
      <Sequence from={60}  durationInFrames={90}>  <Scene2 /></Sequence>
      <Sequence from={150} durationInFrames={60}>  <Scene3 /></Sequence>
      <Sequence from={210} durationInFrames={60}>  <Scene4 /></Sequence>
      <Sequence from={270} durationInFrames={60}>  <Scene5 /></Sequence>
      <Sequence from={330} durationInFrames={60}>  <Scene6 /></Sequence>
      <Sequence from={390} durationInFrames={150}> <Scene7 /></Sequence>
      <Sequence from={540} durationInFrames={90}>  <Scene8 /></Sequence>
      <Sequence from={630} durationInFrames={90}>  <Scene9 /></Sequence>
      <Sequence from={720} durationInFrames={30}>  <Scene10 /></Sequence>
    </div>
  );
}
