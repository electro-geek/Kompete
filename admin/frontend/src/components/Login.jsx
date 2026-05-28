import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { login } from '../lib/api.js'
import { ShieldCheck, Eye, EyeOff, Layers } from 'lucide-react'

export default function Login({ onLogin }) {
  const [secret, setSecret] = useState('')
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const containerRef = useRef(null)
  const cardRef = useRef(null)
  const orbRef1 = useRef(null)
  const orbRef2 = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(orbRef1.current, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.8, ease: 'power2.out' })
    tl.fromTo(orbRef2.current, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.8, ease: 'power2.out' }, '-=1.4')
    tl.fromTo(cardRef.current,
      { y: 32, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'power3.out' },
      '-=1.0'
    )
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!secret.trim()) return
    setLoading(true)
    setError('')
    try {
      await login(secret.trim())
      gsap.to(cardRef.current, { y: -12, opacity: 0, scale: 0.97, duration: 0.35, ease: 'power2.in', onComplete: () => onLogin(secret.trim()) })
    } catch {
      setError('Invalid admin secret. Check your ADMIN_SECRET env var.')
      gsap.fromTo(cardRef.current, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      ref={containerRef}
      className="min-h-screen w-full flex items-center justify-center overflow-hidden relative mesh-bg"
      style={{ background: '#080B14' }}
    >
      {/* Ambient orbs */}
      <div
        ref={orbRef1}
        className="pointer-events-none absolute"
        style={{
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #4F8CFF12 0%, transparent 70%)',
          top: '5%',
          left: '10%',
          filter: 'blur(40px)',
        }}
      />
      <div
        ref={orbRef2}
        className="pointer-events-none absolute"
        style={{
          width: 440,
          height: 440,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #8B5CF614 0%, transparent 70%)',
          bottom: '5%',
          right: '8%',
          filter: 'blur(48px)',
        }}
      />

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(#1E2D4508 1px, transparent 1px), linear-gradient(90deg, #1E2D4508 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Login card */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-md mx-4"
        style={{
          background: 'linear-gradient(145deg, #0D1322 0%, #111827 100%)',
          border: '1px solid #1E2D45',
          borderRadius: 20,
          padding: '40px 36px',
          boxShadow: '0 32px 80px #00000060, 0 0 0 1px #4F8CFF08',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="flex items-center justify-center"
            style={{
              width: 42,
              height: 42,
              background: 'linear-gradient(135deg, #4F8CFF20, #8B5CF620)',
              border: '1px solid #4F8CFF30',
              borderRadius: 10,
            }}
          >
            <Layers size={20} color="#4F8CFF" />
          </div>
          <div>
            <div className="font-semibold text-ink text-sm tracking-wide">KOMPETE</div>
            <div className="text-muted" style={{ fontSize: 11, fontFamily: 'Fira Code, monospace', letterSpacing: '0.06em' }}>ADMIN CONSOLE</div>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-ink mb-1">Sign in</h1>
        <p className="text-muted text-sm mb-8">Enter your admin secret to access the console.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-2 uppercase tracking-wider">
              Admin Secret
            </label>
            <div className="relative">
              <input
                type={visible ? 'text' : 'password'}
                value={secret}
                onChange={e => setSecret(e.target.value)}
                placeholder="Enter secret…"
                autoFocus
                className="w-full pr-10 pl-4 py-3 rounded-xl text-sm text-ink placeholder-muted outline-none transition-all duration-200"
                style={{
                  background: '#080B14',
                  border: `1px solid ${error ? '#EF4444' : secret ? '#4F8CFF40' : '#1E2D45'}`,
                  fontFamily: secret && !visible ? 'monospace' : 'Outfit, sans-serif',
                }}
                onFocus={e => { e.target.style.borderColor = '#4F8CFF60'; e.target.style.boxShadow = '0 0 0 3px #4F8CFF10' }}
                onBlur={e  => { e.target.style.borderColor = error ? '#EF444460' : '#1E2D45'; e.target.style.boxShadow = 'none' }}
              />
              <button
                type="button"
                onClick={() => setVisible(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors cursor-pointer"
              >
                {visible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', display: 'inline-block', flexShrink: 0 }} />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !secret.trim()}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading ? '#1E2D45' : 'linear-gradient(135deg, #4F8CFF, #6B6EFF)',
              color: '#fff',
              border: 'none',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px #4F8CFF30' } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <ShieldCheck size={16} />
            {loading ? 'Verifying…' : 'Access Console'}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-6" style={{ fontFamily: 'Fira Code, monospace' }}>
          kompete.admin <span style={{ color: '#1E2D45' }}>///</span> internal use only
        </p>
      </div>
    </main>
  )
}
