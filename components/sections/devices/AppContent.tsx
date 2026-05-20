/**
 * Scaled app UI content rendered inside device screens.
 * `scale` controls how much the 480px-wide app is shrunk to fit each device.
 */
export default function AppContent({ scale }: { scale: number }) {
  return (
    <div style={{ transformOrigin: 'top left', transform: `scale(${scale})`, width: 480 }}>
      <div style={{ background: '#04070f', padding: 12, minHeight: 900, fontFamily: "'IBM Plex Sans',sans-serif" }}>
        {/* Morning Brief header */}
        <div style={{ background: 'rgba(0,212,240,.06)', border: '1px solid rgba(0,212,240,.12)', borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: '#6b7894', marginBottom: 4, fontFamily: "'IBM Plex Mono',monospace" }}>TUESDAY, 20 MAY 2025</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 2, color: '#f5f0e8' }}>3 ATHLETES CHECKED IN · SQUAD AVG <span style={{ color: '#00D4F0' }}>68</span></div>
          <div style={{ fontSize: 11, color: '#6b7894', marginTop: 4 }}>Marcus needs a rest day. Priya is peaking — push hard. Jake trains as normal.</div>
        </div>

        {/* Alert */}
        <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: '#ef4444' }}>38</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', fontFamily: "'IBM Plex Mono',monospace", letterSpacing: 1 }}>MARCUS — REST DAY</div>
            <div style={{ fontSize: 11, color: '#6b7894' }}>Low sleep, high fatigue reported. Do not train at intensity today.</div>
          </div>
        </div>

        {/* Readiness scores */}
        <div style={{ fontSize: 9, letterSpacing: 3, color: '#6b7894', fontFamily: "'IBM Plex Mono',monospace", marginBottom: 8 }}>SQUAD READINESS SCORES</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
          {[{n:'PRIYA',s:91,c:'#10b981'},{n:'JAKE',s:74,c:'#c8892a'},{n:'MARCUS',s:38,c:'#ef4444'}].map(a => (
            <div key={a.n} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: '#6b7894', fontFamily: "'IBM Plex Mono',monospace", marginBottom: 6 }}>{a.n}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: a.c }}>{a.s}<span style={{ fontSize: 12, color: '#6b7894' }}>/100</span></div>
              <div style={{ height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2, marginTop: 6 }}>
                <div style={{ height: '100%', background: a.c, width: `${a.s}%`, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Fight camp */}
        <div style={{ background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 2 }}>MARCUS "EL TORO" MENDEZ</div>
              <div style={{ fontSize: 11, color: '#6b7894' }}>Fight Night London · Welterweight (77kg)</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: '#ef4444' }}>21</div>
              <div style={{ fontSize: 9, color: '#6b7894', fontFamily: "'IBM Plex Mono',monospace", letterSpacing: 1 }}>DAYS</div>
            </div>
          </div>
          {[{l:'Base Fitness',p:100,c:'#10b981',s:'Complete'},{l:'Sparring Block',p:78,c:'#10b981',s:'Complete'},{l:'Peak Week',p:45,c:'#c8892a',s:'In Progress'},{l:'Weight Cut',p:12,c:'#6b7894',s:'Upcoming'}].map(ph => (
            <div key={ph.l} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <div style={{ fontSize:10, width:90, flexShrink:0, color:'#f5f0e8' }}>{ph.l}</div>
              <div style={{ flex:1, height:4, background:'rgba(255,255,255,.06)', borderRadius:2 }}>
                <div style={{ height:'100%', background:ph.c, width:`${ph.p}%`, borderRadius:2 }} />
              </div>
              <div style={{ fontSize:9, color:ph.c, width:64, textAlign:'right', fontFamily:"'IBM Plex Mono',monospace" }}>{ph.s}</div>
            </div>
          ))}
        </div>

        {/* AI Generator */}
        <div style={{ background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: 2, color: '#8b5cf6' }}>AI SESSION GENERATOR</div>
            <div style={{ fontSize: 11, color: '#6b7894', marginTop: 2 }}>Generate Peak Week training plan</div>
          </div>
          <button style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 11, cursor: 'pointer' }}>Generate</button>
        </div>
      </div>
    </div>
  )
}
