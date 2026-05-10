import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'

const NAV_LINKS = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  },
  {
    to: '/trips', label: 'My Trips',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2A1 1 0 0 0 3.9 7l3.5 3.5L3 14l1.5 1.5 4-1.5 1 4L11 19.5l.5-4 4 4 1.3-1.3z"/></svg>,
  },
  {
    to: '/community', label: 'Community',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    to: '/activities', label: 'Explore',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(6,13,31,0.88)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border-subtle)',
      height: '56px',
      display: 'flex', alignItems: 'center',
    }}>
      <div className="page-container" style={{
        display: 'flex', alignItems: 'center', gap: '0.25rem',
        padding: '0 1.25rem', width: '100%',
      }}>
        {/* ── Logo ──────────────────────────────────────────── */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'none', border: 'none', cursor: 'pointer',
            marginRight: '1.5rem', flexShrink: 0,
          }}
        >
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'var(--gradient-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2A1 1 0 0 0 3.9 7l3.5 3.5L3 14l1.5 1.5 4-1.5 1 4L11 19.5l.5-4 4 4 1.3-1.3z"/>
            </svg>
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '1.0625rem', color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}>
            Traveloop
          </span>
        </button>

        {/* ── Nav links ─────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flex: 1 }}>
          {NAV_LINKS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                transition: 'all 0.15s',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
              })}
            >
              {icon} {label}
            </NavLink>
          ))}
        </div>

        {/* ── Plan Trip CTA ─────────────────────────────────── */}
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/trips/new')}
          style={{ marginRight: '0.75rem', gap: '0.375rem', flexShrink: 0 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Plan Trip
        </button>

        {/* ── Avatar / Profile dropdown ─────────────────────── */}
        <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen(p => !p)}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: user?.avatar_url ? 'transparent' : 'var(--gradient-accent)',
              border: menuOpen ? '2px solid var(--color-coral-500)' : '2px solid transparent',
              cursor: 'pointer', padding: 0, overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.2s',
              flexShrink: 0,
            }}
            title={user?.name}
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.style.display = 'none' }} />
            ) : (
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
                {initials}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: '220px', borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              overflow: 'hidden', zIndex: 50,
              animation: 'scale-in 0.12s ease',
            }}>
              {/* User info */}
              <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </div>
                {user?.role === 'admin' && (
                  <span style={{ display: 'inline-block', marginTop: '0.375rem', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, background: 'rgba(255,107,69,0.15)', color: 'var(--color-coral-400)', border: '1px solid rgba(255,107,69,0.3)' }}>
                    Admin
                  </span>
                )}
              </div>

              {/* Menu items */}
              <div style={{ padding: '0.375rem' }}>
                {[
                  { label: 'Profile & Settings', to: '/profile', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                  ...(user?.role === 'admin' ? [{ label: 'Admin Dashboard', to: '/admin', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }] : []),
                  { label: 'My Trips', to: '/trips', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2A1 1 0 0 0 3.9 7l3.5 3.5L3 14l1.5 1.5 4-1.5 1 4L11 19.5l.5-4 4 4 1.3-1.3z"/></svg> },
                ].map(({ label, to, icon }) => (
                  <button key={to} onClick={() => navigate(to)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'left',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                  >
                    {icon} {label}
                  </button>
                ))}

                <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.375rem 0' }} />

                <button onClick={logout} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#f87171', fontSize: '0.875rem', textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(-4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </nav>
  )
}
