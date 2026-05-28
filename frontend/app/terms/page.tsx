import Header from '@/components/Header'
import Link from 'next/link'
import { LogoMark } from '@/components/Logo'

const CONTAINER = { maxWidth: '720px', margin: '0 auto', padding: '0 24px' }
const DIVIDER = { height: '1px', background: 'linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent)', maxWidth: '720px', margin: '0 auto' }

export const metadata = {
  title: 'Terms & Conditions — Kompete',
  description: 'The terms governing your use of the Kompete competitive intelligence platform.',
}

export default function TermsPage() {
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
              Terms &amp; Conditions
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--fg-subtle)', margin: 0 }}>
              Effective date: <span className="mono" style={{ color: 'var(--fg-dim)' }}>May 28, 2026</span>
            </p>
          </div>

          {/* Intro */}
          <p style={{ fontSize: '15.5px', color: 'var(--fg-dim)', lineHeight: 1.78, marginBottom: '48px' }}>
            These Terms &amp; Conditions ("Terms") govern your access to and use of Kompete, an AI-powered competitive intelligence service. By creating an account, signing in, or using any part of the service, you agree to be bound by these Terms. If you do not agree, please do not use Kompete.
          </p>

          <div style={DIVIDER} />

          <Section num="1" title="Acceptance of Terms">
            <p style={PARA}>
              By accessing Kompete you confirm that you are at least 13 years old (or the minimum digital consent age in your country), that you have read and understood these Terms, and that you have the legal capacity to enter a binding agreement. If you are using Kompete on behalf of an organisation, you represent that you have authority to bind that organisation.
            </p>
          </Section>

          <Section num="2" title="Description of Service">
            <p style={PARA}>
              Kompete provides AI-generated competitive intelligence reports. You submit a company name; our system dispatches multiple AI agents to gather publicly available information from news sources, financial data, user reviews, and social signals, then synthesises a Strengths/Weaknesses/Opportunities/Threats (SWOT) report.
            </p>
            <p style={PARA}>
              Reports are generated using Google&apos;s Gemini language model and reflect information available at the time of generation. Reports are informational only and do not constitute financial, legal, or investment advice.
            </p>
          </Section>

          <Section num="3" title="Account Registration">
            <p style={PARA}>
              You may sign in with a Google account. You are responsible for maintaining the confidentiality of your session and for all activities that occur under your account. Notify us immediately if you suspect unauthorised access.
            </p>
            <p style={PARA}>
              Free-tier accounts are limited to one complimentary report. Additional reports require a valid personal Gemini API key, which you may supply through your account settings.
            </p>
          </Section>

          <Section num="4" title="Acceptable Use">
            <p style={PARA}>You agree not to:</p>
            <ul style={LIST_STYLE}>
              <li>Use the service for any unlawful purpose or in violation of any applicable law or regulation.</li>
              <li>Submit prompts or company names designed to extract personal data, generate defamatory content, or circumvent AI safety measures.</li>
              <li>Attempt to reverse-engineer, scrape, or systematically harvest data from the service.</li>
              <li>Share, resell, or sublicense access to your account or the generated reports in a manner that competes directly with Kompete.</li>
              <li>Introduce viruses, malware, or any code intended to disrupt the service or its infrastructure.</li>
              <li>Impersonate another person or entity, or misrepresent your affiliation.</li>
            </ul>
            <p style={PARA}>We reserve the right to suspend or terminate accounts that violate these rules without prior notice.</p>
          </Section>

          <Section num="5" title="Intellectual Property">
            <SubSection title="Our IP">
              The Kompete name, logo, user interface, prompt engineering, and underlying software are the intellectual property of Kompete and its creators. Nothing in these Terms transfers any ownership to you.
            </SubSection>
            <SubSection title="Generated Reports">
              Reports generated by the service are provided to you for your personal or internal business use. You may not republish or commercially exploit report content without our written permission. AI-generated content may not be fully protectable under copyright law; you acknowledge this limitation.
            </SubSection>
            <SubSection title="Feedback">
              If you submit feedback, suggestions, or ideas, you grant us a perpetual, royalty-free licence to use them for any purpose without compensation to you.
            </SubSection>
          </Section>

          <Section num="6" title="Third-Party Services">
            <p style={PARA}>
              Kompete integrates with third-party services including Google Gemini API, Google Firebase Authentication, and cloud database providers. Your use of those services is subject to their respective terms and privacy policies. We are not responsible for the conduct or content of third-party services.
            </p>
          </Section>

          <Section num="7" title="API Keys">
            <p style={PARA}>
              If you supply a Gemini API key, you represent that you have the right to use it and that doing so does not violate Google&apos;s API terms of service. You are solely responsible for all usage charges incurred through your key. We store it encrypted and use it only to process your research requests.
            </p>
          </Section>

          <Section num="8" title="Disclaimers">
            <p style={PARA}>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <p style={PARA}>
              Reports are generated by AI and may contain errors, omissions, or outdated information. We do not warrant the accuracy, completeness, or reliability of any report. You should independently verify material information before making business decisions based on our output.
            </p>
          </Section>

          <Section num="9" title="Limitation of Liability">
            <p style={PARA}>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, KOMPETE AND ITS CONTRIBUTORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUE, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA OR GOODWILL ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
            </p>
            <p style={PARA}>
              Our total aggregate liability for any claim arising from or relating to the service shall not exceed the greater of (a) the amount you paid us in the three months preceding the claim or (b) USD $10.
            </p>
          </Section>

          <Section num="10" title="Indemnification">
            <p style={PARA}>
              You agree to indemnify, defend, and hold harmless Kompete and its contributors from any claims, damages, liabilities, costs, and expenses (including reasonable legal fees) arising from your use of the service, your violation of these Terms, or your infringement of any third-party right.
            </p>
          </Section>

          <Section num="11" title="Termination">
            <p style={PARA}>
              We may suspend or terminate your access at any time, with or without cause, and with or without notice. Upon termination, your right to use the service ceases immediately. Sections on intellectual property, disclaimers, limitation of liability, and indemnification survive termination.
            </p>
          </Section>

          <Section num="12" title="Changes to These Terms">
            <p style={PARA}>
              We may revise these Terms at any time by posting an updated version with a new effective date. Continued use of the service after changes take effect constitutes acceptance of the revised Terms. We encourage you to review this page periodically.
            </p>
          </Section>

          <Section num="13" title="Governing Law">
            <p style={PARA}>
              These Terms are governed by the laws of India, without regard to its conflict-of-law provisions. Any dispute arising from these Terms or your use of the service shall be resolved by binding arbitration or, where arbitration is not available, by the competent courts located in India.
            </p>
          </Section>

          <Section num="14" title="Contact Us" last>
            <p style={PARA}>
              Questions about these Terms? Contact us at:
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
              <Link href="/terms" style={{ fontSize: '12.5px', color: 'var(--accent-light)', textDecoration: 'none' }}>Terms &amp; Conditions</Link>
              <Link href="/privacy" style={{ fontSize: '12.5px', color: 'var(--fg-subtle)', textDecoration: 'none' }}>Privacy Policy</Link>
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
