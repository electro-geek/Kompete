'use client'

import { useState, KeyboardEvent } from 'react'

interface SearchBarProps {
  onSearch: (company: string) => void
  loading: boolean
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)

  const active = !loading && !!value.trim()

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) onSearch(value)
  }

  return (
    <div style={{ width: '100%', maxWidth: '560px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--surface)',
        border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: '16px',
        padding: '5px 5px 5px 18px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: focused
          ? '0 0 0 3px rgba(99,102,241,0.14), 0 4px 24px rgba(0,0,0,0.35)'
          : '0 2px 16px rgba(0,0,0,0.25)',
      }}>

        {/* Icon */}
        {loading ? (
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"
            style={{ color: 'var(--accent)', flexShrink: 0, marginRight: '12px' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" style={{ opacity: 0.18 }} />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            style={{ color: focused ? 'var(--accent-light)' : 'var(--fg-subtle)', flexShrink: 0, marginRight: '12px', transition: 'color 0.2s' }}>
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}

        <input
          id="company-search"
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Enter a company — Notion, Stripe, Figma…"
          disabled={loading}
          autoFocus
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            fontSize: '15px', color: 'var(--fg)', padding: '11px 0',
            caretColor: 'var(--accent)',
          }}
          className="placeholder:text-[#46465e]"
        />

        <button
          id="research-btn"
          onClick={() => onSearch(value)}
          disabled={!active}
          style={{
            padding: '10px 20px', borderRadius: '12px',
            background: active ? 'linear-gradient(135deg, #6366f1, #7c3aed)' : 'var(--elevated)',
            border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
            color: active ? 'white' : 'var(--fg-subtle)',
            fontSize: '13.5px', fontWeight: '600',
            cursor: active ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', gap: '6px',
            whiteSpace: 'nowrap', flexShrink: 0,
            boxShadow: active ? '0 2px 14px rgba(99,102,241,0.35)' : 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (active) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.5)'; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = active ? '0 2px 14px rgba(99,102,241,0.35)' : 'none'; }}
        >
          {loading ? 'Researching…' : 'Research →'}
        </button>
      </div>
    </div>
  )
}
