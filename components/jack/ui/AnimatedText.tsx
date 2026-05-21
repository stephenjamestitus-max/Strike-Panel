'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface AnimatedCharProps {
  char: string
  progress: ReturnType<typeof useScroll>['scrollYProgress']
  start: number
  end: number
}

function AnimatedChar({ char, progress, start, end }: AnimatedCharProps) {
  const opacity = useTransform(progress, [start, end], [0.2, 1])
  return (
    <span style={{ position: 'relative', display: 'inline' }}>
      <span style={{ opacity: 0 }}>{char}</span>
      <motion.span style={{ opacity, position: 'absolute', left: 0, top: 0 }}>
        {char}
      </motion.span>
    </span>
  )
}

interface AnimatedTextProps {
  text: string
  className?: string
  style?: React.CSSProperties
}

export default function AnimatedText({ text, className, style }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  })

  const chars = text.split('')
  const total = chars.length

  return (
    <p ref={ref} className={className} style={style}>
      {chars.map((char, i) => {
        const start = i / total
        const end = (i + 1) / total
        return char === ' ' ? (
          <span key={i}>&nbsp;</span>
        ) : (
          <AnimatedChar key={i} char={char} progress={scrollYProgress} start={start} end={end} />
        )
      })}
    </p>
  )
}
