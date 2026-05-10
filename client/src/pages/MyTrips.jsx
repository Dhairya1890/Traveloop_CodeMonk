import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { tripAPI } from '../api/api'
import { useAuth } from '../context/authContext'

/* ── Helpers ─────────────────────────────────────────────────── */
function formatDateRange(start, end) {
  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${fmt(start)} — ${fmt(end)}`
}

function tripDuration(start, end) {
  const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24))
  return `${diff} day${diff !== 1 ? 's' : ''}`
}

function statusColor(status) {
  return {
    planning:  { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
    ongoing:   { bg: 'rgba(45,212,191,0.12)', color: '#2dd4bf', border: 'rgba(45,212,191,0.3)' },
    completed: { bg: 'rgba(134,239,172,0.12)', color: '#86efac', border: 'rgba(134,239,172,0.3)' },
  }[status] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: 'rgba(255,255,255,0.1)' }
}

/* ── SVG Icons ───────────────────────────────────────────────── */
const Icons = {
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Globe: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Trash: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  ),
  Edit: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Luggage: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="7" width="12" height="14" rx="2"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/>
      <line x1="12" y1="12" x2="12" y2="15"/><line x1="6" y1="11" x2="18" y2="11"/>
    </svg>
  ),
}

/* ── Skeleton card ───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: '160px', borderRadius: '0' }} />
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="skeleton" style={{ height: '20px', width: '70%' }} />
        <div className="skeleton" style={{ height: '14px', width: '50%' }} />
        <div className="skeleton" style={{ height: '14px', width: '40%' }} />
      </div>
    </div>
  )
}

/* ── Delete confirm modal ────────────────────────────────────── */
function DeleteModal({ trip, onConfirm, onCancel, loading }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
    }}>
      <div className="auth-card animate-scale-in" style={{ padding: '2rem', maxWidth: '400px', width: '90%' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
          Delete trip?
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>"{trip.title}"</strong> and all its stops, activities, notes, and budget items will be permanently deleted.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn"
            style={{ flex: 1, background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none' }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <><div className="spinner" /> Deleting…</> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Trip Card ───────────────────────────────────────────────── */
function TripCard({ trip, onDelete }) {
  const navigate = useNavigate()
  const sc = statusColor(trip.status)
  const cities = trip.Stops?.map(s => s.City?.name).filter(Boolean) || []
  const uniqueCities = [...new Set(cities)]
  const coverBg = trip.cover_photo
    ? `url(${trip.cover_photo})`
    : `linear-gradient(135deg, var(--color-navy-700) 0%, var(--color-navy-800) 100%)`

  return (
    <article
      className="card"
      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
      onClick={() => navigate(`/trips/${trip.id}`)}
    >
      {/* Cover */}
      <div style={{
        height: '160px', flexShrink: 0, position: 'relative',
        background: coverBg,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        {/* Gradient scrim */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(6,13,31,0.7) 0%, transparent 60%)',
        }} />

        {/* Status badge */}
        <div style={{
          position: 'absolute', top: '0.75rem', left: '0.75rem',
          padding: '0.25rem 0.625rem',
          background: sc.bg, color: sc.color,
          border: `1px solid ${sc.border}`,
          borderRadius: '9999px',
          fontSize: '0.7rem', fontWeight: 700,
          fontFamily: 'var(--font-display)',
          textTransform: 'capitalize',
          backdropFilter: 'blur(8px)',
        }}>
          {trip.status}
        </div>

        {/* Public badge */}
        {trip.is_public && (
          <div style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            background: 'rgba(45,212,191,0.15)', color: 'var(--color-teal-400)',
            border: '1px solid rgba(45,212,191,0.3)',
            borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
            backdropFilter: 'blur(8px)',
          }}>
            <Icons.Globe /> Public
          </div>
        )}

        {/* Duration on cover */}
        <div style={{
          position: 'absolute', bottom: '0.75rem', left: '0.75rem',
          fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)',
        }}>
          {tripDuration(trip.start_date, trip.end_date)}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.125rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '1rem', color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {trip.title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          <Icons.Calendar />
          {formatDateRange(trip.start_date, trip.end_date)}
        </div>

        {uniqueCities.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
            <Icons.MapPin />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {uniqueCities.slice(0, 3).join(' · ')}
              {uniqueCities.length > 3 && ` +${uniqueCities.length - 3}`}
            </span>
          </div>
        )}

        {trip.total_budget > 0 && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Budget: <span style={{ color: 'var(--color-amber-400)', fontWeight: 600 }}>
              ${Number(trip.total_budget).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '0.625rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {trip.Stops?.length || 0} stop{trip.Stops?.length !== 1 ? 's' : ''}
        </span>

        <div style={{ display: 'flex', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
          <button
            title="Edit trip"
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)' }}
            onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}`) }}
          >
            <Icons.Edit />
          </button>
          <button
            title="Delete trip"
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)', color: '#f87171' }}
            onClick={(e) => { e.stopPropagation(); onDelete(trip) }}
          >
            <Icons.Trash />
          </button>
        </div>
      </div>
    </article>
  )
}

/* ── Empty state ─────────────────────────────────────────────── */
function EmptyState({ filtered }) {
  const navigate = useNavigate()
  return (
    <div style={{
      gridColumn: '1 / -1',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '5rem 2rem', gap: '1rem', textAlign: 'center',
    }}>
      <div style={{ color: 'var(--text-muted)', opacity: 0.5 }}><Icons.Luggage /></div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
        {filtered ? 'No trips match your search' : 'No trips yet'}
      </h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.6 }}>
        {filtered
          ? 'Try a different search term or filter.'
          : 'Start planning your first adventure and make memories that last a lifetime.'}
      </p>
      {!filtered && (
        <button className="btn btn-primary" onClick={() => navigate('/trips/new')} style={{ marginTop: '0.5rem' }}>
          <Icons.Plus /> Plan your first trip
        </button>
      )}
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────────── */
const STATUS_FILTERS = ['all', 'planning', 'ongoing', 'completed']

export default function MyTrips() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('all')
  const [toDelete, setToDelete]     = useState(null)

  const { data: trips = [], isLoading, isError } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripAPI.list().then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => tripAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      setToDelete(null)
    },
  })

  const filtered = trips.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ── Header bar ──────────────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(15,22,41,0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div className="page-container" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem', gap: '1rem',
        }}>
          <div>
            <h1 className="text-headline" style={{ marginBottom: '0.1rem' }}>My Trips</h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {user?.name ? `${user.name}'s adventures` : 'Your adventures'}
              {!isLoading && ` · ${trips.length} trip${trips.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            id="new-trip-btn"
            className="btn btn-primary"
            onClick={() => navigate('/trips/new')}
          >
            <Icons.Plus /> New Trip
          </button>
        </div>
      </div>

      <div className="page-container" style={{ padding: '1.5rem' }}>
        {/* ── Filters row ─────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '0.75rem', marginBottom: '1.75rem',
          flexWrap: 'wrap', alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '320px' }}>
            <span style={{
              position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }}>
              <Icons.Search />
            </span>
            <input
              id="trips-search"
              type="text"
              placeholder="Search trips…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Status filter pills */}
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                id={`filter-${s}`}
                onClick={() => setStatus(s)}
                className="btn btn-sm"
                style={{
                  borderRadius: '9999px',
                  background: statusFilter === s ? 'var(--gradient-accent)' : 'rgba(255,255,255,0.05)',
                  color: statusFilter === s ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${statusFilter === s ? 'transparent' : 'var(--border-subtle)'}`,
                  textTransform: 'capitalize',
                  boxShadow: statusFilter === s ? '0 4px 12px rgba(255,107,69,0.3)' : 'none',
                  transition: 'all 0.2s var(--ease-out)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ───────────────────────────────────────── */}
        {isError ? (
          <div style={{
            padding: '3rem', textAlign: 'center',
            color: '#f87171', fontSize: '0.9rem',
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-lg)',
          }}>
            Failed to load trips. Make sure the server is running.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : filtered.length === 0
                ? <EmptyState filtered={search !== '' || statusFilter !== 'all'} />
                : filtered.map(trip => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onDelete={setToDelete}
                    />
                  ))
            }
          </div>
        )}
      </div>

      {/* ── Delete modal ─────────────────────────────────── */}
      {toDelete && (
        <DeleteModal
          trip={toDelete}
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(toDelete.id)}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
