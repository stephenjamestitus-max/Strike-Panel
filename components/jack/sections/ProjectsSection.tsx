'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import LiveProjectButton from '../ui/LiveProjectButton'

const PROJECTS = [
  {
    num: '01',
    name: 'Nextlevel Studio',
    category: 'Client',
    col1: [
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85',
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85',
    ],
    col2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85',
  },
  {
    num: '02',
    name: 'Aura Brand Identity',
    category: 'Personal',
    col1: [
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85',
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85',
    ],
    col2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85',
  },
  {
    num: '03',
    name: 'Solaris Digital',
    category: 'Client',
    col1: [
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85',
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85',
    ],
    col2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85',
  },
]

const TOTAL = PROJECTS.length

function ProjectCard({
  project,
  index,
  containerRef,
}: {
  project: (typeof PROJECTS)[0]
  index: number
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const targetScale = 1 - (TOTAL - 1 - index) * 0.03
  const scaleStart = index / TOTAL
  const scaleEnd = (index + 1) / TOTAL
  const scale = useTransform(scrollYProgress, [scaleStart, scaleEnd], [1, targetScale])

  const topPx = 96 + index * 28
  const borderRadius = 'clamp(40px, 5vw, 60px)'

  return (
    <div className="h-[85vh] relative">
      <motion.div
        style={{
          scale,
          position: 'sticky',
          top: topPx,
          borderRadius,
          border: '2px solid #D7E2EA',
          background: '#0C0C0C',
          padding: 'clamp(1rem, 2vw, 2rem)',
          transformOrigin: 'top center',
        }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-baseline gap-4 sm:gap-6">
            <span
              className="font-black leading-none"
              style={{ fontSize: 'clamp(3rem, 10vw, 140px)', color: '#D7E2EA', lineHeight: 1 }}
            >
              {project.num}
            </span>
            <div className="flex flex-col gap-1">
              <span
                className="text-[#D7E2EA] font-light uppercase tracking-widest"
                style={{ fontSize: 'clamp(0.65rem, 1vw, 0.9rem)', opacity: 0.6 }}
              >
                {project.category}
              </span>
              <span
                className="text-[#D7E2EA] font-medium uppercase"
                style={{ fontSize: 'clamp(1rem, 2.2vw, 2rem)' }}
              >
                {project.name}
              </span>
            </div>
          </div>
          <LiveProjectButton />
        </div>

        {/* Image grid */}
        <div className="flex gap-3">
          {/* Left column — 40% */}
          <div className="flex flex-col gap-3" style={{ width: '40%' }}>
            <img
              src={project.col1[0]}
              alt={project.name}
              className="w-full object-cover"
              style={{ height: 'clamp(130px, 16vw, 230px)', borderRadius }}
            />
            <img
              src={project.col1[1]}
              alt={project.name}
              className="w-full object-cover"
              style={{ height: 'clamp(160px, 22vw, 340px)', borderRadius }}
            />
          </div>

          {/* Right column — 60% */}
          <div style={{ width: '60%' }}>
            <img
              src={project.col2}
              alt={project.name}
              className="w-full h-full object-cover"
              style={{ borderRadius }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section
      id="projects"
      className="rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 relative z-10 px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32 pb-20"
      style={{ background: '#0C0C0C' }}
    >
      <h2
        className="hero-heading font-black uppercase leading-none tracking-tight text-center mb-16 sm:mb-20 md:mb-28"
        style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
      >
        Project
      </h2>

      <div ref={containerRef}>
        {PROJECTS.map((project, index) => (
          <ProjectCard
            key={project.num}
            project={project}
            index={index}
            containerRef={containerRef}
          />
        ))}
      </div>
    </section>
  )
}
