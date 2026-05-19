'use client'

import { useState, KeyboardEvent } from 'react'

interface SearchBarProps {
  onSearch: (company: string) => void
  loading: boolean
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [value, setValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      onSearch(value)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative gradient-border p-0.5 rounded-2xl">
        <div className="relative flex items-center bg-slate-900 rounded-2xl overflow-hidden">
          <div className="absolute left-4 text-slate-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="company-search"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a company name… e.g. Notion, Stripe, Figma"
            disabled={loading}
            autoFocus
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-lg pl-12 pr-4 py-4 outline-none disabled:opacity-50"
          />
          <button
            id="research-btn"
            onClick={() => onSearch(value)}
            disabled={loading || !value.trim()}
            className="m-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap hover:shadow-lg hover:shadow-brand-500/30 active:scale-95"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Starting…
              </>
            ) : (
              <>Research →</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
