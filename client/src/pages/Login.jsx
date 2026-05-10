import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/authContext'
import { useNavigate } from 'react-router-dom'
import authPageImg from '../assets/authPageImg.avif'
import logoImg from '../assets/logo_1.png'

/* ── SVG Icons (inline, no external dep) ────────────────────── */
const Icon = {
  Eye: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  Mail: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Lock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Alert: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Check: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
}

/* ── Stat chip (no emojis) ───────────────────────────────────── */
function StatChip({ label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.5rem 0.875rem',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '9999px',
      backdropFilter: 'blur(8px)',
    }}>
      <div>
        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>{value}</div>
      </div>
    </div>
  )
}

/* ── Feature row (no emojis, uses SVG check) ─────────────────── */
function FeatureRow({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{
        width: '22px', height: '22px', flexShrink: 0,
        background: 'rgba(255,107,69,0.25)',
        border: '1px solid rgba(255,107,69,0.45)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-coral-400)',
      }}>
        <Icon.Check />
      </div>
      <span style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.8)' }}>{text}</span>
    </div>
  )
}

/* ── Main Auth Page ──────────────────────────────────────────── */
export default function Auth() {
  const [tab, setTab] = useState('login')
  const [showPwd, setShowPwd] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const {
    register: rhfRegister,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({ mode: 'onBlur' })

  const switchTab = (t) => {
    setTab(t)
    setServerError('')
    reset()
    setShowPwd(false)
  }

  const onSubmit = async (data) => {
    setServerError('')
    setIsSubmitting(true)
    try {
      if (tab === 'login') {
        await login(data.email, data.password)
      } else {
        await register(data.name, data.email, data.password)
      }
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.message
               || err?.response?.data?.error
               || 'Something went wrong. Please try again.'
      setServerError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div id="auth-page" style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--bg-base)',
    }}>
      {/* ── Left panel: full-bleed image + overlay + content ── */}
      <div
        className="animate-fade-in"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          overflow: 'hidden',
          minHeight: '100vh',
        }}
      >
        {/* Background photo */}
        <img
          src={authPageImg}
          alt="Travel destination"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />

        {/* Dark gradient overlay — heavier at bottom so text is always readable */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            linear-gradient(
              to bottom,
              rgba(6,13,31,0.35) 0%,
              rgba(6,13,31,0.2)  35%,
              rgba(6,13,31,0.65) 65%,
              rgba(6,13,31,0.92) 100%
            )
          `,
        }} />

        {/* Top: Logo */}
        <div style={{
          position: 'absolute', top: '2rem', left: '2.5rem',
          zIndex: 2,
        }}>
          <img
            src={logoImg}
            alt="Traveloop"
            style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* Bottom: text content */}
        <div style={{
          position: 'relative', zIndex: 2,
          padding: '2.5rem',
        }}>
          <h1 className="text-hero animate-slide-up" style={{ marginBottom: '1rem', color: '#fff' }}>
            Plan trips that <span className="text-gradient">tell stories</span>
          </h1>

          <p className="animate-slide-up delay-100" style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.7,
            marginBottom: '1.75rem',
            maxWidth: '380px',
          }}>
            Design multi-city itineraries, discover local activities, track your budget, and share adventures — all in one place.
          </p>

          {/* Stats row */}
          <div className="animate-slide-up delay-200" style={{
            display: 'flex', gap: '0.625rem', flexWrap: 'wrap',
            marginBottom: '1.75rem',
          }}>
            <StatChip label="Cities" value="500+" />
            <StatChip label="Activities" value="2,000+" />
            <StatChip label="Trips planned" value="10K+" />
          </div>

          {/* Feature list */}
          <div className="animate-slide-up delay-300" style={{
            display: 'flex', flexDirection: 'column', gap: '0.625rem',
          }}>
            <FeatureRow text="Interactive itinerary builder" />
            <FeatureRow text="Auto budget tracking & breakdown" />
            <FeatureRow text="Share your trips publicly" />
            <FeatureRow text="Smart packing checklist" />
          </div>
        </div>
      </div>

      {/* ── Right panel (auth form) ────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--bg-base)',
      }}>
        <div className="auth-card animate-scale-in" style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem',
        }}>
          {/* Logo on the form panel (visible on mobile when left is hidden) */}
          <div id="auth-form-logo" style={{ display: 'none', marginBottom: '1.5rem' }}>
            <img src={logoImg} alt="Traveloop" style={{ height: '34px', width: 'auto' }} />
          </div>

          {/* ── Tabs ─────────────────────────────────────────── */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '9999px',
            padding: '0.25rem',
            marginBottom: '2rem',
          }}>
            {['login', 'signup'].map((t) => (
              <button
                key={t}
                id={`auth-tab-${t}`}
                onClick={() => switchTab(t)}
                className="btn"
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  background: tab === t ? 'var(--gradient-accent)' : 'transparent',
                  color: tab === t ? '#fff' : 'var(--text-secondary)',
                  boxShadow: tab === t ? '0 4px 16px rgba(255,107,69,0.3)' : 'none',
                  transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* ── Heading ─────────────────────────────────────── */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 className="text-headline" style={{ marginBottom: '0.375rem' }}>
              {tab === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {tab === 'login'
                ? 'Sign in to access your travel plans'
                : 'Start planning your next adventure'}
            </p>
          </div>

          {/* ── Form ────────────────────────────────────────── */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

            {/* Name (signup only) */}
            {tab === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-name">Full name</label>
                <div className="input-icon-wrap">
                  <span className="icon-left"><Icon.User /></span>
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="Alex Johnson"
                    autoComplete="name"
                    className={`input has-icon-left ${errors.name ? 'input-error' : ''}`}
                    {...rhfRegister('name', {
                      required: 'Name is required',
                      minLength: { value: 2, message: 'At least 2 characters' },
                    })}
                  />
                </div>
                {errors.name && (
                  <span className="form-error"><Icon.Alert />{errors.name.message}</span>
                )}
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">Email address</label>
              <div className="input-icon-wrap">
                <span className="icon-left"><Icon.Mail /></span>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="alex@example.com"
                  autoComplete="email"
                  className={`input has-icon-left ${errors.email ? 'input-error' : ''}`}
                  {...rhfRegister('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                  })}
                />
              </div>
              {errors.email && (
                <span className="form-error"><Icon.Alert />{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="auth-password">Password</label>
                {tab === 'login' && (
                  <button type="button" className="link-underline" style={{ fontSize: '0.8125rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="input-icon-wrap">
                <span className="icon-left"><Icon.Lock /></span>
                <input
                  id="auth-password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder={tab === 'signup' ? 'At least 6 characters' : '••••••••'}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  className={`input has-icon-left has-icon-right ${errors.password ? 'input-error' : ''}`}
                  {...rhfRegister('password', {
                    required: 'Password is required',
                    minLength: tab === 'signup'
                      ? { value: 6, message: 'At least 6 characters required' }
                      : undefined,
                  })}
                />
                <button
                  type="button"
                  className="icon-right"
                  onClick={() => setShowPwd((p) => !p)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)' }}
                >
                  {showPwd ? <Icon.EyeOff /> : <Icon.Eye />}
                </button>
              </div>
              {errors.password && (
                <span className="form-error"><Icon.Alert />{errors.password.message}</span>
              )}
            </div>

            {/* Confirm password (signup only) */}
            {tab === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-confirm">Confirm password</label>
                <div className="input-icon-wrap">
                  <span className="icon-left"><Icon.Lock /></span>
                  <input
                    id="auth-confirm"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    className={`input has-icon-left ${errors.confirm ? 'input-error' : ''}`}
                    {...rhfRegister('confirm', {
                      required: 'Please confirm your password',
                      validate: (v) => v === watch('password') || 'Passwords do not match',
                    })}
                  />
                </div>
                {errors.confirm && (
                  <span className="form-error"><Icon.Alert />{errors.confirm.message}</span>
                )}
              </div>
            )}

            {/* Server error */}
            {serverError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: '#f87171',
              }}>
                <Icon.Alert />
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.25rem' }}
            >
              {isSubmitting
                ? <><div className="spinner" /> {tab === 'login' ? 'Signing in…' : 'Creating account…'}</>
                : tab === 'login' ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>

          {/* ── Footer switch ────────────────────────────────── */}
          <p style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
          }}>
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              className="link-underline"
              onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
            >
              {tab === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          {/* Terms (signup) */}
          {tab === 'signup' && (
            <p style={{
              textAlign: 'center',
              marginTop: '1rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}>
              By signing up, you agree to our{' '}
              <span className="link-underline" style={{ cursor: 'pointer' }}>Terms of Service</span>
              {' '}and{' '}
              <span className="link-underline" style={{ cursor: 'pointer' }}>Privacy Policy</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Responsive ───────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          #auth-page { grid-template-columns: 1fr !important; }
          #auth-page > div:first-child { display: none !important; }
          #auth-form-logo { display: block !important; }
        }
      `}</style>
    </div>
  )
}
