import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { cityAPI, activityAPI } from '../api/api'

const ACTIVITY_CATS = ['sightseeing', 'food', 'adventure', 'culture', 'shopping', 'nature', 'nightlife', 'other']

const CAT_COLORS = {
  sightseeing: '#a5b4fc', food: '#fb923c', adventure: '#f87171',
  culture: '#fbbf24', shopping: '#f472b6', nature: '#86efac',
  nightlife: '#2dd4bf', other: '#94a3b8',
}

const Icons = {
  Search:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  MapPin:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Clock:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Dollar:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Filter:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Globe:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  X:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
}

function ActivityCard({ activity }) {
  const dur = activity.duration_minutes
    ? (activity.duration_minutes >= 60
        ? `${Math.floor(activity.duration_minutes / 60)}h${activity.duration_minutes % 60 ? ` ${activity.duration_minutes % 60}m` : ''}`
        : `${activity.duration_minutes}m`)
    : null

  return (
    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '' }}
    >
      {/* Image or gradient header */}
      <div style={{
        height: '120px',
        background: activity.image_url
          ? `url(${activity.image_url}) center/cover no-repeat`
          : `linear-gradient(135deg, ${CAT_COLORS[activity.category] || '#94a3b8'}22, ${CAT_COLORS[activity.category] || '#94a3b8'}44)`,
        position: 'relative',
      }}>
        <span style={{
          position: 'absolute', top: '0.625rem', left: '0.625rem',
          padding: '0.2rem 0.6rem', borderRadius: '9999px',
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize',
          background: `${CAT_COLORS[activity.category] || '#94a3b8'}33`,
          color: CAT_COLORS[activity.category] || '#94a3b8',
          border: `1px solid ${CAT_COLORS[activity.category] || '#94a3b8'}55`,
          backdropFilter: 'blur(8px)',
        }}>
          {activity.category}
        </span>
      </div>

      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {activity.name}
        </h3>

        {activity.City && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--color-coral-400)' }}>
            <Icons.MapPin /> {activity.City.name}, {activity.City.country}
          </div>
        )}

        {activity.description && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {activity.description}
          </p>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: Number(activity.cost) > 0 ? 'var(--color-teal-400)' : 'var(--text-muted)', fontWeight: 600 }}>
            <Icons.Dollar />
            {Number(activity.cost) > 0 ? `$${Number(activity.cost).toFixed(0)}` : 'Free'}
          </span>
          {dur && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Icons.Clock />{dur}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function CityCard({ city, onClick, selected }) {
  return (
    <div
      onClick={() => onClick(selected ? null : city)}
      style={{
        padding: '0.625rem 1rem',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${selected ? 'rgba(255,107,69,0.5)' : 'var(--border-subtle)'}`,
        background: selected ? 'rgba(255,107,69,0.1)' : 'rgba(255,255,255,0.03)',
        cursor: 'pointer', transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--border-default)' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: selected ? 'var(--color-coral-400)' : 'var(--text-primary)' }}>{city.name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Icons.Globe />{city.country}
        </div>
      </div>
      {selected && <Icons.X />}
    </div>
  )
}

export default function ActivitySearch() {
  const navigate = useNavigate()
  const [actSearch, setActSearch] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [selectedCity, setSelectedCity] = useState(null)
  const [selectedCat, setSelectedCat] = useState('')
  const [maxCost, setMaxCost] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  /* ── Fetch cities for sidebar ──────────────────────────────── */
  const { data: cities = [] } = useQuery({
    queryKey: ['cities-search', citySearch],
    queryFn: () => cityAPI.list({ search: citySearch }).then(r => r.data),
    enabled: citySearch.length > 1,
    staleTime: 60000,
  })

  /* ── Fetch activities ──────────────────────────────────────── */
  const params = {}
  if (actSearch) params.search = actSearch
  if (selectedCat) params.category = selectedCat
  if (selectedCity) params.city_id = selectedCity.id
  if (maxCost) params.max_cost = maxCost

  const { data: activities = [], isFetching } = useQuery({
    queryKey: ['activities', params],
    queryFn: () => activityAPI.list(params).then(r => r.data),
    staleTime: 30000,
  })

  const hasFilters = selectedCat || selectedCity || maxCost

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ background: 'rgba(15,22,41,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="page-container" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 className="text-headline" style={{ marginRight: 'auto' }}>Explore Activities</h1>

          {/* Search input */}
          <div style={{ position: 'relative', width: '260px' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}><Icons.Search /></span>
            <input
              className="input"
              style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
              placeholder="Search activities…"
              value={actSearch}
              onChange={e => setActSearch(e.target.value)}
            />
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(p => !p)} style={{ gap: '0.375rem', position: 'relative' }}>
            <Icons.Filter /> Filters
            {hasFilters && <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-coral-500)' }} />}
          </button>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="page-container" style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Category pills */}
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {ACTIVITY_CATS.map(c => (
                <button key={c} onClick={() => setSelectedCat(selectedCat === c ? '' : c)} className="btn btn-sm" style={{
                  borderRadius: '9999px', textTransform: 'capitalize',
                  background: selectedCat === c ? `${CAT_COLORS[c]}22` : 'rgba(255,255,255,0.05)',
                  color: selectedCat === c ? CAT_COLORS[c] : 'var(--text-secondary)',
                  border: `1px solid ${selectedCat === c ? CAT_COLORS[c] + '55' : 'var(--border-subtle)'}`,
                }}>{c}</button>
              ))}
            </div>

            {/* Max cost */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Max cost $</label>
              <input type="number" min="0" placeholder="Any" className="input"
                style={{ width: '90px', fontSize: '0.875rem', padding: '0.375rem 0.625rem' }}
                value={maxCost} onChange={e => setMaxCost(e.target.value)} />
              {hasFilters && (
                <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedCat(''); setSelectedCity(null); setMaxCost('') }} style={{ fontSize: '0.8rem', color: '#f87171' }}>
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="page-container" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── City sidebar ─────────────────────────────────────── */}
        <div style={{ position: 'sticky', top: showFilters ? '9rem' : '5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
            Filter by City
          </div>
          {selectedCity && (
            <CityCard city={selectedCity} onClick={() => setSelectedCity(null)} selected={true} />
          )}
          <div style={{ position: 'relative', margin: '0.625rem 0' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}><Icons.Search /></span>
            <input className="input" style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem', padding: '0.4rem 0.625rem 0.4rem 2.25rem' }}
              placeholder="Search cities…" value={citySearch} onChange={e => setCitySearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '360px', overflowY: 'auto' }}>
            {citySearch.length > 1 && cities.filter(c => c.id !== selectedCity?.id).map(c => (
              <CityCard key={c.id} city={c} onClick={setSelectedCity} selected={false} />
            ))}
            {citySearch.length > 1 && cities.length === 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem' }}>No cities found</div>
            )}
            {citySearch.length <= 1 && !selectedCity && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem' }}>Type to search cities</div>
            )}
          </div>
        </div>

        {/* ── Activity grid ─────────────────────────────────────── */}
        <div>
          <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {isFetching ? 'Searching…' : `${activities.length} activit${activities.length !== 1 ? 'ies' : 'y'} found`}
            {selectedCity && <span> in <strong style={{ color: 'var(--text-primary)' }}>{selectedCity.name}</strong></span>}
            {selectedCat && <span style={{ textTransform: 'capitalize' }}> · {selectedCat}</span>}
          </div>

          {isFetching ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card skeleton" style={{ height: '220px' }} />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No activities found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
              {activities.map(a => <ActivityCard key={a.id} activity={a} />)}
            </div>
          )}
        </div>
      </div>

      <style>{`@media(max-width:720px){.page-container[style*='grid-template-columns']{grid-template-columns:1fr !important;}}`}</style>
    </div>
  )
}
