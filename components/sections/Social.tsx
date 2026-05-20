export default function Social() {
  return (
    <section style={{ padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,80px)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 40 }}>// WHAT COACHES SAY</div>
        <div style={{ background: 'rgba(8,14,26,.9)', border: '1px solid rgba(255,255,255,.07)', borderLeft: '3px solid var(--amber)', borderRadius: 16, padding: 40, textAlign: 'left' }}>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 'clamp(18px,2.5vw,24px)', lineHeight: 1.6, fontStyle: 'italic', color: 'var(--cream)', marginBottom: 28 }}>
            "Finally a tool built for combat sports, not ported from a generic fitness app. My fighters&apos; readiness is up, weight cuts are smoother, and I spend less time on spreadsheets and more time coaching."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#c8892a,#e0a83a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--fh)', fontSize: 22, color: '#000' }}>R</div>
            <div>
              <div style={{ fontFamily: 'var(--fc)', fontWeight: 700, fontSize: 15 }}>Ray Torres</div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--muted)' }}>HEAD COACH · 12 FIGHTERS</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
