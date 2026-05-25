import HeroSection from '@/components/jack/sections/HeroSection'
import MarqueeSection from '@/components/jack/sections/MarqueeSection'
import AboutSection from '@/components/jack/sections/AboutSection'
import ServicesSection from '@/components/jack/sections/ServicesSection'
import ProjectsSection from '@/components/jack/sections/ProjectsSection'

export default function JackPage() {
  return (
    <div className="jack-root">
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
    </div>
  )
}
