import React, { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import {
  LayoutDashboard, Users, FileText, LogOut, Layers, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/',        icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users',   icon: Users,           label: 'Users' },
  { to: '/reports', icon: FileText,        label: 'Reports' },
]

export default function Layout({ secret, onLogout, children }) {
  const location = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(mainRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' })
  }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080B14' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col shrink-0"
        style={{
          width: 220,
          background: '#0D1322',
          borderRight: '1px solid #1E2D45',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6" style={{ borderBottom: '1px solid #1E2D45' }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: 'linear-gradient(135deg, #4F8CFF20, #8B5CF620)',
              border: '1px solid #4F8CFF30',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Layers size={16} color="#4F8CFF" />
          </div>
          <div>
            <div className="text-ink font-semibold text-sm tracking-wide">Kompete</div>
            <div style={{ fontSize: 10, fontFamily: 'Fira Code, monospace', color: '#64748B', letterSpacing: '0.06em' }}>
              ADMIN
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group ${
                  isActive ? 'text-ink' : 'text-muted hover:text-ink'
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'linear-gradient(135deg, #4F8CFF15, #8B5CF610)' : 'transparent',
                border: isActive ? '1px solid #4F8CFF20' : '1px solid transparent',
              })}
            >
              <Icon size={16} className="shrink-0" />
              {label}
              {location.pathname === to && (
                <ChevronRight size={12} className="ml-auto text-primary opacity-60" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5" style={{ borderTop: '1px solid #1E2D45', paddingTop: 12 }}>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-red-400 transition-all duration-200 cursor-pointer"
            style={{ border: '1px solid transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#EF444410'; e.currentTarget.style.borderColor = '#EF444420' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="shrink-0 flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #1E2D45', background: '#0D1322' }}
        >
          <div>
            <h2 className="text-ink font-semibold text-base">
              {navItems.find(n => n.to === location.pathname)?.label ?? 'Dashboard'}
            </h2>
            <p className="text-muted text-xs mt-0.5" style={{ fontFamily: 'Fira Code, monospace' }}>
              {location.pathname === '/' ? 'Platform overview' : location.pathname.slice(1)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="badge"
              style={{ background: '#10B98115', color: '#10B981', border: '1px solid #10B98125' }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', marginRight: 5, display: 'inline-block', animation: 'pulse 2s infinite' }} />
              LIVE
            </span>
          </div>
        </header>

        {/* Page content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
