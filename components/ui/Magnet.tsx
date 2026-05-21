'use client'
import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react'

interface MagnetProps {
  children: ReactNode
  padding?: number
  strength?: number
  activeTransition?: string
  inactiveTransition?: string
  className?: string
}

export default function Magnet({
  children,
  padding = 150,
  strength = 3,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.6s ease-in-out',
  className,
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null)
  // Store latest prop values in refs to avoid re-registering listeners on prop changes
  const paddingRef = useRef(padding)
  const strengthRef = useRef(strength)
  const activeTransitionRef = useRef(activeTransition)
  const inactiveTransitionRef = useRef(inactiveTransition)
  useEffect(() => { paddingRef.current = padding }, [padding])
  useEffect(() => { strengthRef.current = strength }, [strength])
  useEffect(() => { activeTransitionRef.current = activeTransition }, [activeTransition])
  useEffect(() => { inactiveTransitionRef.current = inactiveTransition }, [inactiveTransition])

  const [transform, setTransform] = useState('translate3d(0,0,0)')
  const [transition, setTransition] = useState(inactiveTransition)
  const isActive = useRef(false)

  // Stable callback — reads latest prop values from refs to avoid listener churn
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = e.clientX - centerX
    const dy = e.clientY - centerY
    const distX = Math.abs(e.clientX - rect.left - rect.width / 2)
    const distY = Math.abs(e.clientY - rect.top - rect.height / 2)
    const withinX = distX < rect.width / 2 + paddingRef.current
    const withinY = distY < rect.height / 2 + paddingRef.current

    if (withinX && withinY) {
      if (!isActive.current) {
        isActive.current = true
        setTransition(activeTransitionRef.current)
      }
      setTransform(`translate3d(${dx / strengthRef.current}px, ${dy / strengthRef.current}px, 0)`)
    } else if (isActive.current) {
      isActive.current = false
      setTransition(inactiveTransitionRef.current)
      setTransform('translate3d(0,0,0)')
    }
  }, []) // stable — no deps, reads from refs

  const handleMouseLeave = useCallback(() => {
    isActive.current = false
    setTransition(inactiveTransitionRef.current)
    setTransform('translate3d(0,0,0)')
  }, [])

  const attachListeners = useCallback(() => {
    if (typeof window === 'undefined') return
    window.addEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const detachListeners = useCallback(() => {
    if (typeof window === 'undefined') return
    window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const handleMouseLeaveAndDetach = useCallback(() => {
    detachListeners()
    handleMouseLeave()
  }, [detachListeners, handleMouseLeave])

  // Ensure listener is removed if component unmounts while hovered
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [handleMouseMove])

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={attachListeners}
      onMouseLeave={handleMouseLeaveAndDetach}
      style={{ transform, transition, willChange: 'transform', display: 'inline-block' }}
    >
      {children}
    </div>
  )
}
