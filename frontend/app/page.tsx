'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { startResearch, fetchUserReports, getPdfDownloadUrl, saveUserApiKey } from '@/lib/api'
import SearchBar from '@/components/SearchBar'
import Header from '@/components/Header'
import { Logo, LogoMark } from '@/components/Logo'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

const DEMO_COMPANIES = ['Notion', 'Linear', 'Figma', 'Vercel', 'Stripe', 'Airtable']

const FEATURES = [
  { num: '01', label: 'Multi-Agent Research', desc: 'Four specialized agents scan news, financials, reviews, and social signals simultaneously.' },
  { num: '02', label: 'SWOT Synthesis',       desc: 'A fifth agent combines all findings into a structured, evidence-backed competitive report.' },
  { num: '03', label: 'Under 60 Seconds',     desc: 'Parallel async execution cuts hours of manual research into less than a minute.' },
  { num: '04', label: 'PDF Export',           desc: 'One-click download of a polished, print-ready report for presentations.' },
]

/* ── Inline layout constants ─────────────────────────────────────────────── */
const CONTAINER = { maxWidth: '660px', margin: '0 auto', padding: '0 24px' }
const WIDE      = { maxWidth: '980px', margin: '0 auto', padding: '0 24px' }
const DIVIDER   = { height: '1px', background: 'linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent)', maxWidth: '980px', margin: '0 auto' }

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [history, setHistory]   = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false)
  const [apiKey, setApiKey]     = useState('')
  const [savingApiKey, setSavingApiKey] = useState(false)
  const [pendingCompany, setPendingCompany] = useState('')
  const [promptReason, setPromptReason] = useState<'free_limit' | 'quota'>('free_limit')
  const [keyFocused, setKeyFocused] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('quota') === 'true') {
        setPendingCompany(p.get('company') || '')
        setPromptReason('quota')
        setShowApiKeyPrompt(true)
        window.history.replaceState({}, '', '/')
      }
    }
  }, [])

  useEffect(() => {
    if (user?.token) {
      setHistoryLoading(true)
      fetchUserReports(user.token)
        .then(setHistory)
        .catch(() => {})
        .finally(() => setHistoryLoading(false))
    } else {
      setHistory([])
    }
  }, [user])

  const handleSearch = async (company: string) => {
    if (!company.trim()) return
    setLoading(true)
    setError(null)
    try {
      await startResearch(company.trim(), user?.token)
      router.push(`/research/${encodeURIComponent(company.trim().toLowerCase())}`)
    } catch (err: any) {
      if (err.message === 'free_limit_reached') {
        setPendingCompany(company.trim())
        setPromptReason('free_limit')
        setShowApiKeyPrompt(true)
      } else if (err.message === 'You must be logged in to analyze a company.') {
        setError(err.message)
      } else {
        setError(err.message || 'Failed to start research')
      }
      setLoading(false)
    }
  }

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return
    setSavingApiKey(true)
    setError(null)
    try {
      await saveUserApiKey(apiKey.trim(), user?.token)
      setShowApiKeyPrompt(false)
      if (pendingCompany) handleSearch(pendingCompany)
    } catch (err: any) {
      setError(err.message || 'Failed to save API key')
      setSavingApiKey(false)
    }
  }

  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', paddingTop: '58px' }}>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: [
            'radial-gradient(ellipse 85% 55% at 50% -5%, rgba(99,102,241,0.16) 0%, transparent 65%)',
            'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: 'auto, 28px 28px',
        }}>
          <div style={{ ...CONTAINER, paddingTop: '96px', paddingBottom: '88px', textAlign: 'center' }}>

            <h1
              className="heading animate-fade-up"
              style={{
                fontSize: 'clamp(38px, 6vw, 66px)',
                fontWeight: 800,
                lineHeight: 1.04,
                letterSpacing: '-0.04em',
                color: 'var(--fg)',
                marginBottom: '22px',
                animationFillMode: 'both',
              }}
            >
              Know your competition,{' '}
              <span className="display italic text-gradient">completely.</span>
            </h1>

            <p
              className="animate-fade-up"
              style={{
                fontSize: '17px', lineHeight: 1.72,
                color: 'var(--fg-dim)', marginBottom: '44px',
                animationDelay: '60ms', animationFillMode: 'both',
              }}
            >
              Type a company name. Four AI agents browse news, financials, reviews, and social signals — then synthesize a full SWOT in under 60 seconds.
            </p>

            {/* Search / API key prompt */}
            <div className="animate-fade-up" style={{ animationDelay: '120ms', animationFillMode: 'both' }}>
              {!showApiKeyPrompt ? (
                <SearchBar onSearch={handleSearch} loading={loading} />
              ) : (
                <div className="animate-fade-in" style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '18px', padding: '26px', textAlign: 'left',
                  maxWidth: '480px', margin: '0 auto',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
                }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fg)', margin: '0 0 7px' }}>
                    {promptReason === 'quota' ? 'API quota temporarily exceeded' : 'Free analysis limit reached'}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--fg-dim)', margin: '0 0 18px', lineHeight: 1.65 }}>
                    {promptReason === 'quota'
                      ? 'Our shared quota is exhausted. Add your own Gemini API key to continue.'
                      : "You've used your free analysis. Add a Gemini API key to continue."}
                    {' '}
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 500 }}>
                      Get a free key →
                    </a>
                  </p>
                  <input
                    type="password"
                    placeholder="Paste your Gemini API key (AIza…)"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    onFocus={() => setKeyFocused(true)}
                    onBlur={() => setKeyFocused(false)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveApiKey() }}
                    style={{
                      width: '100%', padding: '11px 14px',
                      background: 'var(--elevated)',
                      border: `1px solid ${keyFocused ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: '12px', color: 'var(--fg)', fontSize: '14px',
                      outline: 'none', marginBottom: '12px',
                      boxShadow: keyFocused ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowApiKeyPrompt(false)} style={{
                      padding: '9px 18px', borderRadius: '10px',
                      background: 'var(--elevated)', border: '1px solid var(--border)',
                      color: 'var(--fg-dim)', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
                    }}>
                      Cancel
                    </button>
                    <button onClick={handleSaveApiKey} disabled={savingApiKey || !apiKey.trim()} style={{
                      padding: '9px 18px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                      border: 'none', color: 'white', fontSize: '13px', fontWeight: 600,
                      cursor: savingApiKey || !apiKey.trim() ? 'not-allowed' : 'pointer',
                      opacity: savingApiKey || !apiKey.trim() ? 0.5 : 1,
                      boxShadow: '0 2px 12px rgba(99,102,241,0.3)',
                    }}>
                      {savingApiKey ? 'Saving…' : 'Save & continue'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="animate-fade-in" style={{
                maxWidth: '480px', margin: '14px auto 0',
                background: 'var(--red-bg)', border: '1px solid var(--red-border)',
                borderRadius: '12px', padding: '11px 16px',
                fontSize: '13px', color: '#fca5a5', textAlign: 'left', lineHeight: 1.55,
              }}>
                {error}
              </div>
            )}

            {/* Demo chips */}
            <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--fg-subtle)', marginRight: '2px' }}>Try:</span>
              {DEMO_COMPANIES.map(c => (
                <button
                  key={c}
                  onClick={() => handleSearch(c)}
                  disabled={loading}
                  className="badge badge-default"
                  style={{ cursor: loading ? 'not-allowed' : 'pointer', fontSize: '12px', padding: '4px 12px', fontWeight: 500, transition: 'all 0.18s' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--accent-bg)';
                    e.currentTarget.style.borderColor = 'var(--accent-border)';
                    e.currentTarget.style.color = 'var(--accent-light)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--elevated)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--fg-dim)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

          </div>{/* /CONTAINER */}
        </div>{/* /hero wrapper */}

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div style={DIVIDER} />

        {/* ── Features ──────────────────────────────────────────────────── */}
        <section style={{ paddingTop: '72px', paddingBottom: '72px' }}>
          <div style={WIDE}>
            <p className="section-label animate-fade-up" style={{ textAlign: 'center', marginBottom: '40px', animationFillMode: 'both' }}>
              How it works
            </p>

            {/* Inline CSS grid — no Tailwind */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px',
            }}>
              {FEATURES.map((f, i) => (
                <div
                  key={f.num}
                  className="animate-fade-up"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '24px',
                    animationDelay: `${i * 70}ms`,
                    animationFillMode: 'both',
                    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent-border)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="mono" style={{
                    fontSize: '28px', fontWeight: 800, lineHeight: 1,
                    color: 'var(--accent)', opacity: 0.32,
                    letterSpacing: '-0.05em', marginBottom: '18px',
                  }}>
                    {f.num}
                  </div>
                  <h3 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--fg)', marginBottom: '8px', lineHeight: 1.4 }}>
                    {f.label}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--fg-dim)', lineHeight: 1.65, margin: 0 }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Research History ──────────────────────────────────────────── */}
        {user && (
          <>
            <div style={DIVIDER} />
            <section style={{ paddingTop: '72px', paddingBottom: '80px' }}>
              <div style={WIDE} className="animate-fade-up">
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
                  <div>
                    <p className="section-label" style={{ marginBottom: '7px' }}>Research History</p>
                    <h2 className="heading" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--fg)', margin: 0, lineHeight: 1.25, letterSpacing: '-0.03em' }}>
                      Your saved reports
                    </h2>
                  </div>
                  <span className="badge badge-accent" style={{ padding: '4px 12px' }}>
                    {history.length} {history.length === 1 ? 'report' : 'reports'}
                  </span>
                </div>

                {historyLoading ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {[1, 2].map(i => (
                      <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '16px' }} />
                    ))}
                  </div>
                ) : history.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                    {history.map(item => {
                      const name  = item.company.charAt(0).toUpperCase() + item.company.slice(1)
                      const score = item.report?.sentiment_score ?? 5
                      const cls   = score >= 7 ? 'badge-green' : score <= 4 ? 'badge-red' : 'badge-amber'
                      const date  = new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

                      return (
                        <div
                          key={item.company}
                          style={{
                            background: 'var(--surface)', border: '1px solid var(--border)',
                            borderRadius: '16px', padding: '20px',
                            display: 'flex', flexDirection: 'column', gap: '14px',
                            transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--accent-border)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.45)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            {/* Company avatar */}
                            <div style={{
                              width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                              background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(124,58,237,0.14))',
                              border: '1px solid var(--accent-border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '15px', fontWeight: 700, color: 'var(--accent-light)',
                            }}>
                              {name[0]}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                                <h3 className="heading" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg)', margin: 0, letterSpacing: '-0.02em' }}>
                                  {name}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
                                  <span className={`badge ${cls}`}>{score}/10</span>
                                  <span className="mono" style={{ fontSize: '11px', color: 'var(--fg-subtle)' }}>{date}</span>
                                </div>
                              </div>
                              {item.report?.executive_summary && (
                                <p className="line-clamp-2" style={{ fontSize: '12.5px', color: 'var(--fg-dim)', lineHeight: 1.6, margin: 0 }}>
                                  {item.report.executive_summary}
                                </p>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                            <Link
                              href={`/report/${encodeURIComponent(item.company)}`}
                              style={{
                                fontSize: '12.5px', fontWeight: 600, padding: '7px 16px',
                                borderRadius: '10px', textDecoration: 'none',
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.16), rgba(124,58,237,0.11))',
                                border: '1px solid var(--accent-border)',
                                color: 'var(--accent-light)', transition: 'all 0.15s',
                              }}
                            >
                              View report →
                            </Link>
                            <a
                              href={getPdfDownloadUrl(item.company, user.token)}
                              download title="Download PDF"
                              style={{
                                fontSize: '12.5px', padding: '7px 14px', borderRadius: '10px',
                                textDecoration: 'none', background: 'var(--elevated)',
                                border: '1px solid var(--border)', color: 'var(--fg-dim)', fontWeight: 500,
                                transition: 'all 0.15s',
                              }}
                            >
                              PDF ↓
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '16px', padding: '64px 24px', textAlign: 'center',
                  }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '14px',
                      background: 'var(--elevated)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--fg-subtle)' }}>
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
                        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--fg)', margin: '0 0 6px' }}>No reports yet</p>
                    <p style={{ fontSize: '13px', color: 'var(--fg-dim)', margin: 0 }}>Start your first competitive research above.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div style={DIVIDER} />
        <footer style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <LogoMark size={18} />
            <span className="heading" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg-subtle)', letterSpacing: '-0.3px' }}>
              Kompete
            </span>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--fg-subtle)', margin: 0, opacity: 0.65 }}>
            Built for Milan AI Week · AI Agent Olympics Hackathon 2026
          </p>
        </footer>

      </main>
    </>
  )
}
