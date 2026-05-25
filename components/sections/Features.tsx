'use client'
import { useState, type ReactElement } from 'react'
import FadeIn from '@/components/ui/FadeIn'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './features.module.css'

const tabs = ['Morning Brief', 'Fight Camp', 'Athletes', 'AI Sessions', 'Progress']

/* ── Morning Brief Panel ── */
function MorningBrief() {
  return (
    <div className={styles.panel}>
      <div style={{ background: 'linear-gradient(135deg,rgba(0,212,240,.08),rgba(0,212,240,.04))', border: '1px solid rgba(0,212,240,.15)', borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', marginBottom: 6 }}>TUESDAY, 20 MAY 2025</div>
        <div style={{ fontFamily: 'var(--fh)', fontSize: 28, letterSpacing: 2 }}>3 ATHLETES CHECKED IN · SQUAD AVG <span style={{ color: 'var(--accent)' }}>68</span></div>
        <div style={{ fontFamily: 'var(--fb)', color: 'var(--muted)', marginTop: 8, fontSize: 14 }}>Marcus needs a rest day. Priya is peaking — push hard. Jake trains as normal.</div>
      </div>
      <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 10, padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: 'var(--fh)', fontSize: 32, color: 'var(--red)' }}>38</div>
        <div>
          <div style={{ fontFamily: 'var(--fc)', fontWeight: 700, color: 'var(--red)', fontSize: 13 }}>MARCUS — REST DAY</div>
          <div style={{ fontFamily: 'var(--fb)', color: 'var(--muted)', fontSize: 13 }}>Low sleep, high fatigue reported. Do not train at intensity today.</div>
        </div>
      </div>
      <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>SQUAD READINESS SCORES</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[{name:'PRIYA',score:91,color:'#10b981'},{name:'JAKE',score:74,color:'#c8892a'},{name:'MARCUS',score:38,color:'#ef4444'}].map(a => (
          <div key={a.name} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', marginBottom: 8 }}>{a.name}</div>
            <div style={{ fontFamily: 'var(--fh)', fontSize: 40, color: a.color }}>{a.score}<span style={{ fontSize: 16, color: 'var(--muted)' }}>/100</span></div>
            <div style={{ height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2, marginTop: 10 }}>
              <div style={{ height: '100%', background: a.color, width: `${a.score}%`, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
      {/* Activity timeline */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1.5px', marginBottom: '10px' }}>ACTIVITY TIMELINE</div>
        {[
          { time: '6:42 AM', event: 'Priya Sharma checked in — Readiness 91', color: 'var(--green)' },
          { time: '7:15 AM', event: 'Jake Thompson checked in — Readiness 74', color: 'var(--amber)' },
          { time: '8:03 AM', event: 'Marcus Mendez flagged — Rest day recommended', color: 'var(--red)' },
        ].map(item => (
          <div key={item.time} style={{ display: 'flex', gap: '12px', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.04)', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--fm)', fontSize: '10px', color: 'var(--muted)', minWidth: '60px' }}>{item.time}</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: 'var(--cream)' }}>{item.event}</span>
          </div>
        ))}
      </div>
      {/* Squad overview 4-stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginTop: '16px' }}>
        {[
          { label: 'AVG READINESS', value: '68', color: 'var(--amber)' },
          { label: 'CHECKED IN', value: '2/3', color: 'var(--green)' },
          { label: 'ON ALERT', value: '1', color: 'var(--red)' },
          { label: 'SESSIONS TODAY', value: '4', color: 'var(--accent)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,.03)', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ fontFamily: 'var(--fh)', fontSize: '22px', color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '1px', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Fight Camp Panel ── */
function FightCamp() {
  return (
    <div className={styles.panel}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        {[{label:'DAYS TO FIGHT',value:'21',color:'#ef4444'},{label:'CURRENT KG',value:'79.2',color:'#c8892a'},{label:'TARGET KG',value:'77',color:'#10b981'}].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: '16px 18px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--fh)', fontSize: 40, color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 2, color: 'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'linear-gradient(135deg,rgba(239,68,68,.1),rgba(239,68,68,.05))', border: '1px solid rgba(239,68,68,.3)', borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--red)', marginBottom: 8 }}>UPCOMING BOUT</div>
        <div style={{ fontFamily: 'var(--fh)', fontSize: 28, letterSpacing: 2 }}>MARCUS "EL TORO" MENDEZ</div>
        <div style={{ fontFamily: 'var(--fb)', color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Fight Night London · Welterweight (77kg)</div>
      </div>
      <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>CAMP PHASES</div>
      {[{phase:'Base Fitness',pct:100,status:'Complete',color:'#10b981'},{phase:'Sparring Block',pct:78,status:'Complete',color:'#10b981'},{phase:'Peak Week',pct:45,status:'In Progress',color:'#c8892a'},{phase:'Weight Cut',pct:12,status:'Upcoming',color:'#6b7894'}].map(p => (
        <div key={p.phase} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
          <div style={{ fontFamily:'var(--fb)', fontSize:13, width:120, flexShrink:0 }}>{p.phase}</div>
          <div style={{ flex:1, height:6, background:'rgba(255,255,255,.06)', borderRadius:3 }}>
            <div style={{ height:'100%', background:p.color, width:`${p.pct}%`, borderRadius:3 }} />
          </div>
          <div style={{ fontFamily:'var(--fm)', fontSize:10, color:p.color, width:80, textAlign:'right' }}>{p.status}</div>
        </div>
      ))}
      {/* Weight cut table */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1.5px', marginBottom: '10px' }}>WEIGHT CUT TRACKER</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'var(--fm)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
              {['WEEK', 'DATE', 'TARGET', 'ACTUAL', 'STATUS'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--muted)', fontWeight: 400, fontSize: '10px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { wk: 'Wk 1', date: 'Jun 2', target: '80.5kg', actual: '80.3kg', status: 'ON TRACK', color: 'var(--green)' },
              { wk: 'Wk 2', date: 'Jun 9', target: '79.5kg', actual: '79.8kg', status: 'SLIGHT OVER', color: 'var(--amber)' },
              { wk: 'Wk 3', date: 'Jun 16', target: '78.5kg', actual: '—', status: 'PENDING', color: 'var(--muted)' },
              { wk: 'Wk 4', date: 'Jun 23', target: '77.0kg', actual: '—', status: 'FIGHT DAY', color: 'var(--accent)' },
            ].map(row => (
              <tr key={row.wk} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <td style={{ padding: '7px 8px', color: 'var(--cream)' }}>{row.wk}</td>
                <td style={{ padding: '7px 8px', color: 'var(--muted)' }}>{row.date}</td>
                <td style={{ padding: '7px 8px', color: 'var(--cream)' }}>{row.target}</td>
                <td style={{ padding: '7px 8px', color: 'var(--cream)' }}>{row.actual}</td>
                <td style={{ padding: '7px 8px' }}><span style={{ color: row.color, fontSize: '10px', letterSpacing: '0.5px' }}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Athletes Panel ── */
function Athletes() {
  const roster = [
    { initials:'P', name:'Priya Sharma',  detail:'Muay Thai · 52kg · 18-2', score:91, color:'#10b981' },
    { initials:'J', name:'Jake Thompson', detail:'Boxing · 67kg · 22-4',     score:74, color:'#c8892a' },
    { initials:'M', name:'Marcus Mendez', detail:'MMA · 77kg · 15-3',        score:38, color:'#ef4444' },
  ]
  return (
    <div className={styles.panel}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[{label:'ACTIVE',value:'12'},{label:'ON ALERT',value:'3'},{label:'IN CAMP',value:'2'}].map(s => (
          <div key={s.label} style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', borderRadius:10, padding:'16px', textAlign:'center' }}>
            <div style={{ fontFamily:'var(--fh)', fontSize:36, color:'var(--amber)' }}>{s.value}</div>
            <div style={{ fontFamily:'var(--fm)', fontSize:9, letterSpacing:2, color:'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>
      {roster.map(a => (
        <div key={a.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', borderRadius:10, marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:'50%', border:`1.5px solid ${a.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--fh)', fontSize:18, color:a.color }}>{a.initials}</div>
            <div>
              <div style={{ fontFamily:'var(--fc)', fontWeight:600, fontSize:14 }}>{a.name}</div>
              <div style={{ fontFamily:'var(--fm)', fontSize:10, color:'var(--muted)' }}>{a.detail}</div>
            </div>
          </div>
          <div style={{ fontFamily:'var(--fh)', fontSize:28, color:a.color }}>{a.score}</div>
        </div>
      ))}
    </div>
  )
}

/* ── AI Sessions Panel ── */
function AISessions() {
  const exercises = [
    {name:'Jump Rope',     detail:'10 min · Warm-up'},
    {name:'Shadow Boxing', detail:'3 × 3 min · Technique'},
    {name:'Heavy Bag',     detail:'5 × 3 min · Power'},
    {name:'Pad Work',      detail:'4 × 3 min · Combinations'},
    {name:'Sprawl & Shoot',detail:'3 × 5 min · Wrestling'},
    {name:'Core Circuit',  detail:'15 min · Conditioning'},
    {name:'Cool Down',     detail:'10 min · Recovery'},
  ]
  return (
    <div className={styles.panel}>
      <div style={{ background:'linear-gradient(135deg,rgba(139,92,246,.12),rgba(139,92,246,.06))', border:'1px solid rgba(139,92,246,.25)', borderRadius:12, padding:'16px 20px', marginBottom:16 }}>
        <div style={{ fontFamily:'var(--fh)', fontSize:13, letterSpacing:3, color:'var(--purple)' }}>AI SESSION GENERATOR</div>
      </div>
      <div style={{ fontFamily:'var(--fh)', fontSize:22, marginBottom:4 }}>PEAK WEEK — FIGHT PREP</div>
      <div style={{ fontFamily:'var(--fb)', color:'var(--muted)', fontSize:13, marginBottom:20 }}>Generated for Marcus Mendez · 21 days to fight</div>
      {exercises.map((e, i) => (
        <div key={e.name} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:8, marginBottom:6 }}>
          <div style={{ fontFamily:'var(--fh)', fontSize:18, color:'var(--amber)', width:24, textAlign:'center' }}>{i+1}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'var(--fc)', fontWeight:600, fontSize:14 }}>{e.name}</div>
            <div style={{ fontFamily:'var(--fm)', fontSize:10, color:'var(--muted)' }}>{e.detail}</div>
          </div>
        </div>
      ))}
      <div style={{ display:'flex', gap:12, marginTop:16 }}>
        <button style={{ flex:1, background:'linear-gradient(135deg,#c8892a,#e0a83a)', color:'#000', fontWeight:700, border:'none', borderRadius:8, padding:'12px', cursor:'pointer', fontFamily:'var(--fc)' }}>Save Plan</button>
        <button style={{ flex:1, background:'rgba(139,92,246,.1)', color:'var(--purple)', border:'1px solid rgba(139,92,246,.3)', borderRadius:8, padding:'12px', cursor:'pointer', fontFamily:'var(--fc)' }}>Regenerate</button>
      </div>
    </div>
  )
}

/* ── Progress Panel ── */
function Progress() {
  const weeks = ['W1','W2','W3','W4','W5','W6','W7','W8']
  const readiness   = [72,68,75,71,80,76,82,91]
  const performance = [65,70,74,72,78,80,83,88]
  const recovery    = [60,65,70,68,75,72,80,85]
  const W = 600, H = 160
  const toPath = (vals: number[]) => vals.map((v,i) => `${i===0?'M':'L'}${(i/(vals.length-1))*W},${H-(v/100)*(H-20)-10}`).join(' ')
  return (
    <div className={styles.panel}>
      <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:20, marginBottom:20 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto' }}>
          {[25,50,75].map(y => <line key={y} x1={0} x2={W} y1={H-(y/100)*(H-20)-10} y2={H-(y/100)*(H-20)-10} stroke="rgba(255,255,255,.04)" strokeWidth={1} />)}
          <path d={toPath(readiness)}   fill="none" stroke="#00D4F0" strokeWidth={2} />
          <path d={toPath(performance)} fill="none" stroke="#c8892a" strokeWidth={2} />
          <path d={toPath(recovery)}    fill="none" stroke="#10b981" strokeWidth={2} />
        </svg>
        <div style={{ display:'flex', gap:20, marginTop:12 }}>
          {[{label:'Readiness',color:'#00D4F0'},{label:'Performance',color:'#c8892a'},{label:'Recovery',color:'#10b981'}].map(l => (
            <div key={l.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:16, height:2, background:l.color, borderRadius:1 }} />
              <span style={{ fontFamily:'var(--fm)', fontSize:10, color:'var(--muted)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'var(--fm)', fontSize:12 }}>
          <thead>
            <tr>{['WEEK','READINESS','PERFORMANCE','RECOVERY','SESSIONS'].map(h => (
              <th key={h} style={{ padding:'8px 12px', textAlign:'left', color:'var(--muted)', fontSize:9, letterSpacing:2, borderBottom:'1px solid rgba(255,255,255,.06)' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {weeks.map((w, i) => (
              <tr key={w} style={{ borderBottom:'1px solid rgba(255,255,255,.03)' }}>
                <td style={{ padding:'10px 12px', color:'var(--muted)' }}>{w}</td>
                <td style={{ padding:'10px 12px', color:'#00D4F0' }}>{readiness[i]}</td>
                <td style={{ padding:'10px 12px', color:'#c8892a' }}>{performance[i]}</td>
                <td style={{ padding:'10px 12px', color:'#10b981' }}>{recovery[i]}</td>
                <td style={{ padding:'10px 12px', color:'var(--cream)' }}>{i + 4}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Features Shell ── */
const panels: Record<string, () => ReactElement> = {
  'Morning Brief': MorningBrief,
  'Fight Camp':    FightCamp,
  'Athletes':      Athletes,
  'AI Sessions':   AISessions,
  'Progress':      Progress,
}

export default function Features() {
  const [active, setActive] = useState<string>('Morning Brief')
  const Panel = panels[active]

  return (
    <section id="features" style={{ padding:'clamp(80px,10vw,130px) clamp(20px,5vw,80px)' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <FadeIn delay={0} y={40}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontFamily:'var(--fm)', fontSize:10, letterSpacing:4, color:'var(--accent)', textTransform:'uppercase', marginBottom:12 }}>// FEATURES</div>
            <h2 style={{
              fontFamily: 'var(--fk)',
              fontWeight: 900,
              fontSize: 'clamp(40px,5vw,72px)',
              letterSpacing: 2,
              background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>EVERY TOOL A COACH NEEDS</h2>
          </div>
        </FadeIn>
        <div className={styles.tabs}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActive(t)} className={[styles.tab, active===t ? styles.tabActive : ''].filter(Boolean).join(' ')}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ background:'rgba(8,14,26,.8)', border:'1px solid var(--border)', borderRadius:16, padding:32 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              style={{ height: '100%' }}
            >
              <Panel />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
