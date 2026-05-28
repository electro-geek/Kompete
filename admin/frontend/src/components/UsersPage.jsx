import React, { useState, useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import {
  Search, RefreshCw, ChevronDown, ChevronUp, Trash2,
  RotateCcw, ChevronRight, X, FileText, Key, Unlock, Clock
} from 'lucide-react'
import { getUsers, getUserReports, deleteUser, resetUserLimit, deleteReport } from '../lib/api.js'
import { timeAgo, formatDate, getDisplayName, getUserInitials, getAvatarColor, truncate } from '../lib/utils.js'

function Avatar({ user, size = 32 }) {
  const color = getAvatarColor(user.user_id)
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: color + '20',
        border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        fontSize: size * 0.35,
        fontWeight: 600,
        color,
        letterSpacing: '-0.02em',
      }}
    >
      {getUserInitials(user)}
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onCancel, danger = true }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: '#00000080' }}>
      <div
        className="rounded-2xl p-6 max-w-sm w-full mx-4"
        style={{ background: '#0D1322', border: '1px solid #1E2D45', boxShadow: '0 32px 80px #00000060' }}
      >
        <p className="text-ink text-sm mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-medium text-muted cursor-pointer transition-colors"
            style={{ background: '#111827', border: '1px solid #1E2D45' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#4F8CFF40'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1E2D45'}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer transition-all"
            style={{ background: danger ? '#EF444490' : '#4F8CFF', border: danger ? '1px solid #EF444440' : '1px solid #4F8CFF60' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

function UserDetailPanel({ user, secret, onClose, onUserChanged }) {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const panelRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(panelRef.current, { x: 32, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' })
    getUserReports(secret, user.user_id)
      .then(d => setReports(d.reports))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [user.user_id])

  function handleClose() {
    gsap.to(panelRef.current, { x: 32, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: onClose })
  }

  async function handleDeleteReport(company) {
    setConfirm({
      message: `Delete the "${company}" report for this user? This resets their free-tier slot for that company.`,
      onConfirm: async () => {
        setConfirm(null)
        await deleteReport(secret, user.user_id, company)
        setReports(r => r.filter(rep => rep.company !== company))
        onUserChanged()
      },
    })
  }

  async function handleReset() {
    setConfirm({
      message: `Reset all reports for ${getDisplayName(user)}? This restores their free-tier limit.`,
      onConfirm: async () => {
        setConfirm(null)
        await resetUserLimit(secret, user.user_id)
        setReports([])
        onUserChanged()
      },
    })
  }

  async function handleDelete() {
    setConfirm({
      message: `Permanently delete ALL data for ${getDisplayName(user)}? This cannot be undone.`,
      danger: true,
      onConfirm: async () => {
        setConfirm(null)
        await deleteUser(secret, user.user_id)
        onUserChanged()
        onClose()
      },
    })
  }

  const color = getAvatarColor(user.user_id)

  return (
    <>
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} danger={confirm.danger !== false} />}
      <div
        ref={panelRef}
        className="flex flex-col h-full overflow-hidden"
        style={{
          width: 360,
          background: '#0D1322',
          borderLeft: '1px solid #1E2D45',
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1E2D45' }}>
          <div className="text-ink font-semibold text-sm">User Detail</div>
          <button onClick={handleClose} className="text-muted hover:text-ink cursor-pointer transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* User info */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid #1E2D45' }}>
          <div className="flex items-center gap-3 mb-4">
            <Avatar user={user} size={44} />
            <div className="min-w-0">
              <div className="text-ink font-semibold text-sm truncate">{getDisplayName(user)}</div>
              <div className="text-muted text-xs truncate">{user.email || 'No email'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl px-3 py-2.5" style={{ background: '#111827', border: '1px solid #1E2D45' }}>
              <div className="text-xs text-muted mb-1">Reports</div>
              <div className="text-ink font-semibold">{user.report_count}</div>
            </div>
            <div className="rounded-xl px-3 py-2.5" style={{ background: '#111827', border: '1px solid #1E2D45' }}>
              <div className="text-xs text-muted mb-1">Plan</div>
              <div className="flex items-center gap-1.5">
                {user.has_api_key
                  ? <><Key size={11} style={{ color: '#10B981' }} /><span className="text-green-400 text-xs font-medium" style={{ color: '#10B981' }}>API Key</span></>
                  : <><Unlock size={11} style={{ color: '#F59E0B' }} /><span className="text-xs font-medium" style={{ color: '#F59E0B' }}>Free</span></>
                }
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1 text-xs text-muted">
            <Clock size={11} />
            Last active {timeAgo(user.last_active)}
          </div>

          <div className="mt-2 px-2 py-1 rounded text-xs font-mono text-muted" style={{ background: '#080B14', fontFamily: 'Fira Code, monospace' }}>
            {user.user_id}
          </div>
        </div>

        {/* Reports list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1E2D45' }}>
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              Analyzed Companies
            </span>
            <span className="text-xs font-mono text-primary" style={{ fontFamily: 'Fira Code, monospace' }}>
              {reports ? reports.length : '…'}
            </span>
          </div>

          {loading ? (
            <div className="space-y-2 p-4">
              {[0,1,2].map(i => <div key={i} className="h-12 rounded-xl skeleton" />)}
            </div>
          ) : reports && reports.length === 0 ? (
            <div className="px-5 py-6 text-center text-muted text-sm">No reports yet.</div>
          ) : (
            <div className="p-3 space-y-2">
              {reports?.map(r => (
                <div
                  key={r.company}
                  className="flex items-center justify-between rounded-xl px-3 py-3 group transition-all duration-200"
                  style={{ background: '#111827', border: '1px solid #1E2D45' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#1E2D6580' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E2D45' }}
                >
                  <div className="min-w-0">
                    <div className="text-ink text-xs font-medium capitalize truncate">{r.company}</div>
                    <div className="text-muted text-xs mt-0.5">{timeAgo(r.created_at)}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteReport(r.company)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted hover:text-red-400 cursor-pointer ml-3 flex-shrink-0"
                    title="Delete this report"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 py-4 space-y-2" style={{ borderTop: '1px solid #1E2D45' }}>
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200"
            style={{ background: '#F59E0B15', color: '#F59E0B', border: '1px solid #F59E0B30' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F59E0B25' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F59E0B15' }}
          >
            <RotateCcw size={13} />
            Reset Report Limit
          </button>
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200"
            style={{ background: '#EF444415', color: '#EF4444', border: '1px solid #EF444430' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#EF444425' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#EF444415' }}
          >
            <Trash2 size={13} />
            Delete User Data
          </button>
        </div>
      </div>
    </>
  )
}

export default function UsersPage({ secret }) {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [sortKey, setSortKey]   = useState('last_active')
  const [sortDir, setSortDir]   = useState('desc')
  const [selected, setSelected] = useState(null)
  const [filter, setFilter]     = useState('all') // all | key | free

  const fetchUsers = useCallback(() => {
    setLoading(true)
    getUsers(secret)
      .then(d => setUsers(d.users))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [secret])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase()
      const match = !q || getDisplayName(u).toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.user_id.toLowerCase().includes(q)
      const tier = filter === 'key' ? u.has_api_key : filter === 'free' ? !u.has_api_key : true
      return match && tier
    })
    .sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey]
      if (sortKey === 'last_active') { av = new Date(av); bv = new Date(bv) }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronDown size={11} className="opacity-20" />
    return sortDir === 'asc' ? <ChevronUp size={11} style={{ color: '#4F8CFF' }} /> : <ChevronDown size={11} style={{ color: '#4F8CFF' }} />
  }

  if (error) return <div className="text-red-400 text-sm p-4">{error}</div>

  return (
    <div className="flex h-full gap-0 -mx-6 -my-6 overflow-hidden">
      {/* Main table area */}
      <div className="flex-1 flex flex-col overflow-hidden px-6 py-6">
        {/* Controls */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-ink placeholder-muted outline-none transition-all duration-200"
              style={{ background: '#111827', border: '1px solid #1E2D45' }}
              onFocus={e => { e.target.style.borderColor = '#4F8CFF40'; e.target.style.boxShadow = '0 0 0 3px #4F8CFF08' }}
              onBlur={e  => { e.target.style.borderColor = '#1E2D45'; e.target.style.boxShadow = 'none' }}
            />
          </div>
          <div className="flex gap-1.5">
            {[['all', 'All'], ['key', 'API Key'], ['free', 'Free']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className="px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200"
                style={{
                  background: filter === val ? '#4F8CFF20' : '#111827',
                  color: filter === val ? '#4F8CFF' : '#64748B',
                  border: `1px solid ${filter === val ? '#4F8CFF40' : '#1E2D45'}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-muted cursor-pointer transition-all duration-200"
            style={{ background: '#111827', border: '1px solid #1E2D45' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4F8CFF40' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E2D45' }}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden rounded-2xl" style={{ border: '1px solid #1E2D45' }}>
          <div className="overflow-y-auto h-full">
            <table className="w-full">
              <thead className="sticky top-0" style={{ background: '#0D1322', borderBottom: '1px solid #1E2D45' }}>
                <tr>
                  <th className="text-left px-5 py-3">
                    <span className="text-xs font-medium text-muted uppercase tracking-wider">User</span>
                  </th>
                  {[
                    ['report_count', 'Reports'],
                    ['has_api_key',  'Plan'],
                    ['last_active',  'Last Active'],
                  ].map(([key, label]) => (
                    <th
                      key={key}
                      className="text-left px-5 py-3 cursor-pointer select-none"
                      onClick={() => toggleSort(key)}
                    >
                      <span className="flex items-center gap-1 text-xs font-medium text-muted uppercase tracking-wider hover:text-ink transition-colors">
                        {label} <SortIcon col={key} />
                      </span>
                    </th>
                  ))}
                  <th className="px-5 py-3 w-10" />
                </tr>
              </thead>
              <tbody style={{ background: '#111827' }}>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1E2D4530' }}>
                      {[1,2,3,4,5].map(j => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 rounded skeleton" style={{ width: `${60 + Math.random() * 30}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted text-sm">
                      {search ? 'No users match your search.' : 'No users yet.'}
                    </td>
                  </tr>
                ) : filtered.map((u, i) => (
                  <tr
                    key={u.user_id}
                    className="data-row cursor-pointer transition-colors duration-150"
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid #1E2D4530' : 'none',
                      background: selected?.user_id === u.user_id ? '#4F8CFF08' : undefined,
                    }}
                    onClick={() => setSelected(selected?.user_id === u.user_id ? null : u)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar user={u} />
                        <div className="min-w-0">
                          <div className="text-ink text-sm font-medium truncate">{getDisplayName(u)}</div>
                          <div className="text-muted text-xs truncate">{u.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-ink text-sm font-semibold" style={{ fontFamily: 'Fira Code, monospace' }}>
                        {u.report_count}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.has_api_key ? (
                        <span className="badge" style={{ background: '#10B98115', color: '#10B981', border: '1px solid #10B98125' }}>
                          API Key
                        </span>
                      ) : (
                        <span className="badge" style={{ background: '#F59E0B15', color: '#F59E0B', border: '1px solid #F59E0B25' }}>
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-muted text-xs">{timeAgo(u.last_active)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <ChevronRight size={14} className="text-muted opacity-40 group-hover:opacity-100" style={{ color: selected?.user_id === u.user_id ? '#4F8CFF' : undefined }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-muted text-xs mt-3" style={{ fontFamily: 'Fira Code, monospace' }}>
          {filtered.length} / {users.length} users
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <UserDetailPanel
          user={selected}
          secret={secret}
          onClose={() => setSelected(null)}
          onUserChanged={fetchUsers}
        />
      )}
    </div>
  )
}
