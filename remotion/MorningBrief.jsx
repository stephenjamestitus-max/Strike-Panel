import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  delayRender,
  continueRender,
} from 'remotion';
import { loadFont as loadBebas } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadDMMono } from '@remotion/google-fonts/DMMono';

// Load fonts at module level (called once)
const bebasFont  = loadBebas();
const dmMonoFont = loadDMMono();

// ── Shared sub-components ─────────────────────────────────────────────────────

const Grain = ({ opacity }) => {
  const frame = useCurrentFrame();
  const seed  = (frame * 7 + 3) % 256;
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill style={{ zIndex: 100, pointerEvents: 'none', opacity }}>
      <svg
        style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="gf">
          <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves={3} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#gf)" />
      </svg>
    </AbsoluteFill>
  );
};

const DotGrid = () => (
  <AbsoluteFill style={{
    backgroundImage: 'radial-gradient(circle, rgba(0,212,240,.038) 1.2px, transparent 1.2px)',
    backgroundSize: '44px 44px',
    zIndex: 1, pointerEvents: 'none',
  }} />
);

const Blobs = () => (
  <AbsoluteFill style={{ zIndex: 0, pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', width: 700, height: 700, top: -220, left: -220, borderRadius: '50%', filter: 'blur(120px)', background: 'rgba(0,212,240,.07)' }} />
    <div style={{ position: 'absolute', width: 500, height: 500, top: 300, right: -180, borderRadius: '50%', filter: 'blur(120px)', background: 'rgba(200,137,42,.065)' }} />
    <div style={{ position: 'absolute', width: 550, height: 550, bottom: -200, left: 50, borderRadius: '50%', filter: 'blur(120px)', background: 'rgba(139,92,246,.07)' }} />
  </AbsoluteFill>
);

const CornerMarks = () => {
  const b = { position: 'absolute', width: 28, height: 28, zIndex: 10, opacity: 0.22 };
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ ...b, top: 32, left: 32, borderTop: '1.5px solid #00D4F0', borderLeft: '1.5px solid #00D4F0' }} />
      <div style={{ ...b, top: 32, right: 32, borderTop: '1.5px solid #00D4F0', borderRight: '1.5px solid #00D4F0' }} />
      <div style={{ ...b, bottom: 32, left: 32, borderBottom: '1.5px solid #00D4F0', borderLeft: '1.5px solid #00D4F0' }} />
      <div style={{ ...b, bottom: 32, right: 32, borderBottom: '1.5px solid #00D4F0', borderRight: '1.5px solid #00D4F0' }} />
    </AbsoluteFill>
  );
};

const LogoSVG = () => (
  <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="12.5" stroke="#00D4F0" strokeWidth="1.5"/>
    <circle cx="14" cy="14" r="3.5" fill="#00D4F0" opacity="0.9"/>
    <line x1="14" y1="1.5"  x2="14" y2="8"    stroke="#00D4F0" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="14" y1="20"   x2="14" y2="26.5"  stroke="#00D4F0" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="1.5" y1="14"  x2="8"  y2="14"    stroke="#00D4F0" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="20"  y1="14"  x2="26.5" y2="14"  stroke="#00D4F0" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ── Athlete row ───────────────────────────────────────────────────────────────

const AthleteRow = ({ name, score, color, badge, slideStart, scoreStart, barStart, badgeStart, bebas, dmmono }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide in from left
  const sp = spring({ frame: frame - slideStart, fps, config: { damping: 22, stiffness: 200, mass: 0.7 }, from: 0, to: 1 });
  const x      = interpolate(sp, [0, 1], [-300, 0]);
  const rowOp  = Math.max(0, Math.min(1, sp * 2));

  // Score count up
  const displayScore = Math.round(interpolate(
    frame, [scoreStart, scoreStart + 40], [0, score],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }
  ));

  // Bar fill
  const barW = Math.max(0, interpolate(
    frame, [barStart, barStart + 40], [0, score],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  ));

  // Badge pop
  const bsp = Math.max(0, spring({ frame: frame - badgeStart, fps, config: { damping: 12, stiffness: 400, mass: 0.4 }, from: 0, to: 1 }));

  const isGreen = color === '#10b981';
  const isCyan  = color === '#00D4F0';
  const barBg      = isGreen ? 'linear-gradient(to right,#10b981,#34d399)' : isCyan ? 'linear-gradient(to right,#00D4F0,#67e8f9)' : 'linear-gradient(to right,#ef4444,#f87171)';
  const badgeBg    = isGreen ? 'rgba(16,185,129,.12)' : isCyan ? 'rgba(0,212,240,.1)'   : 'rgba(239,68,68,.1)';
  const badgeBord  = isGreen ? '1px solid rgba(16,185,129,.22)' : isCyan ? '1px solid rgba(0,212,240,.22)' : '1px solid rgba(239,68,68,.22)';

  return (
    <div style={{ transform: `translateX(${x}px)`, opacity: rowOp, marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <div style={{ fontFamily: dmmono, fontSize: 12, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(245,240,232,.6)', flex: 1 }}>
          {name}
        </div>
        <div style={{ fontFamily: bebas, fontSize: 36, lineHeight: 1, color, letterSpacing: 1, flexShrink: 0, marginRight: 2 }}>
          {displayScore}
        </div>
        <div style={{ fontFamily: dmmono, fontSize: 10, color: 'rgba(245,240,232,.28)', marginRight: 8, alignSelf: 'flex-end', paddingBottom: 4, flexShrink: 0 }}>
          /100
        </div>
        <div style={{
          fontFamily: dmmono, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: 5, whiteSpace: 'nowrap', flexShrink: 0,
          color, background: badgeBg, border: badgeBord,
          transform: `scale(${bsp})`, transformOrigin: 'right center',
        }}>
          {badge}
        </div>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${barW}%`, background: barBg, borderRadius: 3 }} />
      </div>
    </div>
  );
};

// ── Main composition ──────────────────────────────────────────────────────────

export const MorningBrief = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Font loading gate
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all([bebasFont.waitUntilDone(), dmMonoFont.waitUntilDone()])
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);

  const bebas  = bebasFont.fontFamily;
  const dmmono = dmMonoFont.fontFamily;

  // ── Grain: frames 0-15
  const grainOp = interpolate(frame, [0, 15], [0, 0.035], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Badge slide down: frames 15-30
  const bdgSp  = spring({ frame: frame - 15, fps, config: { damping: 20, stiffness: 200, mass: 0.6 }, from: 0, to: 1 });
  const bdgY   = interpolate(bdgSp, [0, 1], [-70, 0]);
  const bdgOp  = Math.min(1, Math.max(0, bdgSp * 2));
  const dotPulse = Math.sin((frame / fps) * Math.PI * 2) * 0.5 + 0.5;

  // ── Widget fade in at frame 28
  const widgetOp = interpolate(frame, [28, 38], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Live dot glow pulse
  const livePulse  = Math.sin((frame / fps) * Math.PI * 2.5) * 0.5 + 0.5;
  const liveShadow = `0 0 ${4 + livePulse * 6}px rgba(16,185,129,${0.4 + livePulse * 0.6})`;

  // ── Widget footer: frames 130-140
  const footOp = interpolate(frame, [130, 140], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Divider: frames 135-145
  const divOp = interpolate(frame, [135, 145], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Headline 1: frames 110-130
  const hl1Sp = spring({ frame: frame - 110, fps, config: { damping: 22, stiffness: 200, mass: 0.7 }, from: 0, to: 1 });
  const hl1Y  = interpolate(hl1Sp, [0, 1], [90, 0]);
  const hl1Op = Math.min(1, Math.max(0, hl1Sp * 3));

  // ── Headline 2: frames 120-140
  const hl2Sp = spring({ frame: frame - 120, fps, config: { damping: 22, stiffness: 200, mass: 0.7 }, from: 0, to: 1 });
  const hl2Y  = interpolate(hl2Sp, [0, 1], [90, 0]);
  const hl2Op = Math.min(1, Math.max(0, hl2Sp * 3));

  // ── Bottom row: frames 140-150
  const logoOp = interpolate(frame, [140, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#04070f', fontFamily: dmmono }}>
      <Blobs />
      <DotGrid />
      <Grain opacity={grainOp} />
      <CornerMarks />

      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <div style={{ width: 760, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>

          {/* ── Kicker badge ── */}
          <div style={{
            transform: `translateY(${bdgY}px)`, opacity: bdgOp,
            display: 'inline-flex', alignItems: 'center', gap: 9,
            background: 'rgba(0,212,240,.07)', border: '1px solid rgba(0,212,240,.22)',
            borderRadius: 100, padding: '9px 22px',
            fontFamily: dmmono, fontSize: 12, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#00D4F0',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: '#00D4F0', flexShrink: 0,
              boxShadow: `0 0 0 ${dotPulse * 7}px rgba(0,212,240,${(1 - dotPulse) * 0.8})`,
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>StrikePanel™</span>
              <span style={{ opacity: 0.35, fontSize: 10 }}>·</span>
              <span>Morning Brief</span>
              <span style={{ opacity: 0.35, fontSize: 10 }}>·</span>
              <span>SYS.LIVE</span>
            </div>
          </div>

          {/* ── Widget card ── */}
          <div style={{
            width: '100%', opacity: widgetOp,
            background: 'rgba(10,18,34,.82)', border: '1px solid rgba(0,212,240,.22)',
            borderRadius: 20, padding: '30px 34px',
            boxShadow: '0 0 60px rgba(0,212,240,.13), 0 32px 80px rgba(0,0,0,.75)',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,.06)',
            }}>
              <div style={{ fontFamily: dmmono, fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#7a85a0' }}>
                Morning Brief · Today
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: dmmono, fontSize: 10, letterSpacing: '1.5px', color: '#10b981' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: liveShadow }} />
                LIVE
              </div>
            </div>

            {/* Athletes */}
            <AthleteRow name="Priya"  score={91} color="#10b981" badge="Push Hard"    slideStart={30} scoreStart={60} barStart={70} badgeStart={90}  bebas={bebas} dmmono={dmmono} />
            <AthleteRow name="Jake"   score={74} color="#00D4F0" badge="Train Normal" slideStart={40} scoreStart={60} barStart={70} badgeStart={96}  bebas={bebas} dmmono={dmmono} />
            <AthleteRow name="Marcus" score={38} color="#ef4444" badge="Rest Day"     slideStart={50} scoreStart={60} barStart={70} badgeStart={102} bebas={bebas} dmmono={dmmono} />

            {/* Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.06)',
              opacity: footOp,
            }}>
              <div style={{ fontFamily: dmmono, fontSize: 11, color: '#7a85a0', letterSpacing: '.8px' }}>
                Squad Avg: <span style={{ color: '#f5f0e8' }}>68</span> · Morning Brief
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: dmmono, fontSize: 10, letterSpacing: '1.5px', color: '#10b981' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: liveShadow }} />
                SYS.LIVE
              </div>
            </div>
          </div>

          {/* ── Divider ── */}
          <div style={{
            width: '100%', height: 1, opacity: divOp,
            background: 'linear-gradient(to right,transparent,rgba(0,212,240,.2),rgba(200,137,42,.15),transparent)',
          }} />

          {/* ── Headline ── */}
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ overflow: 'hidden', lineHeight: 0.9 }}>
              <div style={{
                transform: `translateY(${hl1Y}px)`, opacity: hl1Op,
                fontFamily: bebas, fontSize: 88, letterSpacing: 3, color: '#fff', lineHeight: 0.9,
              }}>
                KNOW WHO TO PUSH.
              </div>
            </div>
            <div style={{ overflow: 'hidden', lineHeight: 0.9, marginTop: 4 }}>
              <div style={{
                transform: `translateY(${hl2Y}px)`, opacity: hl2Op,
                fontFamily: bebas, fontSize: 88, letterSpacing: 3, color: '#c8892a', lineHeight: 0.9,
                textShadow: '0 0 60px rgba(200,137,42,.55),0 0 120px rgba(200,137,42,.2)',
              }}>
                KNOW WHO TO PROTECT.
              </div>
            </div>
          </div>

          {/* ── Bottom row ── */}
          <div style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 2px', opacity: logoOp,
          }}>
            <div style={{ fontFamily: dmmono, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(122,133,160,.5)' }}>
              Training Intelligence for Combat Sports
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LogoSVG />
              <div style={{ fontFamily: bebas, fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', color: '#f5f0e8', display: 'flex', alignItems: 'baseline' }}>
                <span>Strike</span>
                <span style={{ color: '#00D4F0' }}>Panel</span>
                <span style={{ fontFamily: dmmono, fontSize: 9, color: 'rgba(0,212,240,.6)', verticalAlign: 'super', letterSpacing: '.5px' }}>™</span>
              </div>
            </div>
          </div>

        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
