import React, { useState, useEffect, useCallback } from 'react'
import { Search, RefreshCw, ChevronDown, ChevronUp, Building2, Calendar } from 'lucide-react'
import { getAllReports } from '../lib/api.js'
import { formatDate, timeAgo, getAvatarColor, getUserInitials, getDisplayName, truncate } from '../lib/utils.js'

function UserChip({ report }) {
  const color = getAvatarColor(report.user_id)
  const initials = getUserInitials({ user_id: report.user_id, email: report.email, name: report.name })
  return (
    <div className="flex items-center gap-2">
      <div
        style={{
          width: 24, height: 24,
          borderRadius: '50%',
          background: color + '20',
          border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 600, color, flexShrink: 0,
        }}
      >
        {initials}
      </div>
      <div>
        <div className="text-ink text-xs font-medium">{report.name || truncate(report.user_id, 14)}</div>
        <div className="text-muted" style={{ fontSize: 10 }}>{report.email || '—'}</div>
      </div>
    </div>
  )
}

export default function ReportsPage({ secret }) {
  const [reports, setReports]  = useState([])
  const [loading, setLoading]  = useState(true)
  const [error, setError]      = useState('')
  const [search, setSearch]    = useState('')
  const [sortKey, setSortKey]  = useState('created_at')
  const [sortDir, setSortDir]  = useState('desc')
  const [page, setPage]        = useState(1)
  const PER_PAGE = 30

  const fetchReports = useCallback(() => {
    setLoading(true)
    getAllReports(secret)
      .then(d => { setReports(d.reports); setPage(1) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [secret])

  useEffect(() => { fetchReports() }, [fetchReports])

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = reports
    .filter(r => {
      if (!search) return true
      const q = search.toLowerCase()
      return r.company.toLowerCase().includes(q)
        || r.email.toLowerCase().includes(q)
        || r.name.toLowerCase().includes(q)
        || r.user_id.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey]
      if (sortKey === 'created_at') { av = new Date(av); bv = new Date(bv) }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronDown size={11} className="opacity-20" />
    return sortDir === 'asc' ? <ChevronUp size={11} style={{ color: '#4F8CFF' }} /> : <ChevronDown size={11} style={{ color: '#4F8CFF' }} />
  }

  // Company frequency map for bar decorations
  const companyCount = {}
  reports.forEach(r => { companyCount[r.company] = (companyCount[r.company] || 0) + 1 })
  const maxCount = Math.max(...Object.values(companyCount), 1)

  if (error) return <div className="text-red-400 text-sm p-4">{error}</div>

  return (
    <div className="flex flex-col h-full space-y-4 max-w-7xl mx-auto">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by company, user, or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-ink placeholder-muted outline-none transition-all duration-200"
            style={{ background: '#111827', border: '1px solid #1E2D45' }}
            onFocus={e => { e.target.style.borderColor = '#4F8CFF40'; e.target.style.boxShadow = '0 0 0 3px #4F8CFF08' }}
            onBlur={e  => { e.target.style.borderColor = '#1E2D45'; e.target.style.boxShadow = 'none' }}
          />
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-muted cursor-pointer transition-all duration-200"
          style={{ background: '#111827', border: '1px solid #1E2D45' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#4F8CFF40'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#1E2D45'}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden rounded-2xl" style={{ border: '1px solid #1E2D45' }}>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 260px)' }}>
          <table className="w-full">
            <thead className="sticky top-0" style={{ background: '#0D1322', borderBottom: '1px solid #1E2D45' }}>
              <tr>
                <th className="text-left px-5 py-3 cursor-pointer select-none" onClick={() => toggleSort('company')}>
                  <span className="flex items-center gap-1 text-xs font-medium text-muted uppercase tracking-wider hover:text-ink transition-colors">
                    Company <SortIcon col="company" />
                  </span>
                </th>
                <th className="text-left px-5 py-3">
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">Requested By</span>
                </th>
                <th className="text-left px-5 py-3 cursor-pointer select-none" onClick={() => toggleSort('created_at')}>
                  <span className="flex items-center gap-1 text-xs font-medium text-muted uppercase tracking-wider hover:text-ink transition-colors">
                    Date <SortIcon col="created_at" />
                  </span>
                </th>
                <th className="text-left px-5 py-3">
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">Frequency</span>
                </th>
              </tr>
            </thead>
            <tbody style={{ background: '#111827' }}>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1E2D4530' }}>
                    {[1,2,3,4].map(j => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded skeleton" style={{ width: `${40 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-muted text-sm">
                    {search ? 'No reports match your search.' : 'No reports yet.'}
                  </td>
                </tr>
              ) : paginated.map((r, i) => (
                <tr
                  key={`${r.user_id}-${r.company}-${r.created_at}`}
                  className="data-row transition-colors duration-150"
                  style={{ borderBottom: i < paginated.length - 1 ? '1px solid #1E2D4530' : 'none' }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        style={{
                          width: 28, height: 28,
                          borderRadius: 7,
                          background: '#4F8CFF15',
                          border: '1px solid #4F8CFF25',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Building2 size={13} style={{ color: '#4F8CFF' }} />
                      </div>
                      <span className="text-ink text-sm font-medium capitalize">{r.company}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <UserChip report={r} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <div className="text-ink text-xs">{timeAgo(r.created_at)}</div>
                      <div className="text-muted" style={{ fontSize: 10 }}>{formatDate(r.created_at)}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full overflow-hidden" style={{ background: '#1E2D45' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${((companyCount[r.company] || 1) / maxCount) * 100}%`,
                            background: 'linear-gradient(90deg, #4F8CFF, #8B5CF6)',
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted" style={{ fontFamily: 'Fira Code, monospace' }}>
                        {companyCount[r.company]}x
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination + summary */}
      <div className="flex items-center justify-between">
        <span className="text-muted text-xs" style={{ fontFamily: 'Fira Code, monospace' }}>
          {filtered.length} reports{search ? ` matching "${search}"` : ''}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, page - 3),
              Math.min(totalPages, page + 2),
            ).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200"
                style={{
                  background: p === page ? '#4F8CFF' : '#111827',
                  color: p === page ? '#fff' : '#64748B',
                  border: `1px solid ${p === page ? '#4F8CFF60' : '#1E2D45'}`,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
