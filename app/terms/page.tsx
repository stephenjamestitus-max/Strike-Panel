import type { Metadata } from 'next'
import Nav from '@/components/nav/Nav'
import Footer from '@/components/sections/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service — StrikePanel™',
  description: 'Terms of service for StrikePanel™.',
  robots: { index: false },
}

const SECTION: React.CSSProperties = {
  maxWidth: 760,
  margin: '0 auto',
  padding: 'clamp(100px,12vw,140px) clamp(20px,5vw,64px) clamp(80px,10vw,120px)',
  fontFamily: 'var(--fb)',
  color: 'var(--cream)',
  lineHeight: 1.75,
}

const H1: React.CSSProperties = {
  fontFamily: 'var(--fk)',
  fontWeight: 900,
  fontSize: 'clamp(36px,6vw,72px)',
  textTransform: 'uppercase',
  lineHeight: 0.9,
  background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  marginBottom: 40,
}

const H2: React.CSSProperties = {
  fontFamily: 'var(--fk)',
  fontWeight: 700,
  fontSize: 18,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: 'var(--accent)',
  marginTop: 40,
  marginBottom: 12,
}

const P: React.CSSProperties = {
  color: 'rgba(245,240,232,.7)',
  fontSize: 15,
  marginBottom: 16,
}

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div style={SECTION}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 16 }}>
            // TERMS OF SERVICE
          </div>
          <h1 style={H1}>Terms of<br />Service.</h1>
          <p style={{ ...P, color: 'var(--muted)', fontSize: 13, marginBottom: 40 }}>
            Last updated: May 2025
          </p>

          <h2 style={H2}>The Product</h2>
          <p style={P}>
            StrikePanel™ is a coaching dashboard Progressive Web App for combat sports coaches. It is sold as a one-time purchase with lifetime access. &quot;Lifetime&quot; means the lifetime of the product — we will provide reasonable advance notice if we ever shut it down.
          </p>

          <h2 style={H2}>License</h2>
          <p style={P}>
            When you purchase StrikePanel, you receive a personal, non-transferable license to use the software on up to 3 devices. You may not resell, redistribute, or sublicense the software or your license key.
          </p>
          <p style={P}>
            Each license key is for use by a single coach. Sharing a key across multiple coaches or gyms is not permitted.
          </p>

          <h2 style={H2}>Refund Policy</h2>
          <p style={P}>
            We offer a 30-day money-back guarantee. If StrikePanel is not the right fit for you, email support@strikepanel.com within 30 days of purchase and we will issue a full refund. No questions asked.
          </p>

          <h2 style={H2}>Use of the Service</h2>
          <p style={P}>
            You agree to use StrikePanel only for lawful purposes. You are responsible for the accuracy of data you enter, including athlete health and readiness data. StrikePanel provides tools for coaches — it does not replace the judgment of qualified medical professionals.
          </p>
          <p style={P}>
            The AI session generator produces training suggestions based on the data you provide. These are starting points for trained coaches, not medical prescriptions. Always apply your own professional judgment.
          </p>

          <h2 style={H2}>Availability</h2>
          <p style={P}>
            The core app functions offline once installed. Cloud-dependent features (AI session generation, license validation) require an internet connection. We aim for high availability but do not guarantee uninterrupted service.
          </p>

          <h2 style={H2}>Intellectual Property</h2>
          <p style={P}>
            StrikePanel™ and all associated software, design, and content are owned by the StrikePanel team. Your athlete data belongs to you.
          </p>

          <h2 style={H2}>Limitation of Liability</h2>
          <p style={P}>
            StrikePanel is provided as-is. We are not liable for any indirect, incidental, or consequential damages arising from use of the software. Our total liability is limited to the purchase price you paid.
          </p>

          <h2 style={H2}>Changes to These Terms</h2>
          <p style={P}>
            We may update these terms from time to time. Material changes will be communicated via the email address associated with your purchase.
          </p>

          <h2 style={H2}>Contact</h2>
          <p style={P}>
            Questions about these terms: support@strikepanel.com
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
