'use client'
import { useRef, useState, useCallback, type ReactNode } from 'react'

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
  const [transform, setTransform] = useState('translate3d(0,0,0)')
  const [transition, setTransition] = useState(inactiveTransition)
  const isActive = useRef(false)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = e.clientX - centerX
    const dy = e.clientY - centerY
    const distX = Math.abs(e.clientX - rect.left - rect.width / 2)
    const distY = Math.abs(e.clientY - rect.top - rect.height / 2)
    const withinX = distX < rect.width / 2 + padding
    const withinY = distY < rect.height / 2 + padding

    if (withinX && withinY) {
      if (!isActive.current) {
        isActive.current = true
        setTransition(activeTransition)
      }
      setTransform(`translate3d(${dx / strength}px, ${dy / strength}px, 0)`)
    } else if (isActive.current) {
      isActive.current = false
      setTransition(inactiveTransition)
      setTransform('translate3d(0,0,0)')
    }
  }, [padding, strength, activeTransition, inactiveTransition])

  const handleMouseLeave = useCallback(() => {
    isActive.current = false
    setTransition(inactiveTransition)
    setTransform('translate3d(0,0,0)')
  }, [inactiveTransition])

  const attachListeners = useCallback(() => {
    window.addEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const detachListeners = useCallback(() => {
    window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={attachListeners}
      onMouseLeave={() => { detachListeners(); handleMouseLeave() }}
      style={{ transform, transition, willChange: 'transform', display: 'inline-block' }}
    >
      {children}
    </div>
  )
}
