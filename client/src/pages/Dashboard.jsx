import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/authContext'
import { tripAPI, cityAPI } from '../api/api'

/* ── Icons ───────────────────────────────────────────────────── */
const Icons = {
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Map: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  ),
  Wallet: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
      <path d="M16 3H8L4 7h16l-4-4z"/>
      <circle cx="17" cy="14" r="1" fill="currentColor"/>
    </svg>
  ),
  Plane: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2A1 1 0 0 0 3.9 7l3.5 3.5L3 14l1.5 1.5 4-1.5 1 4L11 19.5l.5-4 4 4 1.3-1.3z"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Star: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Checklist: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <polyline points="3 6 4 7 6 5"/><polyline points="3 12 4 13 6 11"/><polyline points="3 18 4 19 6 17"/>
    </svg>
  ),
}

/* ── Helpers ─────────────────────────────────────────────────── */
function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
  return diff
}

function tripDuration(start, end) {
  const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24))
  return `${diff} day${diff !== 1 ? 's' : ''}`
}

function statusColor(status) {
  return {
    planning:  { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
    ongoing:   { bg: 'rgba(45,212,191,0.12)',  color: '#2dd4bf', border: 'rgba(45,212,191,0.3)' },
    completed: { bg: 'rgba(134,239,172,0.12)', color: '#86efac', border: 'rgba(134,239,172,0.3)' },
  }[status] || {}
}

function totalBudget(trips) {
  return trips.reduce((s, t) => s + Number(t.total_budget || 0), 0)
}

/* ── Stat Card ───────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="card" style={{ padding: '1.375rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
      <div style={{
        width: '44px', height: '44px', flexShrink: 0, borderRadius: 'var(--radius-md)',
        background: accent || 'rgba(255,107,69,0.12)',
        border: `1px solid ${accent ? accent.replace('0.12', '0.3') : 'rgba(255,107,69,0.25)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent ? accent.replace('rgba(', '').split(',')[0] === '255' ? 'var(--color-coral-400)'
          : accent.includes('45') ? 'var(--color-teal-400)' : 'var(--color-amber-400)'
          : 'var(--color-coral-400)',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.25rem' }}>
          {label}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{sub}</div>}
      </div>
    </div>
  )
}

/* ── Upcoming Trip Row ───────────────────────────────────────── */
function UpcomingTripCard({ trip }) {
  const navigate = useNavigate()
  const sc = statusColor(trip.status)
  const cities = [...new Set(trip.Stops?.map(s => s.City?.name).filter(Boolean) || [])]
  const days = daysUntil(trip.start_date)
  const coverBg = trip.cover_photo
    ? `url(${trip.cover_photo}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--color-navy-700), var(--color-navy-600))'

  return (
    <div
      className="card"
      onClick={() => navigate(`/trips/${trip.id}`)}
      style={{ display: 'flex', gap: '1rem', padding: '1rem 1.125rem', cursor: 'pointer', alignItems: 'center' }}
    >
      {/* Cover thumb */}
      <div style={{
        width: '72px', height: '72px', flexShrink: 0,
        borderRadius: 'var(--radius-md)', background: coverBg,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,13,31,0.3)' }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '0.9375rem', color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{trip.title}</h3>
          <span style={{
            padding: '0.15rem 0.5rem', borderRadius: '9999px',
            fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
            background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
            textTransform: 'capitalize',
          }}>{trip.status}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
          <Icons.Calendar />
          {fmtDate(trip.start_date)} · {tripDuration(trip.start_date, trip.end_date)}
        </div>

        {cities.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Icons.MapPin />
            {cities.slice(0, 3).join(' · ')}{cities.length > 3 && ` +${cities.length - 3}`}
          </div>
        )}
      </div>

      {/* Countdown */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        {days > 0 ? (
          <>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-coral-400)', lineHeight: 1 }}>{days}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>days away</div>
          </>
        ) : days === 0 ? (
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-teal-400)' }}>Today!</span>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Past</span>
        )}
        <div style={{ marginTop: '0.5rem' }}>
          <Icons.ArrowRight />
        </div>
      </div>
    </div>
  )
}

/* ── Destination Card ────────────────────────────────────────── */
function DestinationCard({ city }) {
  const navigate = useNavigate()
  const coverBg = city.image_url
    ? `url(${city.image_url}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--color-navy-700), var(--color-navy-800))'

  return (
    <div
      className="card"
      onClick={() => navigate(`/activities?city_id=${city.id}`)}
      style={{ overflow: 'hidden', cursor: 'pointer' }}
    >
      {/* Image */}
      <div style={{ height: '140px', background: coverBg, position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(6,13,31,0.75) 0%, transparent 55%)',
        }} />
        {city.popularity_score && (
          <div style={{
            position: 'absolute', top: '0.625rem', right: '0.625rem',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.2rem 0.5rem',
            background: 'rgba(251,191,36,0.2)', color: '#fbbf24',
            border: '1px solid rgba(251,191,36,0.35)',
            borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700,
            backdropFilter: 'blur(6px)',
          }}>
            <Icons.Star /> {Number(city.popularity_score).toFixed(1)}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: '0.625rem', left: '0.75rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: '#fff' }}>{city.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}>{city.country}</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '0.625rem 0.875rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
          {city.cost_index
            ? `Cost index: ${Number(city.cost_index).toFixed(1)}/10`
            : city.region || '—'}
        </div>
        <span style={{ color: 'var(--color-coral-500)', display: 'flex', alignItems: 'center' }}>
          <Icons.ArrowRight />
        </span>
      </div>
    </div>
  )
}

/* ── Quick Action Button ─────────────────────────────────────── */
function QuickAction({ icon, label, desc, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      className="card"
      style={{
        width: '100%', textAlign: 'left', padding: '1rem 1.125rem',
        display: 'flex', alignItems: 'center', gap: '0.875rem',
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        cursor: 'pointer', borderRadius: 'var(--radius-lg)',
      }}
    >
      <div style={{
        width: '40px', height: '40px', flexShrink: 0, borderRadius: 'var(--radius-md)',
        background: accent || 'rgba(255,107,69,0.12)',
        border: `1px solid rgba(255,255,255,0.08)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-coral-400)',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{desc}</div>
      </div>
      <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}><Icons.ArrowRight /></span>
    </button>
  )
}

/* ── Skeleton helpers ────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '1rem 1.125rem', alignItems: 'center' }}>
      <div className="skeleton" style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="skeleton" style={{ height: '14px', width: '55%' }} />
        <div className="skeleton" style={{ height: '12px', width: '40%' }} />
        <div className="skeleton" style={{ height: '12px', width: '35%' }} />
      </div>
    </div>
  )
}

function SkeletonDestCard() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: '140px', borderRadius: 0 }} />
      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div className="skeleton" style={{ height: '12px', width: '50%' }} />
      </div>
    </div>
  )
}

/* ── Main Dashboard ──────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripAPI.list().then(r => r.data),
  })

  const { data: cities = [], isLoading: citiesLoading } = useQuery({
    queryKey: ['cities', 'popular'],
    queryFn: () => cityAPI.list({ sort: 'popular' }).then(r => r.data),
    staleTime: 1000 * 60 * 10,
  })

  const upcomingTrips = trips
    .filter(t => t.status !== 'completed')
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 4)

  const completedCount = trips.filter(t => t.status === 'completed').length
  const ongoingTrip   = trips.find(t => t.status === 'ongoing')
  const budget        = totalBudget(trips)
  const topCities     = cities.slice(0, 6)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0] || 'Traveler'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ── Hero / Greeting ─────────────────────────────────── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--color-navy-900) 0%, var(--color-navy-800) 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '2.5rem 0 3rem',
      }}>
        {/* Mesh blobs */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 60% 80% at 80% 20%, rgba(255,107,69,0.1) 0%, transparent 65%),
            radial-gradient(ellipse 40% 60% at 10% 80%, rgba(45,212,191,0.07) 0%, transparent 65%)
          `,
        }} />

        <div className="page-container" style={{ padding: '0 1.5rem', position: 'relative' }}>
          {/* Greeting */}
          <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              {greeting},
            </p>
            <h1 className="text-display" style={{ marginBottom: '0.5rem' }}>
              {firstName} <span className="text-gradient">✦</span>
            </h1>
            {ongoingTrip ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                You're currently on{' '}
                <span
                  onClick={() => navigate(`/trips/${ongoingTrip.id}`)}
                  style={{ color: 'var(--color-coral-400)', fontWeight: 600, cursor: 'pointer' }}
                >
                  {ongoingTrip.title}
                </span>
                . Have a great trip!
              </p>
            ) : upcomingTrips.length > 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                Your next adventure is{' '}
                <span style={{ color: 'var(--color-coral-400)', fontWeight: 600 }}>
                  {daysUntil(upcomingTrips[0]?.start_date)} days away
                </span>
                . Keep planning!
              </p>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                Ready to plan your next adventure?
              </p>
            )}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/trips/new')}>
              <Icons.Plus /> Plan New Trip
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/trips')}>
              View All Trips
            </button>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ padding: '2rem 1.5rem' }}>

        {/* ── Stat cards ──────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem', marginBottom: '2.5rem',
        }}>
          <StatCard
            icon={<Icons.Map />} label="Total Trips" value={trips.length}
            sub={`${completedCount} completed`}
          />
          <StatCard
            icon={<Icons.Plane />} label="Upcoming" value={upcomingTrips.length}
            sub="trips planned" accent="rgba(45,212,191,0.12)"
          />
          <StatCard
            icon={<Icons.Wallet />} label="Total Budget" value={budget > 0 ? `$${budget.toLocaleString()}` : '—'}
            sub="across all trips" accent="rgba(251,191,36,0.12)"
          />
          <StatCard
            icon={<Icons.Checklist />} label="Completed" value={completedCount}
            sub="adventures done" accent="rgba(134,239,172,0.1)"
          />
        </div>

        {/* ── Main 2-col grid ─────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 280px',
          gap: '2rem', alignItems: 'start',
        }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ── Upcoming Trips ─────────────────────────── */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 className="text-title">Upcoming Trips</h2>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate('/trips')}
                  style={{ gap: '0.25rem', fontSize: '0.8125rem' }}
                >
                  View all <Icons.ArrowRight />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tripsLoading ? (
                  [0,1,2].map(i => (
                    <div key={i} className="card" style={{ overflow: 'hidden' }}>
                      <SkeletonRow />
                    </div>
                  ))
                ) : upcomingTrips.length === 0 ? (
                  <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      No upcoming trips yet. Start planning!
                    </p>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/trips/new')}>
                      <Icons.Plus /> Plan a trip
                    </button>
                  </div>
                ) : (
                  upcomingTrips.map(t => <UpcomingTripCard key={t.id} trip={t} />)
                )}
              </div>
            </section>

            {/* ── Recommended Destinations ─────────────────── */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 className="text-title">Popular Destinations</h2>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate('/activities')}
                  style={{ gap: '0.25rem', fontSize: '0.8125rem' }}
                >
                  Explore <Icons.ArrowRight />
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem',
              }}>
                {citiesLoading
                  ? [0,1,2,3,4,5].map(i => <SkeletonDestCard key={i} />)
                  : topCities.map(c => <DestinationCard key={c.id} city={c} />)
                }
              </div>
            </section>
          </div>

          {/* Right column: Quick actions */}
          <div style={{ position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2 className="text-title" style={{ marginBottom: '0.25rem' }}>Quick Actions</h2>

            <QuickAction
              icon={<Icons.Plus />}
              label="Plan New Trip"
              desc="Start a fresh itinerary"
              onClick={() => navigate('/trips/new')}
            />
            <QuickAction
              icon={<Icons.Map />}
              label="My Trips"
              desc="Manage all your trips"
              onClick={() => navigate('/trips')}
              accent="rgba(45,212,191,0.1)"
            />
            <QuickAction
              icon={<Icons.Plane />}
              label="Explore Activities"
              desc="Find things to do"
              onClick={() => navigate('/activities')}
              accent="rgba(251,191,36,0.1)"
            />
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 860px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
