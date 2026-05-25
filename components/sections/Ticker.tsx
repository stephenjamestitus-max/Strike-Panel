const items = ['MORNING BRIEF','FIGHT CAMP','ATHLETE MANAGEMENT','AI SESSIONS','PROGRESS TRACKING','WEIGHT CUT TOOLS','FIGHT COUNTDOWN','READINESS SCORES']

export default function Ticker() {
  const repeated = [...items, ...items]
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(200,137,42,0.35)', borderBottom: '1px solid rgba(200,137,42,0.35)', padding: '14px 0', background: '#08090f', position: 'relative', zIndex: 10 }}>
      <div style={{ display: 'flex', gap: 0, width: 'max-content', animation: 'ticker 40s linear infinite' }}>
        {repeated.map((item, i) => (
          <span key={i} style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 3, color: '#e8dcc8', textTransform: 'uppercase', whiteSpace: 'nowrap', padding: '0 32px' }}>
            {item}<span style={{ color: 'var(--amber)', marginLeft: 32 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
