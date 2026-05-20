'use client'
import { useEffect, useRef } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  delay?: 'd1' | 'd2' | 'd3' | 'd4'
}

export default function RevealWrapper({ children, className = '', delay }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('in'); observer.disconnect() } },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={['reveal', delay, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
