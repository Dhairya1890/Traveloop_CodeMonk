import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { packingAPI, tripAPI } from '../api/api'

/* ── DB ENUM values exactly ──────────────────────────────────── */
const CATEGORIES = ['clothing', 'documents', 'electronics', 'toiletries', 'medicine', 'other']

const CAT_META = {
  clothing:    { color: '#a5b4fc', label: 'Clothing' },
  documents:   { color: '#fbbf24', label: 'Documents' },
  electronics: { color: '#2dd4bf', label: 'Electronics' },
  toiletries:  { color: '#f472b6', label: 'Toiletries' },
  medicine:    { color: '#86efac', label: 'Medicine' },
  other:       { color: '#94a3b8', label: 'Other' },
}

const SUGGESTIONS = {
  clothing:    ['T-shirts', 'Jeans', 'Shorts', 'Underwear', 'Socks', 'Jacket', 'Pyjamas', 'Swimwear', 'Formal outfit', 'Belt'],
  documents:   ['Passport', 'Visa', 'Travel insurance', 'Boarding passes', 'Hotel bookings', 'ID card', 'Emergency contacts'],
  electronics: ['Phone charger', 'Power bank', 'Adapter', 'Laptop', 'Camera', 'Earphones', 'SIM card'],
  toiletries:  ['Toothbrush', 'Toothpaste', 'Shampoo', 'Soap', 'Deodorant', 'Razor', 'Sunscreen', 'Moisturiser'],
  medicine:    ['Paracetamol', 'Antacids', 'Band-aids', 'Prescription meds', 'Mosquito repellent', 'Motion sickness pills'],
  other:       ['Snacks', 'Water bottle', 'Umbrella', 'Guidebook', 'Notebook', 'Sunglasses', 'Travel pillow'],
}

const Icons = {
  Back:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Plus:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>,
  Refresh: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
}

/* ── Single packing item row ─────────────────────────────────── */
function PackingItem({ item, tripId }) {
  const qc = useQueryClient()

  const toggleMut = useMutation({
    mutationFn: () => packingAPI.update(item.id, { is_packed: !item.is_packed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packing', tripId] }),
  })
  const removeMut = useMutation({
    mutationFn: () => packingAPI.remove(item.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packing', tripId] }),
  })

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.575rem 0', borderBottom: '1px solid var(--border-subtle)',
      opacity: item.is_packed ? 0.5 : 1, transition: 'opacity 0.2s',
    }}>
      <div
        onClick={() => !toggleMut.isPending && toggleMut.mutate()}
        style={{
          width: '20px', height: '20px', flexShrink: 0,
          borderRadius: '5px', cursor: 'pointer',
          background: item.is_packed ? 'var(--gradient-accent)' : 'transparent',
          border: item.is_packed ? 'none' : '2px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        {item.is_packed && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
      </div>
      <span style={{
        flex: 1, fontSize: '0.9rem',
        color: item.is_packed ? 'var(--text-muted)' : 'var(--text-primary)',
        textDecoration: item.is_packed ? 'line-through' : 'none',
        transition: 'all 0.2s',
      }}>
        {item.label}
      </span>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => removeMut.mutate()}
        disabled={removeMut.isPending}
        style={{ padding: '0.25rem', color: '#f87171', opacity: 0.6 }}
      >
        <Icons.Trash />
      </button>
    </div>
  )
}

/* ── Category section (FULLY isolated state) ─────────────────── */
function CategorySection({ category, items, tripId }) {
  const qc = useQueryClient()
  const [adding, setAdding] = useState(false)  // each instance is independent
  const [label, setLabel] = useState('')
  const meta = CAT_META[category] || CAT_META.other
  const packed = items.filter(i => i.is_packed).length

  const addMut = useMutation({
    mutationFn: (itemLabel) => packingAPI.create(tripId, {
      label: itemLabel.trim(),
      category,          // exact DB ENUM value
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packing', tripId] })
      setLabel('')
      setAdding(false)
    },
  })

  const handleAdd = () => {
    if (!label.trim()) return
    addMut.mutate(label)
  }

  const handleSuggestion = (s) => {
    addMut.mutate(s)
  }

  return (
    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '0.75rem 1.125rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.025)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.color }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: meta.color }}>
            {meta.label}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {packed}/{items.length}
          </span>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { setAdding(p => !p); setLabel('') }}
          style={{ padding: '0.25rem 0.5rem', gap: '0.25rem', fontSize: '0.75rem' }}
        >
          <Icons.Plus /> {adding ? 'Cancel' : 'Add'}
        </button>
      </div>

      {/* Items */}
      <div style={{ padding: '0 1.125rem', flex: 1 }}>
        {items.length === 0 && !adding && (
          <div style={{ padding: '0.875rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            No items yet.
          </div>
        )}
        {items.map(item => <PackingItem key={item.id} item={item} tripId={tripId} />)}
      </div>

      {/* Inline add form — only shown for THIS category */}
      {adding && (
        <div style={{ padding: '0.75rem 1.125rem', borderTop: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
            <input
              autoFocus
              className="input"
              style={{ flex: 1, fontSize: '0.875rem', padding: '0.4rem 0.625rem' }}
              placeholder="Item name…"
              value={label}
              onChange={e => setLabel(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && label.trim()) handleAdd()
                if (e.key === 'Escape') { setAdding(false); setLabel('') }
              }}
            />
            <button
              className="btn btn-primary btn-sm"
              disabled={!label.trim() || addMut.isPending}
              onClick={handleAdd}
            >
              {addMut.isPending ? '…' : 'Add'}
            </button>
          </div>

          {/* Suggestions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {SUGGESTIONS[category]
              ?.filter(s => !items.some(i => i.label.toLowerCase() === s.toLowerCase()))
              .slice(0, 7)
              .map(s => (
                <button
                  key={s}
                  disabled={addMut.isPending}
                  onClick={() => handleSuggestion(s)}
                  style={{
                    padding: '0.2rem 0.625rem', fontSize: '0.75rem',
                    borderRadius: '9999px', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,107,69,0.12)'
                    e.currentTarget.style.color = 'var(--color-coral-400)'
                    e.currentTarget.style.borderColor = 'rgba(255,107,69,0.3)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                    e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  }}
                >
                  + {s}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────── */
export default function PackingChecklist() {
  const { id: tripId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [filter, setFilter] = useState('all')

  useQuery({ queryKey: ['trip', tripId], queryFn: () => tripAPI.get(tripId).then(r => r.data) })

  const { data, isLoading } = useQuery({
    queryKey: ['packing', tripId],
    queryFn: () => packingAPI.list(tripId).then(r => r.data),
  })

  const resetMut = useMutation({
    mutationFn: () => packingAPI.reset(tripId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packing', tripId] }),
  })

  const items = data?.items || []
  const totalPacked = items.filter(i => i.is_packed).length
  const progress = items.length ? Math.round((totalPacked / items.length) * 100) : 0

  // Group items by category
  const grouped = {}
  CATEGORIES.forEach(c => { grouped[c] = [] })
  items.forEach(item => {
    const cat = CATEGORIES.includes(item.category) ? item.category : 'other'
    if (filter === 'all'
      || (filter === 'packed' && item.is_packed)
      || (filter === 'unpacked' && !item.is_packed)) {
      grouped[cat].push(item)
    }
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ background: 'rgba(15,22,41,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="page-container" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/trips/${tripId}`)} style={{ gap: '0.375rem' }}>
            <Icons.Back /> Itinerary
          </button>
          <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)' }} />
          <h1 className="text-headline" style={{ flex: 1 }}>Packing List</h1>
          {totalPacked > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => resetMut.mutate()} disabled={resetMut.isPending} style={{ gap: '0.375rem', fontSize: '0.8125rem' }}>
              <Icons.Refresh /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="page-container" style={{ padding: '1.5rem' }}>
        {/* Progress bar */}
        {items.length > 0 && (
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
              <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)' }}>
                {totalPacked} of {items.length} packed
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: progress === 100 ? 'var(--color-teal-400)' : 'var(--color-coral-400)' }}>
                {progress}%
              </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: progress === 100 ? 'linear-gradient(90deg,#2dd4bf,#86efac)' : 'var(--gradient-accent)',
                borderRadius: '9999px', transition: 'width 0.4s',
              }} />
            </div>
            {progress === 100 && (
              <div style={{ marginTop: '0.75rem', textAlign: 'center', color: 'var(--color-teal-400)', fontWeight: 600, fontSize: '0.9rem' }}>
                All packed — you're ready to go!
              </div>
            )}
          </div>
        )}

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem' }}>
          {['all', 'unpacked', 'packed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="btn btn-sm" style={{
              borderRadius: '9999px', textTransform: 'capitalize',
              background: filter === f ? 'var(--gradient-accent)' : 'rgba(255,255,255,0.05)',
              color: filter === f ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${filter === f ? 'transparent' : 'var(--border-subtle)'}`,
            }}>
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ width: '1.5rem', height: '1.5rem' }} />
          </div>
        ) : (
          /* Grid: align-items start so each card is independent height */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
            alignItems: 'start',   /* ← prevents cards from stretching to match tallest */
          }}>
            {CATEGORIES.map(c => (
              <CategorySection
                key={c}
                category={c}
                items={grouped[c]}
                tripId={tripId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
