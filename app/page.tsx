import Nav from '@/components/nav/Nav'
import Hero from '@/components/hero/Hero'
import Ticker from '@/components/sections/Ticker'
import Stats from '@/components/sections/Stats'
import Problem from '@/components/sections/Problem'
import Demo from '@/components/sections/Demo'
import Features from '@/components/sections/Features'
import CrossPlatform from '@/components/sections/CrossPlatform'
import Social from '@/components/sections/Social'
import Pricing from '@/components/sections/Pricing'
import Footer from '@/components/sections/Footer'
import RevealWrapper from '@/components/ui/RevealWrapper'

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <RevealWrapper><Stats /></RevealWrapper>
        <RevealWrapper delay="d1"><Problem /></RevealWrapper>
        <RevealWrapper delay="d1"><Demo /></RevealWrapper>
        <RevealWrapper><Features /></RevealWrapper>
        <RevealWrapper delay="d1"><CrossPlatform /></RevealWrapper>
        <RevealWrapper delay="d2"><Social /></RevealWrapper>
        <RevealWrapper delay="d1"><Pricing /></RevealWrapper>
      </main>
      <Footer />
    </>
  )
}
