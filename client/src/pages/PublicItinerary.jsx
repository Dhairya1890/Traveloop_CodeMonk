import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { tripAPI } from '../api/api'
import { useAuth } from '../context/authContext'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function stopDays(a, b) {
  return Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000))
}

const STATUS_STYLE = {
  planning:  { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  ongoing:   { bg: 'rgba(45,212,191,0.15)',  color: '#2dd4bf' },
  completed: { bg: 'rgba(134,239,172,0.15)', color: '#86efac' },
}

export default function PublicItinerary() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [copyMsg, setCopyMsg] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const pageUrl = window.location.href

  const { data: trip, isLoading, isError } = useQuery({
    queryKey: ['public-trip', token],
    queryFn: () => tripAPI.getPublic(token).then(r => r.data),
    retry: false,
  })

  const copyMut = useMutation({
    mutationFn: () => tripAPI.copyTrip(token),
    onSuccess: (res) => {
      setCopyMsg('Trip copied! Redirecting…')
      setTimeout(() => navigate(`/trips/${res.data.trip.id}`), 1500)
    },
    onError: (e) => setCopyMsg(e?.response?.data?.error || 'Failed to copy trip'),
  })

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleShare = (platform) => {
    const text = `Check out this travel itinerary: "${trip?.title}"`
    const urls = {
      twitter:  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + pageUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(text)}`,
    }
    window.open(urls[platform], '_blank', 'noopener,noreferrer')
    setShareOpen(false)
  }

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: trip?.title, text: `Check out this trip: ${trip?.title}`, url: pageUrl })
    } else {
      setShareOpen(p => !p)
    }
  }

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div className="spinner" style={{ width: '2rem', height: '2rem' }} />
    </div>
  )

  if (isError || !trip) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', background: 'var(--bg-base)' }}>
      <div style={{ fontSize: '3rem' }}>🔒</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>Trip not found</h2>
      <p style={{ color: 'var(--text-muted)' }}>This itinerary is private or the link has expired.</p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
    </div>
  )

  const sc = STATUS_STYLE[trip.status] || STATUS_STYLE.planning
  const stops = trip.Stops || []
  const totalDays = Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000)
  const totalActivities = stops.reduce((s, st) => s + (st.Activities?.length || 0), 0)
  const initials = (trip.User?.name || 'T').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav style={{ background: 'rgba(6,13,31,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--border-subtle)', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2A1 1 0 0 0 3.9 7l3.5 3.5L3 14l1.5 1.5 4-1.5 1 4L11 19.5l.5-4 4 4 1.3-1.3z"/></svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>Traveloop</span>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          {/* Share button */}
          <div style={{ position: 'relative' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleNativeShare} style={{ gap: '0.375rem' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share
            </button>
            {shareOpen && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)', overflow: 'hidden', width: '200px', zIndex: 50, animation: 'scale-in 0.12s ease' }}>
                {[
                  { id: 'twitter',  label: '𝕏 Twitter / X' },
                  { id: 'whatsapp', label: '💬 WhatsApp' },
                  { id: 'telegram', label: '✈️ Telegram' },
                ].map(s => (
                  <button key={s.id} onClick={() => handleShare(s.id)} style={{ width: '100%', display: 'block', padding: '0.625rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'left', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    {s.label}
                  </button>
                ))}
                <div style={{ height: '1px', background: 'var(--border-subtle)' }} />
                <button onClick={() => { handleCopyLink(); setShareOpen(false) }} style={{ width: '100%', display: 'block', padding: '0.625rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'left' }}>
                  🔗 {linkCopied ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            )}
          </div>
          {isAuthenticated
            ? <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>Dashboard</button>
            : <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')}>Sign up free</button>}
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: '300px', overflow: 'hidden', background: trip.cover_photo ? `url(${trip.cover_photo}) center/cover no-repeat` : 'linear-gradient(135deg, var(--color-navy-800), var(--color-navy-700))' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,13,31,0.1), rgba(6,13,31,0.85))' }} />
        <div style={{ position: 'relative', height: '100%', maxWidth: '960px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize', background: sc.bg, color: sc.color, backdropFilter: 'blur(8px)' }}>{trip.status}</span>
            <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.7rem', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>Public Itinerary</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', color: '#fff', marginBottom: '0.5rem' }}>{trip.title}</h1>
          {trip.description && <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', maxWidth: '640px' }}>{trip.description}</p>}
          {/* Author */}
          {trip.User && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
              {trip.User.avatar_url
                ? <img src={trip.User.avatar_url} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                : <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>{initials}</div>}
              <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)' }}>by {trip.User.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats + action strip ──────────────────────────────── */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: '56px', zIndex: 10 }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Cities', value: stops.length },
            { label: 'Activities', value: totalActivities },
            { label: 'Duration', value: totalDays > 0 ? `${totalDays} days` : '—' },
            { label: 'Dates', value: `${fmtDate(trip.start_date).split(',')[0]} – ${fmtDate(trip.end_date).split(',')[0]}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
            {/* Copy link quick button */}
            <button onClick={handleCopyLink} className="btn btn-ghost btn-sm" style={{ gap: '0.375rem' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              {linkCopied ? 'Copied!' : 'Copy link'}
            </button>

            {/* Copy Trip button */}
            {isAuthenticated ? (
              <button className="btn btn-primary btn-sm" onClick={() => copyMut.mutate()} disabled={copyMut.isPending} style={{ gap: '0.375rem' }}>
                {copyMut.isPending ? <><div className="spinner" style={{ width: '12px', height: '12px' }} />Copying…</> : <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copy Trip
                </>}
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')} style={{ gap: '0.375rem' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy Trip
              </button>
            )}
          </div>
        </div>
        {copyMsg && (
          <div style={{ background: copyMsg.includes('opied') ? 'rgba(45,212,191,0.12)' : 'rgba(248,113,113,0.12)', borderTop: '1px solid var(--border-subtle)', padding: '0.5rem 1.5rem', fontSize: '0.8125rem', color: copyMsg.includes('opied') ? 'var(--color-teal-400)' : '#f87171', textAlign: 'center' }}>
            {copyMsg}
          </div>
        )}
      </div>

      {/* ── Public URL bar ────────────────────────────────────── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0.625rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{pageUrl}</span>
          <button onClick={handleCopyLink} style={{ background: 'none', border: 'none', cursor: 'pointer', color: linkCopied ? 'var(--color-teal-400)' : 'var(--text-muted)', fontSize: '0.75rem', flexShrink: 0, transition: 'color 0.2s' }}>
            {linkCopied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* ── Itinerary timeline ────────────────────────────────── */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          Itinerary
        </h2>

        {stops.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No stops added to this trip yet.</p>
          </div>
        ) : (
          <div style={{ paddingLeft: '0.5rem' }}>
            {stops.map((stop, i) => {
              const days = stopDays(stop.arrival_date, stop.departure_date)
              return (
                <div key={stop.id} style={{ display: 'flex', gap: '0', marginBottom: '1.25rem' }}>
                  <div style={{ width: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', zIndex: 1, boxShadow: '0 0 0 4px var(--bg-base)' }}>
                      {i + 1}
                    </div>
                    {i < stops.length - 1 && <div style={{ width: '2px', flex: 1, minHeight: '24px', background: 'linear-gradient(to bottom, rgba(255,107,69,0.4), rgba(255,107,69,0.1))' }} />}
                  </div>

                  <div className="card" style={{ flex: 1, padding: '1.125rem 1.25rem', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          {stop.City?.name}
                          {stop.City?.country && <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.375rem' }}>· {stop.City.country}</span>}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {fmtDate(stop.arrival_date)} → {fmtDate(stop.departure_date)}
                          <span style={{ color: 'var(--color-coral-400)', fontWeight: 600, marginLeft: '0.5rem' }}>{days} day{days !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    {stop.notes && <p style={{ marginTop: '0.625rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{stop.notes}</p>}
                    {stop.Activities?.length > 0 && (
                      <div style={{ marginTop: '0.875rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {stop.Activities.map(a => (
                          <span key={a.id} style={{ padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                            {a.name}
                            {Number(a.cost) > 0 && <span style={{ color: 'var(--color-teal-400)', marginLeft: '0.25rem' }}>${Number(a.cost).toFixed(0)}</span>}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── CTA ───────────────────────────────────────────── */}
        <div style={{ marginTop: '3rem', padding: '2rem', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(255,107,69,0.1), rgba(45,212,191,0.08))', border: '1px solid rgba(255,107,69,0.2)', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {isAuthenticated ? 'Inspired? Copy this trip!' : 'Plan your own adventure'}
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9375rem' }}>
            {isAuthenticated
              ? 'Add it to your trips and customize it with your own stops and budget.'
              : 'Create personalized itineraries, track budgets, and explore the world with Traveloop.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <>
                <button className="btn btn-primary" onClick={() => copyMut.mutate()} disabled={copyMut.isPending}>
                  {copyMut.isPending ? 'Copying…' : 'Copy this trip'}
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/trips/new')}>Create new trip</button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => navigate('/auth')}>Get started — it's free</button>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes scale-in { from { opacity:0; transform:scale(0.95) translateY(-4px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  )
}
