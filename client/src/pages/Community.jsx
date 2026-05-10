import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { communityAPI } from '../api/api'

const STATUS_OPTS = ['', 'planning', 'ongoing', 'completed']

const STATUS_STYLE = {
  planning:  { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24', label: 'Planning' },
  ongoing:   { bg: 'rgba(45,212,191,0.15)',  color: '#2dd4bf', label: 'Ongoing' },
  completed: { bg: 'rgba(134,239,172,0.15)', color: '#86efac', label: 'Completed' },
}

const Icons = {
  Heart:  (filled) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  MapPin: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Calendar: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Globe: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
}

function fmtDate(d) {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function TripCard({ trip, onLike }) {
  const navigate = useNavigate()
  const ss = STATUS_STYLE[trip.status] || STATUS_STYLE.planning
  const uniqueCities = [...new Set(trip.stops.map(s => s.city).filter(Boolean))]
  const totalDays = trip.start_date && trip.end_date
    ? Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000)
    : null

  const initials = (trip.author?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.35)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '' }}
    >
      {/* Cover photo */}
      <div
        onClick={() => trip.share_token && navigate(`/share/${trip.share_token}`)}
        style={{
          height: '160px', position: 'relative', flexShrink: 0,
          background: trip.cover_photo
            ? `url(${trip.cover_photo}) center/cover no-repeat`
            : 'linear-gradient(135deg, var(--color-navy-800), var(--color-navy-700))',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(6,13,31,0.7))' }} />

        {/* Status badge */}
        <span style={{
          position: 'absolute', top: '0.625rem', left: '0.625rem',
          padding: '0.2rem 0.625rem', borderRadius: '9999px',
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize',
          background: ss.bg, color: ss.color, backdropFilter: 'blur(8px)',
          border: `1px solid ${ss.color}44`,
        }}>
          {ss.label}
        </span>

        {/* Duration badge */}
        {totalDays && (
          <span style={{
            position: 'absolute', top: '0.625rem', right: '0.625rem',
            padding: '0.2rem 0.625rem', borderRadius: '9999px',
            fontSize: '0.7rem', fontWeight: 600,
            background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
          }}>
            {totalDays}d
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {trip.author?.avatar_url ? (
            <img src={trip.author.avatar_url} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
          )}
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {trip.author?.name}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Icons.Calendar />{fmtDate(trip.start_date)}
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => trip.share_token && navigate(`/share/${trip.share_token}`)}
          style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
        >
          {trip.title}
        </h3>

        {/* Cities */}
        {uniqueCities.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--color-coral-400)' }}><Icons.MapPin /></span>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {uniqueCities.slice(0, 3).join(' · ')}{uniqueCities.length > 3 ? ` +${uniqueCities.length - 3}` : ''}
            </span>
          </div>
        )}

        {/* Description */}
        {trip.description && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: 0 }}>
            {trip.description}
          </p>
        )}

        {/* Footer: like + view */}
        <div style={{ marginTop: 'auto', paddingTop: '0.625rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onLike(trip.id) }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: trip.liked_by_me ? '#f472b6' : 'var(--text-muted)',
              fontSize: '0.8125rem', fontWeight: 500,
              transition: 'color 0.15s, transform 0.15s',
              padding: '0.25rem 0',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#f472b6'}
            onMouseLeave={e => e.currentTarget.style.color = trip.liked_by_me ? '#f472b6' : 'var(--text-muted)'}
          >
            {Icons.Heart(trip.liked_by_me)}
            {trip.like_count > 0 ? trip.like_count : 'Like'}
          </button>

          {trip.share_token && (
            <button
              onClick={() => navigate(`/share/${trip.share_token}`)}
              style={{
                fontSize: '0.775rem', color: 'var(--color-coral-400)', fontWeight: 600,
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.25rem',
              }}
            >
              <Icons.Globe /> View trip
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Community() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['community-feed', search, status],
    queryFn: () => communityAPI.feed({ search: search || undefined, status: status || undefined, limit: 24 }).then(r => r.data),
    staleTime: 30000,
    keepPreviousData: true,
  })

  const likeMut = useMutation({
    mutationFn: (tripId) => communityAPI.toggleLike(tripId),
    onMutate: async (tripId) => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: ['community-feed', search, status] })
      const prev = qc.getQueryData(['community-feed', search, status])
      qc.setQueryData(['community-feed', search, status], old => ({
        ...old,
        trips: old.trips.map(t =>
          t.id === tripId
            ? { ...t, liked_by_me: !t.liked_by_me, like_count: t.like_count + (t.liked_by_me ? -1 : 1) }
            : t
        ),
      }))
      return { prev }
    },
    onError: (_, __, ctx) => qc.setQueryData(['community-feed', search, status], ctx.prev),
  })

  const trips = data?.trips || []
  const total = data?.total || 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ── Hero banner ──────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15,22,41,0.95) 0%, rgba(30,40,70,0.95) 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-40px', left: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,107,69,0.06)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', right: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(45,212,191,0.06)', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Community Trips
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
            Discover itineraries shared by fellow travellers around the world
          </p>

          {/* Search bar */}
          <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}><Icons.Search /></span>
            <input
              className="input"
              style={{ paddingLeft: '2.75rem', fontSize: '0.9375rem', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 'var(--radius-lg)' }}
              placeholder="Search trips by title…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setSearch('') }} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}>✕</button>
            )}
          </div>
        </div>
      </div>

      <div className="page-container" style={{ padding: '1.5rem' }}>
        {/* ── Filters + count ──────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {STATUS_OPTS.map(s => (
              <button key={s || 'all'} onClick={() => setStatus(s)} className="btn btn-sm" style={{
                borderRadius: '9999px', textTransform: 'capitalize',
                background: status === s ? 'var(--gradient-accent)' : 'rgba(255,255,255,0.05)',
                color: status === s ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${status === s ? 'transparent' : 'var(--border-subtle)'}`,
              }}>
                {s || 'All'}
              </button>
            ))}
          </div>

          <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {isFetching ? 'Loading…' : `${total} public trip${total !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* ── Trip grid ─────────────────────────────────────── */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {[...Array(12)].map((_, i) => <div key={i} className="card skeleton" style={{ height: '320px' }} />)}
          </div>
        ) : trips.length === 0 ? (
          <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1rem' }}>
              {search ? `No public trips matching "${search}".` : 'No public trips yet. Be the first to share one!'}
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/trips/new')}>Create a Trip</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', alignItems: 'start' }}>
            {trips.map(trip => (
              <TripCard key={trip.id} trip={trip} onLike={(id) => likeMut.mutate(id)} />
            ))}
          </div>
        )}

        {/* ── Prompt to share ──────────────────────────────── */}
        {!isLoading && trips.length > 0 && (
          <div style={{ marginTop: '2.5rem', padding: '1.75rem', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(255,107,69,0.08), rgba(45,212,191,0.06))', border: '1px solid rgba(255,107,69,0.18)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>Want your trip to appear here? Make it public in Create Trip settings.</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/trips/new')}>Share your itinerary</button>
          </div>
        )}
      </div>
    </div>
  )
}
