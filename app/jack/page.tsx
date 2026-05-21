import HeroSection from '@/components/jack/sections/HeroSection'
import MarqueeSection from '@/components/jack/sections/MarqueeSection'
import AboutSection from '@/components/jack/sections/AboutSection'

export default function JackPage() {
  return (
    <div className="jack-root">
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
    </div>
  )
}
