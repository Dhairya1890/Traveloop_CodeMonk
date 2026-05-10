import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { tripAPI, stopAPI } from '../api/api'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function stopDays(a, b) {
  return Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000))
}

const statusStyle = {
  planning:  { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  ongoing:   { bg: 'rgba(45,212,191,0.15)',  color: '#2dd4bf' },
  completed: { bg: 'rgba(134,239,172,0.15)', color: '#86efac' },
}

export default function PublicItinerary() {
  const { token } = useParams()
  const navigate = useNavigate()

  const { data: trip, isLoading, isError } = useQuery({
    queryKey: ['public-trip', token],
    queryFn: () => tripAPI.getPublic(token).then(r => r.data),
    retry: false,
  })

  /* Fetch stops only if we have the trip id */
  const { data: stops = [] } = useQuery({
    queryKey: ['public-stops', trip?.id],
    queryFn: () => stopAPI.listByTrip(trip.id).then(r => r.data),
    enabled: !!trip?.id,
  })

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

  const sc = statusStyle[trip.status] || statusStyle.planning
  const totalDays = Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ── Branded nav ──────────────────────────────────────── */}
      <nav style={{ background: 'rgba(6,13,31,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2A1 1 0 0 0 3.9 7l3.5 3.5L3 14l1.5 1.5 4-1.5 1 4L11 19.5l.5-4 4 4 1.3-1.3z"/></svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>Traveloop</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')}>Sign up free</button>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', height: '280px', overflow: 'hidden',
        background: trip.cover_photo
          ? `url(${trip.cover_photo}) center/cover no-repeat`
          : 'linear-gradient(135deg, var(--color-navy-800), var(--color-navy-700))',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,13,31,0.2), rgba(6,13,31,0.8))' }} />
        <div style={{ position: 'relative', height: '100%', maxWidth: '960px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
            <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize', background: sc.bg, color: sc.color, backdropFilter: 'blur(8px)' }}>
              {trip.status}
            </span>
            <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.7rem', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
              Shared Itinerary
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', color: '#fff', marginBottom: '0.5rem' }}>
            {trip.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem' }}>
            {fmtDate(trip.start_date)} — {fmtDate(trip.end_date)}
            {totalDays > 0 && ` · ${totalDays} day${totalDays !== 1 ? 's' : ''}`}
          </p>
          {trip.description && (
            <p style={{ color: 'rgba(255,255,255,0.55)', marginTop: '0.375rem', fontSize: '0.875rem' }}>{trip.description}</p>
          )}
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────────────────── */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0.875rem 1.5rem', display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Cities', value: stops.length },
            { label: 'Activities', value: stops.reduce((s, st) => s + (st.Activities?.length || 0), 0) },
            { label: 'Duration', value: totalDays > 0 ? `${totalDays} days` : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Itinerary timeline ───────────────────────────────── */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          Trip Itinerary
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
                  {/* Timeline dot */}
                  <div style={{ width: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', zIndex: 1, boxShadow: '0 0 0 4px var(--bg-base)' }}>
                      {i + 1}
                    </div>
                    {i < stops.length - 1 && <div style={{ width: '2px', flex: 1, minHeight: '24px', background: 'linear-gradient(to bottom, rgba(255,107,69,0.4), rgba(255,107,69,0.1))' }} />}
                  </div>

                  {/* Stop card */}
                  <div className="card" style={{ flex: 1, padding: '1.125rem 1.25rem', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          {stop.City?.name}
                          {stop.City?.country && <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.375rem' }}>· {stop.City.country}</span>}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {fmtDate(stop.arrival_date)} → {fmtDate(stop.departure_date)}
                          <span style={{ color: 'var(--color-coral-400)', fontWeight: 600, marginLeft: '0.5rem' }}>
                            {days} day{days !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {stop.notes && (
                      <p style={{ marginTop: '0.625rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        {stop.notes}
                      </p>
                    )}

                    {/* Activities */}
                    {stop.Activities?.length > 0 && (
                      <div style={{ marginTop: '0.875rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {stop.Activities.map(a => (
                          <span key={a.id} style={{
                            padding: '0.25rem 0.625rem', borderRadius: '9999px',
                            fontSize: '0.75rem', fontWeight: 500,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                          }}>
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

        {/* ── CTA footer ──────────────────────────────────────── */}
        <div style={{ marginTop: '3rem', padding: '2rem', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(255,107,69,0.1), rgba(45,212,191,0.08))', border: '1px solid rgba(255,107,69,0.2)', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Plan your own adventure
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9375rem' }}>
            Create personalized itineraries, track budgets, and explore the world with Traveloop.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/auth')}>
            Get started — it's free
          </button>
        </div>
      </div>
    </div>
  )
}
