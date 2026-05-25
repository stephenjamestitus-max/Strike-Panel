import Nav from '@/components/nav/Nav'
import Hero from '@/components/hero/Hero'
import Ticker from '@/components/sections/Ticker'
import Problem from '@/components/sections/Problem'
import Demo from '@/components/sections/Demo'
import Features from '@/components/sections/Features'
import CrossPlatform from '@/components/sections/CrossPlatform'
import Social from '@/components/sections/Social'
import Pricing from '@/components/sections/Pricing'
import FAQ from '@/components/sections/FAQ'
import BlogTeaser from '@/components/sections/BlogTeaser'
import Footer from '@/components/sections/Footer'

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <Problem />
        <Demo />
        <Features />
        <CrossPlatform />
        <Social />
        <Pricing />
        <FAQ />
        <BlogTeaser />
      </main>
      <Footer />
    </>
  )
}
