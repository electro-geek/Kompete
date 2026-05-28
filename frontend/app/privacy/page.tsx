import Header from '@/components/Header'
import Link from 'next/link'
import { LogoMark } from '@/components/Logo'

const CONTAINER = { maxWidth: '720px', margin: '0 auto', padding: '0 24px' }
const DIVIDER = { height: '1px', background: 'linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent)', maxWidth: '720px', margin: '0 auto' }

export const metadata = {
  title: 'Privacy Policy — Kompete',
  description: 'How Kompete collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', paddingTop: '58px' }}>
        <div style={{ ...CONTAINER, paddingTop: '72px', paddingBottom: '96px' }}>

          {/* Breadcrumb */}
          <div style={{ marginBottom: '40px' }}>
            <Link href="/" style={{ fontSize: '12.5px', color: 'var(--fg-subtle)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Back to home
            </Link>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '56px' }}>
            <p className="section-label" style={{ marginBottom: '12px' }}>Legal</p>
            <h1 className="heading" style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.04em', color: 'var(--fg)', margin: '0 0 16px' }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--fg-subtle)', margin: 0 }}>
              Effective date: <span className="mono" style={{ color: 'var(--fg-dim)' }}>May 28, 2026</span>
            </p>
          </div>

          {/* Intro */}
          <p style={{ fontSize: '15.5px', color: 'var(--fg-dim)', lineHeight: 1.78, marginBottom: '48px' }}>
            Kompete ("we," "us," or "our") is an AI-powered competitive intelligence service. This Privacy Policy explains what information we collect when you use Kompete, why we collect it, how we use it, and your rights regarding that information. By accessing or using Kompete, you agree to the practices described in this policy.
          </p>

          <div style={DIVIDER} />

          <Section num="1" title="Information We Collect">
            <SubSection title="Account Information">
              When you sign in with Google, we receive your name, email address, and profile photo from Google&apos;s OAuth service. We store this information to identify your account and personalize your experience.
            </SubSection>
            <SubSection title="Research Data">
              We store the company names you submit for research and the resulting competitive-intelligence reports. Reports are linked to your account so you can retrieve them later.
            </SubSection>
            <SubSection title="API Keys">
              If you choose to supply a personal Gemini API key, it is encrypted with AES-256 (Fernet) before being written to our database. We decrypt it only on-demand to execute your research requests and never expose it in logs or responses.
            </SubSection>
            <SubSection title="Usage Data">
              We collect standard server logs including IP addresses, browser type, pages visited, and request timestamps. This data helps us diagnose errors, prevent abuse, and improve performance.
            </SubSection>
          </Section>

          <Section num="2" title="How We Use Your Information">
            <ul style={LIST_STYLE}>
              <li>To authenticate you and enforce per-user rate limits.</li>
              <li>To run AI research pipelines on your behalf using Google Gemini.</li>
              <li>To store and retrieve your generated reports.</li>
              <li>To enforce the one free report limit for unauthenticated or free-tier users.</li>
              <li>To monitor for abuse, enforce our Terms, and maintain service security.</li>
              <li>To improve the accuracy and speed of our AI agents over time.</li>
            </ul>
            <p style={PARA}>We do not sell, rent, or trade your personal information to third parties for marketing purposes.</p>
          </Section>

          <Section num="3" title="Data Sharing">
            <p style={PARA}>We share data only in the following limited circumstances:</p>
            <ul style={LIST_STYLE}>
              <li><strong style={{ color: 'var(--fg)' }}>Google Gemini API.</strong> Company names and contextual prompts are sent to Google&apos;s Gemini API to generate research results. See Google&apos;s privacy policy for how Google handles API data.</li>
              <li><strong style={{ color: 'var(--fg)' }}>Firebase / Google Auth.</strong> Authentication is handled by Firebase Authentication. Google processes your sign-in credential.</li>
              <li><strong style={{ color: 'var(--fg)' }}>Hosting infrastructure.</strong> Our backend runs on cloud infrastructure (Vercel / Nile / PostgreSQL providers). These providers have access to infrastructure-level data in the ordinary course of operations.</li>
              <li><strong style={{ color: 'var(--fg)' }}>Legal requirements.</strong> We may disclose information if required by law or to protect the rights, safety, or property of Kompete or others.</li>
            </ul>
          </Section>

          <Section num="4" title="Data Retention">
            <p style={PARA}>
              Reports are retained in our database indefinitely unless you request deletion. In-memory caches (used for real-time streaming) are ephemeral and cleared on server restart. Server logs are retained for up to 90 days.
            </p>
            <p style={PARA}>
              You may request deletion of your account and all associated data by contacting us at the address listed at the end of this policy.
            </p>
          </Section>

          <Section num="5" title="Cookies and Local Storage">
            <p style={PARA}>
              We use browser <code style={CODE}>localStorage</code> to persist your demo session in development mode. In production, Firebase Authentication manages session state via secure cookies. We do not use third-party advertising or tracking cookies.
            </p>
          </Section>

          <Section num="6" title="Security">
            <p style={PARA}>
              We protect your data using industry-standard practices: HTTPS in transit, encrypted API key storage at rest, and JWT-based authentication. No system is perfectly secure; we cannot guarantee absolute protection against all threats. Please report security concerns to the contact address below.
            </p>
          </Section>

          <Section num="7" title="Children's Privacy">
            <p style={PARA}>
              Kompete is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.
            </p>
          </Section>

          <Section num="8" title="Your Rights">
            <p style={PARA}>Depending on your jurisdiction, you may have the right to:</p>
            <ul style={LIST_STYLE}>
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Object to or restrict certain processing activities.</li>
              <li>Receive a portable copy of your data.</li>
            </ul>
            <p style={PARA}>To exercise any of these rights, contact us at the address below.</p>
          </Section>

          <Section num="9" title="Changes to This Policy">
            <p style={PARA}>
              We may update this Privacy Policy from time to time. Material changes will be noted by updating the effective date at the top of this page. Continued use of Kompete after changes take effect constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section num="10" title="Contact Us" last>
            <p style={PARA}>
              For privacy questions, data requests, or concerns, please contact:
            </p>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '20px 24px', marginTop: '16px',
            }}>
              <p className="heading" style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--fg)', margin: '0 0 4px' }}>Kompete</p>
              <p style={{ fontSize: '13.5px', color: 'var(--fg-dim)', margin: 0 }}>
                Email: <a href="mailto:mritunjaypandey0789@gmail.com" style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>mritunjaypandey0789@gmail.com</a>
              </p>
            </div>
          </Section>

          {/* Footer nav */}
          <div style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogoMark size={16} />
              <span className="heading" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fg-subtle)' }}>Kompete</span>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Link href="/terms" style={{ fontSize: '12.5px', color: 'var(--fg-subtle)', textDecoration: 'none' }}>Terms &amp; Conditions</Link>
              <Link href="/privacy" style={{ fontSize: '12.5px', color: 'var(--accent-light)', textDecoration: 'none' }}>Privacy Policy</Link>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}

const PARA: React.CSSProperties = {
  fontSize: '14.5px', color: 'var(--fg-dim)', lineHeight: 1.78, margin: '0 0 16px',
}
const LIST_STYLE: React.CSSProperties = {
  fontSize: '14.5px', color: 'var(--fg-dim)', lineHeight: 1.78,
  paddingLeft: '20px', margin: '0 0 16px',
}
const CODE: React.CSSProperties = {
  fontFamily: 'ui-monospace, monospace', fontSize: '13px',
  background: 'var(--elevated)', border: '1px solid var(--border)',
  borderRadius: '4px', padding: '1px 6px', color: 'var(--fg-dim)',
}

function Section({ num, title, children, last }: { num: string; title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid var(--border)', marginBottom: last ? 0 : '0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
        <span className="mono" style={{ fontSize: '11px', color: 'var(--accent)', opacity: 0.6, fontWeight: 700, flexShrink: 0 }}>{num.padStart(2, '0')}</span>
        <h2 className="heading" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--fg)', margin: 0, letterSpacing: '-0.025em' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--fg)', margin: '0 0 8px' }}>{title}</h3>
      <p style={PARA}>{children}</p>
    </div>
  )
}
