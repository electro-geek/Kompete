'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';

export default function Header() {
  const { user, signInWithGoogle, logout, isDemoMode } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      height: '58px',
      background: 'rgba(8,8,13,0.88)',
      backdropFilter: 'blur(18px) saturate(180%)',
      WebkitBackdropFilter: 'blur(18px) saturate(180%)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '0 24px', width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo size={30} />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isDemoMode && <span className="badge badge-amber">Demo</span>}

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '5px 10px 5px 6px', borderRadius: '10px',
                  background: 'transparent', border: '1px solid var(--border)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--elevated)';
                  e.currentTarget.style.borderColor = 'var(--accent-border)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoURL} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
                ) : (
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: '700', color: 'white',
                  }}>
                    {(user.displayName?.[0] || user.email?.[0] || '?').toUpperCase()}
                  </div>
                )}
                <span style={{
                  fontSize: '13px', color: 'var(--fg)', fontWeight: '500',
                  maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                  style={{ color: 'var(--fg-subtle)', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}
                >
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setDropdownOpen(false)} />
                  <div className="animate-fade-up" style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 20,
                    minWidth: '195px', borderRadius: '14px',
                    background: 'var(--elevated)', border: '1px solid var(--border)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                    overflow: 'hidden',
                  }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--fg)', margin: 0 }}>
                        {user.displayName || 'User'}
                      </p>
                      <p style={{ fontSize: '11.5px', color: 'var(--fg-subtle)', marginTop: '3px', marginBottom: 0 }}>
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      style={{
                        width: '100%', padding: '11px 16px', textAlign: 'left',
                        fontSize: '13px', color: '#f87171', background: 'none',
                        border: 'none', cursor: 'pointer', fontWeight: '500',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--red-bg)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '7px 16px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                border: 'none', color: 'white',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                letterSpacing: '-0.1px',
                boxShadow: '0 2px 14px rgba(99,102,241,0.38)',
                transition: 'opacity 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" fillOpacity="0.9" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" fillOpacity="0.9" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="white" fillOpacity="0.9" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="white" fillOpacity="0.9" />
              </svg>
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
