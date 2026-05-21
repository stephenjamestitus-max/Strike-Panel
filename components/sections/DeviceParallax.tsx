'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import IPhone from './devices/IPhone'
import IPad from './devices/IPad'
import MacBook from './devices/MacBook'

export default function DeviceParallax() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const iphoneY = useTransform(scrollYProgress, [0, 1], [30, -30])
  const ipadY = useTransform(scrollYProgress, [0, 1], [20, -20])

  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '40px', position: 'relative' }}>
      {/* iPhone */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <motion.div style={{ y: iphoneY }}>
          <IPhone />
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase' }}>MOBILE</div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--accent)', textTransform: 'uppercase' }}>ATHLETES</div>
        </div>
      </div>

      {/* MacBook */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, flex: '0 0 auto', maxWidth: 580, width: '100%' }}>
        <MacBook />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase' }}>DESKTOP</div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--accent)', textTransform: 'uppercase' }}>MORNING BRIEF</div>
        </div>
      </div>

      {/* iPad */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <motion.div style={{ y: ipadY }}>
          <IPad />
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase' }}>TABLET</div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--accent)', textTransform: 'uppercase' }}>FIGHT CAMP</div>
        </div>
      </div>
    </div>
  )
}
