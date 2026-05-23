import type { Metadata } from 'next'
import Nav from '@/components/nav/Nav'
import Footer from '@/components/sections/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy — StrikePanel™',
  description: 'Privacy policy for StrikePanel™ — how we handle your data.',
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

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div style={SECTION}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 16 }}>
            // PRIVACY POLICY
          </div>
          <h1 style={H1}>Your Data.<br />Your Control.</h1>
          <p style={{ ...P, color: 'var(--muted)', fontSize: 13, marginBottom: 40 }}>
            Last updated: May 2025
          </p>

          <h2 style={H2}>What We Collect</h2>
          <p style={P}>
            StrikePanel collects only what is needed to operate the service. When you purchase, Gumroad processes your payment and email address. We receive your email to send your license key. We do not collect names, addresses, or payment card details directly.
          </p>
          <p style={P}>
            The StrikePanel app stores all athlete data locally on your device. Athlete names, readiness scores, session logs, and fight camp data are never transmitted to our servers.
          </p>

          <h2 style={H2}>License Activation</h2>
          <p style={P}>
            Your license key is stored in our database (Supabase) alongside an activation count. We store the key, how many devices it has been activated on, and the platform it was purchased from. We do not log IP addresses or device identifiers.
          </p>

          <h2 style={H2}>Analytics</h2>
          <p style={P}>
            This website uses no third-party analytics trackers. We may review aggregated server-level request logs provided by Vercel (our hosting provider) for performance monitoring. These logs do not contain personal identifiers.
          </p>

          <h2 style={H2}>Cookies</h2>
          <p style={P}>
            StrikePanel does not use tracking cookies. The app uses browser localStorage and IndexedDB to store your data locally on your device.
          </p>

          <h2 style={H2}>Third-Party Services</h2>
          <p style={P}>
            We use the following services to operate:
          </p>
          <ul style={{ ...P, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong style={{ color: 'var(--cream)' }}>Gumroad</strong> — payment processing and order fulfilment</li>
            <li><strong style={{ color: 'var(--cream)' }}>Supabase</strong> — license key storage</li>
            <li><strong style={{ color: 'var(--cream)' }}>Vercel</strong> — web hosting</li>
            <li><strong style={{ color: 'var(--cream)' }}>Resend</strong> — transactional email (license key delivery)</li>
            <li><strong style={{ color: 'var(--cream)' }}>Google Gemini</strong> — AI session generation within the app</li>
          </ul>

          <h2 style={H2}>Data Retention</h2>
          <p style={P}>
            License key records are retained indefinitely so you can reactivate on new devices. Email addresses used for key delivery are not stored by us beyond what Gumroad retains per their own policy.
          </p>

          <h2 style={H2}>Your Rights</h2>
          <p style={P}>
            You may request deletion of your license record at any time by emailing support@strikepanel.com. Note that deleting your license record will deactivate your access.
          </p>

          <h2 style={H2}>Contact</h2>
          <p style={P}>
            For any privacy questions: support@strikepanel.com
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
