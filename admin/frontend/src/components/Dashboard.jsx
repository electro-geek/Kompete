import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Users, FileText, Key, Unlock, TrendingUp, Building2, Clock } from 'lucide-react'
import { getStats } from '../lib/api.js'
import { timeAgo, capitalize } from '../lib/utils.js'

function StatCard({ icon: Icon, label, value, color, glow, delay = 0 }) {
  const numRef = useRef(null)
  const cardRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay, ease: 'power2.out' }
    )
    if (value > 0) {
      gsap.fromTo({ val: 0 }, { val: value }, {
        val: value,
        duration: 1.2,
        delay: delay + 0.2,
        ease: 'power2.out',
        onUpdate() { if (numRef.current) numRef.current.textContent = Math.floor(this.targets()[0].val).toLocaleString() },
      })
    }
  }, [value])

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl p-5 cursor-default transition-all duration-300`}
      style={{
        background: 'linear-gradient(145deg, #111827, #0D1322)',
        border: '1px solid #1E2D45',
        boxShadow: `0 0 0 0 transparent`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color + '40'
        e.currentTarget.style.boxShadow = `0 0 28px ${color}15`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#1E2D45'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: `radial-gradient(ellipse at top right, ${color}08 0%, transparent 60%)`,
      }} />

      <div className="flex items-start justify-between mb-4">
        <div style={{ background: color + '15', border: `1px solid ${color}25`, borderRadius: 10, padding: 8, display: 'flex' }}>
          <Icon size={16} color={color} />
        </div>
      </div>

      <div ref={numRef} className="text-3xl font-semibold text-ink mb-1">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-muted font-medium tracking-wide">{label}</div>
    </div>
  )
}

function ActivityBar({ data }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group cursor-default relative">
          <div
            className="w-full rounded-sm transition-all duration-300"
            style={{
              height: `${Math.max((d.count / max) * 100, 6)}%`,
              background: d.count > 0 ? 'linear-gradient(180deg, #4F8CFF, #4F8CFF60)' : '#1E2D45',
              minHeight: 3,
            }}
          />
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border rounded px-2 py-1 text-xs text-ink opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-10"
            style={{ fontSize: 10, fontFamily: 'Fira Code, monospace' }}
          >
            {d.count} — {d.date}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard({ secret }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getStats(secret)
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [secret])

  if (loading) return <DashboardSkeleton />
  if (error)   return <ErrorState message={error} />

  const s = stats
  const cards = [
    { icon: Users,    label: 'Total Users',        value: s.total_users,        color: '#4F8CFF' },
    { icon: FileText, label: 'Total Reports',       value: s.total_reports,      color: '#8B5CF6' },
    { icon: Key,      label: 'With API Key',        value: s.users_with_api_key, color: '#10B981' },
    { icon: Unlock,   label: 'Free Tier',           value: s.users_on_free_tier, color: '#F59E0B' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* KPI Grid — 2×2, zero dead cells, grid-flow-dense */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 grid-flow-dense">
        {cards.map((c, i) => (
          <StatCard key={c.label} {...c} delay={i * 0.08} />
        ))}
      </div>

      {/* Two-column second row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Activity chart — spans 3 cols */}
        <div
          className="lg:col-span-3 rounded-2xl p-5"
          style={{ background: '#111827', border: '1px solid #1E2D45' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-ink font-semibold text-sm">Analysis Activity</div>
              <div className="text-muted text-xs mt-0.5">Reports generated per day (last 30 days)</div>
            </div>
            <TrendingUp size={16} className="text-primary opacity-60" />
          </div>
          <ActivityBar data={s.activity_by_day} />
          {(!s.activity_by_day || s.activity_by_day.length === 0) && (
            <div className="text-muted text-sm text-center py-4">No activity data yet</div>
          )}
        </div>

        {/* Top companies — spans 2 cols */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: '#111827', border: '1px solid #1E2D45' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={15} className="text-purple-400" style={{ color: '#8B5CF6' }} />
            <div className="text-ink font-semibold text-sm">Top Companies</div>
          </div>
          {(!s.top_companies || s.top_companies.length === 0) ? (
            <div className="text-muted text-sm">No data yet.</div>
          ) : (
            <div className="space-y-2.5">
              {s.top_companies.map((c, i) => {
                const max = s.top_companies[0].count
                return (
                  <div key={c.company} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-ink font-medium capitalize">{c.company}</span>
                      <span className="text-xs font-mono text-muted" style={{ fontFamily: 'Fira Code, monospace' }}>
                        {c.count}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1E2D45' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(c.count / max) * 100}%`,
                          background: `linear-gradient(90deg, #8B5CF6, #4F8CFF)`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent reports */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#111827', border: '1px solid #1E2D45' }}
      >
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #1E2D45' }}>
          <Clock size={15} style={{ color: '#4F8CFF' }} />
          <span className="text-ink font-semibold text-sm">Recent Reports</span>
          <span className="ml-auto badge" style={{ background: '#4F8CFF15', color: '#4F8CFF', border: '1px solid #4F8CFF25' }}>
            Latest 8
          </span>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #1E2D45' }}>
              {['Company', 'User', 'Email', 'When'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(!s.recent_reports || s.recent_reports.length === 0) ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted text-sm">No reports yet.</td>
              </tr>
            ) : s.recent_reports.map((r, i) => (
              <tr
                key={`${r.user_id}-${r.company}-${i}`}
                className="data-row transition-colors duration-150"
                style={{ borderBottom: i < s.recent_reports.length - 1 ? '1px solid #1E2D4530' : 'none' }}
              >
                <td className="px-5 py-3">
                  <span className="text-ink text-sm font-medium capitalize">{r.company}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-muted text-xs font-mono" style={{ fontFamily: 'Fira Code, monospace' }}>
                    {r.name || r.user_id.slice(0, 12) + '…'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-muted text-xs">{r.email || '—'}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-muted text-xs">{timeAgo(r.created_at)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="rounded-2xl p-5 h-32 skeleton" style={{ border: '1px solid #1E2D45' }} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-2xl h-40 skeleton" style={{ border: '1px solid #1E2D45' }} />
        <div className="lg:col-span-2 rounded-2xl h-40 skeleton" style={{ border: '1px solid #1E2D45' }} />
      </div>
      <div className="rounded-2xl h-64 skeleton" style={{ border: '1px solid #1E2D45' }} />
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="text-red-400 text-sm mb-2">{message}</div>
      <div className="text-muted text-xs">Check that the admin backend is running on port 8001.</div>
    </div>
  )
}
