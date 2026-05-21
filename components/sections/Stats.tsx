const stats = [
  { value: '500+', label: 'Athletes Tracked' },
  { value: '$0',   label: 'Setup Cost' },
  { value: '14',   label: 'Sport Categories' },
  { value: '∞',    label: 'AI Sessions' },
]

export default function Stats() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid var(--border)' }}>
      {stats.map((s, i) => (
        <div key={i} style={{ padding: '32px 24px', textAlign: 'center', borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none', background: 'rgba(8,14,26,.5)' }}>
          <div style={{ fontFamily: 'var(--fh)', fontSize: 48, letterSpacing: 2, color: 'var(--amber)' }}>{s.value}</div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}
