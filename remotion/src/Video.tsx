import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const CYAN = '#00D4F0';
const BG = '#0b0d14';
const SURFACE = '#13161f';

// Easing
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function useFade(startFrame: number, duration = 18) {
  const frame = useCurrentFrame();
  return interpolate(frame - startFrame, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

function useSlideUp(startFrame: number, duration = 22) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });
  return interpolate(progress, [0, 1], [40, 0]);
}

// ── Scene components ──────────────────────────────────────────────

const TitleScene: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const opacity = useFade(startFrame, 20);
  const y = useSlideUp(startFrame, 24);
  const glowOpacity = interpolate(frame - startFrame, [0, 40, 80], [0, 0.6, 0.35], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', width: 600, height: 400, borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(0,212,240,${glowOpacity}) 0%, transparent 70%)`,
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      }} />
      {/* Logo orb */}
      <div style={{ transform: `translateY(${y}px)`, marginBottom: 32, position: 'relative' }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <defs>
            <radialGradient id="orbfill" cx="38%" cy="32%" r="65%">
              <stop offset="0%" stopColor="#1e2844" />
              <stop offset="50%" stopColor="#0f1428" />
              <stop offset="100%" stopColor="#080c18" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="60" r="54" fill="url(#orbfill)" stroke={CYAN} strokeWidth="1.6" strokeOpacity="0.6" />
          <circle cx="60" cy="60" r="36" fill="none" stroke={CYAN} strokeWidth="1" strokeOpacity="0.22" />
          <line x1="60" y1="6"  x2="60" y2="33"  stroke={CYAN} strokeWidth="3" strokeLinecap="round" />
          <line x1="60" y1="87" x2="60" y2="114" stroke={CYAN} strokeWidth="3" strokeLinecap="round" />
          <line x1="6"  y1="60" x2="33" y2="60"  stroke={CYAN} strokeWidth="3" strokeLinecap="round" />
          <line x1="87" y1="60" x2="114" y2="60" stroke={CYAN} strokeWidth="3" strokeLinecap="round" />
          <line x1="19" y1="19" x2="27" y2="27" stroke={CYAN} strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.5" />
          <line x1="101" y1="101" x2="93" y2="93" stroke={CYAN} strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.5" />
          <line x1="101" y1="19" x2="93" y2="27" stroke={CYAN} strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.5" />
          <line x1="19" y1="101" x2="27" y2="93" stroke={CYAN} strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.5" />
          <circle cx="60" cy="60" r="13" fill={CYAN} />
          <circle cx="55.5" cy="55.5" r="4.5" fill="white" fillOpacity="0.25" />
          <text x="60" y="64.5" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="10" fill="#07111e" textAnchor="middle">SP</text>
        </svg>
      </div>
      {/* Brand name */}
      <div style={{ transform: `translateY(${y}px)`, textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Arial Black, sans-serif', fontWeight: 900,
          fontSize: 72, letterSpacing: 6, color: '#ffffff',
          textShadow: `0 0 40px rgba(0,212,240,0.3)`,
        }}>
          STRIKEPANEL<span style={{ fontSize: 28, verticalAlign: 'super', color: CYAN, opacity: 0.8 }}>™</span>
        </div>
        <div style={{
          fontFamily: 'Courier New, monospace', fontWeight: 700,
          fontSize: 16, letterSpacing: 8, color: CYAN, opacity: 0.75,
          marginTop: 10,
        }}>
          TRAINING INTELLIGENCE
        </div>
        <div style={{
          width: 320, height: 1.5, background: CYAN, opacity: 0.3,
          margin: '14px auto 0', borderRadius: 1,
        }} />
      </div>
    </AbsoluteFill>
  );
};

const ScreenScene: React.FC<{
  startFrame: number;
  imagePath: string;
  label: string;
  headline: string;
  sub: string;
  accentColor?: string;
}> = ({ startFrame, imagePath, label, headline, sub, accentColor = CYAN }) => {
  const frame = useCurrentFrame();
  const opacity = useFade(startFrame, 18);
  const textY = useSlideUp(startFrame + 8, 24);
  const imgScale = interpolate(frame - startFrame, [0, 30], [1.04, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: easeOut,
  });

  return (
    <AbsoluteFill style={{ background: BG, opacity }}>
      {/* Screenshot fills top ~72% */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '72%',
        overflow: 'hidden',
      }}>
        <img
          src={staticFile(imagePath)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            objectPosition: 'top',
            transform: `scale(${imgScale})`,
            transformOrigin: 'top center',
          }}
        />
        {/* Gradient fade into bottom bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: `linear-gradient(to bottom, transparent, ${BG})`,
        }} />
      </div>

      {/* Bottom text bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '32%',
        background: SURFACE,
        borderTop: `1px solid rgba(0,212,240,0.12)`,
        display: 'flex', alignItems: 'center', padding: '0 60px',
        gap: 0,
      }}>
        {/* Left accent bar */}
        <div style={{
          width: 3, height: 56, background: accentColor,
          borderRadius: 2, marginRight: 24, flexShrink: 0,
          opacity: 0.9,
        }} />
        <div style={{ transform: `translateY(${textY}px)` }}>
          {/* Label pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            fontFamily: 'Courier New, monospace', fontWeight: 700,
            fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
            color: accentColor, opacity: 0.85, marginBottom: 8,
          }}>
            {label}
          </div>
          {/* Headline */}
          <div style={{
            fontFamily: 'Arial Black, sans-serif', fontWeight: 900,
            fontSize: 30, color: '#ffffff', letterSpacing: 0.5,
            marginBottom: 6, lineHeight: 1.1,
          }}>
            {headline}
          </div>
          {/* Sub */}
          <div style={{
            fontFamily: 'Arial, sans-serif', fontSize: 16,
            color: '#7a85a0', lineHeight: 1.4,
          }}>
            {sub}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ClosingScene: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const opacity = useFade(startFrame, 20);
  const y1 = useSlideUp(startFrame, 20);
  const y2 = useSlideUp(startFrame + 8, 20);
  const y3 = useSlideUp(startFrame + 16, 20);

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse 80% 60% at 30% 40%, rgba(0,212,240,0.08) 0%, transparent 60%), ${BG}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 0, opacity,
    }}>
      {/* Top accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2.5, background: CYAN, opacity: 0.55 }} />

      <div style={{ transform: `translateY(${y1}px)`, marginBottom: 16, textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Arial Black, sans-serif', fontWeight: 900,
          fontSize: 64, letterSpacing: 4, color: '#ffffff',
        }}>
          STRIKEPANEL<span style={{ fontSize: 24, verticalAlign: 'super', color: CYAN, opacity: 0.8 }}>™</span>
        </div>
      </div>

      <div style={{ transform: `translateY(${y2}px)`, marginBottom: 40, textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Arial, sans-serif', fontSize: 20, color: '#94a3b8',
          letterSpacing: 1,
        }}>
          The only coaching dashboard built exclusively for combat sports.
        </div>
      </div>

      {/* Proof pills */}
      <div style={{
        transform: `translateY(${y3}px)`,
        display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
        marginBottom: 48,
      }}>
        {['$99 One-Time', 'No Subscription', 'Works Offline', 'Up to 20 Athletes'].map((pill) => (
          <div key={pill} style={{
            fontFamily: 'Courier New, monospace', fontWeight: 700,
            fontSize: 13, letterSpacing: 2, textTransform: 'uppercase',
            color: CYAN, padding: '8px 20px', borderRadius: 20,
            background: 'rgba(0,212,240,0.08)',
            border: '1px solid rgba(0,212,240,0.25)',
          }}>
            {pill}
          </div>
        ))}
      </div>

      {/* URL */}
      <div style={{
        transform: `translateY(${y3}px)`,
        fontFamily: 'Courier New, monospace', fontSize: 15,
        color: '#3d4560', letterSpacing: 4,
      }}>
        STRIKEPANEL.VERCEL.APP/DEMO
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5, background: CYAN, opacity: 0.3 }} />
    </AbsoluteFill>
  );
};

// ── Main composition ───────────────────────────────────────────────
// Timeline (30fps):
// 0–90    Title card           (3s)
// 90–360  Morning Brief        (9s)
// 360–630 Fight Dates          (9s)
// 630–900 Dashboard            (9s)
// 900–1170 Athletes            (9s)
// 1170–1440 Workouts           (9s)
// 1440–1800 Closing card       (12s)

export const strikepanelPromo: React.FC = () => {
  const frame = useCurrentFrame();

  const scenes = [
    { start: 0,    end: 90   },
    { start: 90,   end: 360  },
    { start: 360,  end: 630  },
    { start: 630,  end: 900  },
    { start: 900,  end: 1170 },
    { start: 1170, end: 1440 },
    { start: 1440, end: 1800 },
  ];

  const crossfade = (idx: number) => {
    const { start, end } = scenes[idx];
    if (frame < start) return 0;
    if (frame > end) return 0;
    const fadeIn  = interpolate(frame, [start, start + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const fadeOut = interpolate(frame, [end - 18, end],     [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return Math.min(fadeIn, fadeOut);
  };

  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={{ opacity: crossfade(0) }}>
        <TitleScene startFrame={0} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: crossfade(1) }}>
        <ScreenScene
          startFrame={90}
          imagePath="marketing/ph-screenshots/ph-morning-brief.png"
          label="Morning Brief"
          headline="Every athlete scored. Every morning."
          sub="Know who to push and who to protect before you leave the house."
          accentColor={CYAN}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: crossfade(2) }}>
        <ScreenScene
          startFrame={360}
          imagePath="marketing/ph-screenshots/ph-fight-dates.png"
          label="Fight Camp"
          headline="Fight camp on autopilot."
          sub="Countdowns, weight cut timelines, and phase tracking — all automated."
          accentColor="#ef4444"
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: crossfade(3) }}>
        <ScreenScene
          startFrame={630}
          imagePath="marketing/ph-screenshots/ph-dashboard.png"
          label="Dashboard"
          headline="Your whole squad. One view."
          sub="Readiness scores, fight dates, sessions — everything at a glance."
          accentColor="#8b5cf6"
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: crossfade(4) }}>
        <ScreenScene
          startFrame={900}
          imagePath="marketing/ph-screenshots/ph-athletes.png"
          label="Members"
          headline="Manage up to 20 athletes."
          sub="Full profiles, biometrics, sport, goals, injuries — all in one place."
          accentColor="#f59e0b"
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: crossfade(5) }}>
        <ScreenScene
          startFrame={1170}
          imagePath="marketing/ph-screenshots/ph-workouts.png"
          label="AI Session Builder"
          headline="Tell it your goal. Get a full session."
          sub="Gemini-powered, readiness-aware training plans built in seconds."
          accentColor="#10b981"
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: crossfade(6) }}>
        <ClosingScene startFrame={1440} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
