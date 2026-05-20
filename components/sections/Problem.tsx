const problems = [
  'Tracking athletes in spreadsheets',
  'No fight camp timeline tools',
  'Guessing readiness and recovery',
  'Losing athlete history between camps',
]
const fixes = [
  'One dashboard for every athlete',
  'Full fight camp timelines with phase tracking',
  'Daily readiness scores backed by real data',
  'Complete athlete history, always accessible',
]

export default function Problem() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1598971639058-a23f57357aba?w=1400&q=70)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(.08) saturate(.3)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg,rgba(4,7,15,.85),rgba(4,7,15,.95))' }} />
      <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, maxWidth: 1200, margin: '0 auto' }}>
        <div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--red)', textTransform: 'uppercase', marginBottom: 16 }}>// THE PROBLEM</div>
          <h2 style={{ fontFamily: 'var(--fh)', fontSize: 'clamp(36px,4vw,52px)', lineHeight: 1.05, marginBottom: 32, color: 'rgba(245,240,232,.5)' }}>COACHING ON SPREADSHEETS IS KILLING YOUR EDGE</h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {problems.map((p) => (
              <li key={p} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontFamily: 'var(--fb)', fontSize: 16, color: 'var(--muted)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--red)', marginTop: 2, flexShrink: 0 }}>✕</span>{p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 16 }}>// THE FIX</div>
          <h2 style={{ fontFamily: 'var(--fh)', fontSize: 'clamp(36px,4vw,52px)', lineHeight: 1.05, marginBottom: 32 }}>STRIKEPANEL GIVES YOU THE INTELLIGENCE TO WIN</h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {fixes.map((f) => (
              <li key={f} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontFamily: 'var(--fb)', fontSize: 16, lineHeight: 1.5 }}>
                <span style={{ color: 'var(--green)', marginTop: 2, flexShrink: 0 }}>✓</span>{f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
