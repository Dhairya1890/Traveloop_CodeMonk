import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { cityAPI, activityAPI, tripAPI, stopAPI } from '../api/api'

const CATS = ['sightseeing','food','adventure','culture','shopping','nature','nightlife','other']
const CAT_COLORS = { sightseeing:'#a5b4fc', food:'#fb923c', adventure:'#f87171', culture:'#fbbf24', shopping:'#f472b6', nature:'#86efac', nightlife:'#2dd4bf', other:'#94a3b8' }
const DUR_OPTS   = [{ label:'Any duration', val:'' }, { label:'< 1 hour', val:'59' }, { label:'1 – 3 hours', val:'180' }, { label:'3+ hours', val:'999' }]

const s = (obj) => obj  // passthrough — we use inline styles directly

function dur(mins) {
  if (!mins) return null
  return mins >= 60 ? `${Math.floor(mins/60)}h${mins%60 ? ` ${mins%60}m`:''}` : `${mins}m`
}

/* ── Quick-view modal ─────────────────────────────────────────── */
function QuickViewModal({ activity, onClose, onAddToTrip }) {
  const cc = CAT_COLORS[activity.category] || '#94a3b8'
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:'520px', borderRadius:'var(--radius-xl)', background:'var(--bg-elevated)', border:'1px solid var(--border-default)', overflow:'hidden', animation:'scale-in 0.15s ease' }}>
        {/* Image / gradient header */}
        <div style={{ height:'200px', position:'relative', background: activity.image_url ? `url(${activity.image_url}) center/cover` : `linear-gradient(135deg,${cc}33,${cc}66)` }}>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, rgba(6,13,31,0.85))' }} />
          <button onClick={onClose} style={{ position:'absolute', top:'0.75rem', right:'0.75rem', width:'30px', height:'30px', borderRadius:'50%', background:'rgba(0,0,0,0.5)', border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>✕</button>
          <div style={{ position:'absolute', bottom:'0.875rem', left:'1rem' }}>
            <span style={{ padding:'0.2rem 0.6rem', borderRadius:'9999px', fontSize:'0.7rem', fontWeight:700, textTransform:'capitalize', background:`${cc}33`, color:cc, border:`1px solid ${cc}55` }}>{activity.category}</span>
          </div>
        </div>

        <div style={{ padding:'1.25rem' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.25rem', color:'var(--text-primary)', marginBottom:'0.375rem' }}>{activity.name}</h2>
          {activity.City && <div style={{ fontSize:'0.8125rem', color:'var(--color-coral-400)', marginBottom:'0.75rem' }}>{activity.City.name}, {activity.City.country}</div>}

          {activity.description && <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)', lineHeight:1.7, marginBottom:'1rem' }}>{activity.description}</p>}

          {/* Stats row */}
          <div style={{ display:'flex', gap:'1.5rem', padding:'0.75rem 0', borderTop:'1px solid var(--border-subtle)', borderBottom:'1px solid var(--border-subtle)', marginBottom:'1rem' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)' }}>Cost</div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, color: Number(activity.cost)>0 ? 'var(--color-teal-400)' : '#4ade80' }}>{Number(activity.cost)>0 ? `$${Number(activity.cost).toFixed(0)}` : 'Free'}</div>
            </div>
            {activity.duration_minutes && <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)' }}>Duration</div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--text-primary)' }}>{dur(activity.duration_minutes)}</div>
            </div>}
          </div>

          <button className="btn btn-primary" style={{ width:'100%' }} onClick={() => onAddToTrip(activity)}>
            + Add to a Trip
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Add-to-trip modal ────────────────────────────────────────── */
function AddToTripModal({ activity, onClose }) {
  const qc = useQueryClient()
  const [tripId, setTripId] = useState('')
  const [stopId, setStopId] = useState('')
  const [done, setDone] = useState(false)

  const { data: trips = [] } = useQuery({ queryKey:['trips'], queryFn:() => tripAPI.list().then(r=>r.data) })
  const { data: stops = [] } = useQuery({ queryKey:['stops-for-trip', tripId], queryFn:() => stopAPI.listByTrip(tripId).then(r=>r.data), enabled:!!tripId })

  const addMut = useMutation({
    mutationFn: () => activityAPI.addToStop(stopId, { activity_id: activity.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['stops', tripId] }); setDone(true) },
  })

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:70, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div onClick={e=>e.stopPropagation()} className="auth-card" style={{ width:'100%', maxWidth:'400px', padding:'1.75rem' }}>
        {done ? (
          <div style={{ textAlign:'center', padding:'1rem' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>✅</div>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--text-primary)', marginBottom:'0.375rem' }}>Added!</h3>
            <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginBottom:'1.25rem' }}>{activity.name} was added to your stop.</p>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem' }}>Add to Trip</h3>
              <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'1.1rem' }}>✕</button>
            </div>
            <p style={{ fontSize:'0.8125rem', color:'var(--text-muted)', marginBottom:'1rem' }}>Adding: <strong style={{ color:'var(--text-primary)' }}>{activity.name}</strong></p>

            <div className="form-group" style={{ marginBottom:'0.875rem' }}>
              <label className="form-label">Select Trip</label>
              <select className="input" value={tripId} onChange={e=>{setTripId(e.target.value); setStopId('')}} style={{ colorScheme:'dark' }}>
                <option value="">— choose a trip —</option>
                {trips.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>

            {tripId && (
              <div className="form-group" style={{ marginBottom:'1.25rem' }}>
                <label className="form-label">Select Stop</label>
                <select className="input" value={stopId} onChange={e=>setStopId(e.target.value)} style={{ colorScheme:'dark' }}>
                  <option value="">— choose a stop —</option>
                  {stops.map(s=><option key={s.id} value={s.id}>{s.City?.name} ({s.arrival_date} → {s.departure_date})</option>)}
                </select>
              </div>
            )}

            {addMut.error && <p style={{ color:'#f87171', fontSize:'0.8rem', marginBottom:'0.75rem' }}>{addMut.error?.response?.data?.error || 'Failed to add'}</p>}

            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" style={{ flex:2 }} onClick={()=>addMut.mutate()} disabled={!tripId||!stopId||addMut.isPending}>
                {addMut.isPending ? 'Adding…' : 'Add Activity'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Activity Card ────────────────────────────────────────────── */
function ActivityCard({ activity, onQuickView }) {
  const cc = CAT_COLORS[activity.category] || '#94a3b8'
  const d = dur(activity.duration_minutes)

  return (
    <div className="card" style={{ overflow:'hidden', display:'flex', flexDirection:'column', cursor:'pointer', transition:'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 12px 36px rgba(0,0,0,0.35)'}}
      onMouseLeave={e=>{e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=''}}
      onClick={()=>onQuickView(activity)}
    >
      {/* Image/gradient header */}
      <div style={{ height:'130px', position:'relative', background: activity.image_url ? `url(${activity.image_url}) center/cover` : `linear-gradient(135deg,${cc}22,${cc}44)`, flexShrink:0 }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 50%, rgba(6,13,31,0.5))' }} />
        <span style={{ position:'absolute', top:'0.625rem', left:'0.625rem', padding:'0.2rem 0.6rem', borderRadius:'9999px', fontSize:'0.7rem', fontWeight:700, textTransform:'capitalize', background:`${cc}33`, color:cc, border:`1px solid ${cc}55`, backdropFilter:'blur(8px)' }}>
          {activity.category}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding:'0.875rem', flex:1, display:'flex', flexDirection:'column', gap:'0.4rem' }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.9375rem', color:'var(--text-primary)', lineHeight:1.3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
          {activity.name}
        </h3>
        {activity.City && <div style={{ fontSize:'0.775rem', color:'var(--color-coral-400)' }}>{activity.City.name}</div>}
        {activity.description && <p style={{ fontSize:'0.775rem', color:'var(--text-muted)', lineHeight:1.55, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', margin:0 }}>{activity.description}</p>}

        <div style={{ marginTop:'auto', paddingTop:'0.5rem', borderTop:'1px solid var(--border-subtle)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.875rem', color: Number(activity.cost)>0 ? 'var(--color-teal-400)' : '#4ade80' }}>
            {Number(activity.cost)>0 ? `$${Number(activity.cost).toFixed(0)}` : 'Free'}
          </span>
          {d && <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{d}</span>}
          <button
            onClick={e=>{e.stopPropagation(); onQuickView(activity)}}
            style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--color-coral-400)', background:'rgba(255,107,69,0.1)', border:'1px solid rgba(255,107,69,0.3)', borderRadius:'9999px', padding:'0.2rem 0.6rem', cursor:'pointer' }}
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────────── */
export default function ActivitySearch() {
  const [searchParams] = useSearchParams()
  const [actSearch, setActSearch]       = useState('')
  const [citySearch, setCitySearch]     = useState('')
  const [selectedCity, setSelectedCity] = useState(null)
  const [selectedCat, setSelectedCat]   = useState('')
  const [maxCost, setMaxCost]           = useState('')
  const [maxDur, setMaxDur]             = useState('')
  const [showFilters, setShowFilters]   = useState(false)
  const [quickView, setQuickView]       = useState(null)
  const [addToTrip, setAddToTrip]       = useState(null)

  // Pre-filter by city when navigated from Dashboard
  const initCityId = searchParams.get('city_id')
  useEffect(() => {
    if (!initCityId) return
    cityAPI.get(initCityId)
      .then(r => setSelectedCity(r.data))
      .catch(() => {}) // silently ignore if city not found
  }, [initCityId])

  const { data: cities = [] } = useQuery({
    queryKey: ['cities-search', citySearch],
    queryFn: () => cityAPI.list({ search: citySearch }).then(r => r.data),
    enabled: citySearch.length > 1,
    staleTime: 60000,
  })

  const params = {}
  if (actSearch)    params.search   = actSearch
  if (selectedCat)  params.category = selectedCat
  if (selectedCity) params.city_id  = selectedCity.id
  if (maxCost)      params.max_cost = maxCost
  if (maxDur)       params.max_duration = maxDur

  const { data: activities = [], isFetching } = useQuery({
    queryKey: ['activities', params],
    queryFn: () => activityAPI.list(params).then(r => r.data),
    staleTime: 30000,
  })

  const hasFilters = !!(selectedCat || selectedCity || maxCost || maxDur)

  const openAddToTrip = (act) => { setQuickView(null); setAddToTrip(act) }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)' }}>

      {/* ── Sticky header ──────────────────────────────────────── */}
      <div style={{ background:'rgba(15,22,41,0.95)', backdropFilter:'blur(14px)', borderBottom:'1px solid var(--border-subtle)', position:'sticky', top:0, zIndex:10 }}>
        <div className="page-container" style={{ padding:'1rem 1.5rem', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
          <h1 className="text-headline" style={{ marginRight:'auto' }}>Explore Activities</h1>

          {/* Search */}
          <div style={{ position:'relative', width:'260px' }}>
            <span style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none', display:'flex' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input className="input" style={{ paddingLeft:'2.25rem', fontSize:'0.875rem' }}
              placeholder="Search activities…" value={actSearch} onChange={e=>setActSearch(e.target.value)} />
          </div>

          <button className="btn btn-secondary btn-sm" onClick={()=>setShowFilters(p=>!p)} style={{ gap:'0.375rem', position:'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filters {hasFilters && <span style={{ position:'absolute', top:'-4px', right:'-4px', width:'8px', height:'8px', borderRadius:'50%', background:'var(--color-coral-500)' }} />}
          </button>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="page-container" style={{ padding:'0.875rem 1.5rem', borderTop:'1px solid var(--border-subtle)', display:'flex', gap:'0.875rem', alignItems:'center', flexWrap:'wrap' }}>
            {/* Category pills */}
            <div style={{ display:'flex', gap:'0.375rem', flexWrap:'wrap' }}>
              {CATS.map(c => (
                <button key={c} onClick={()=>setSelectedCat(selectedCat===c?'':c)} className="btn btn-sm" style={{
                  borderRadius:'9999px', textTransform:'capitalize',
                  background: selectedCat===c ? `${CAT_COLORS[c]}22` : 'rgba(255,255,255,0.05)',
                  color: selectedCat===c ? CAT_COLORS[c] : 'var(--text-secondary)',
                  border: `1px solid ${selectedCat===c ? CAT_COLORS[c]+'55' : 'var(--border-subtle)'}`,
                }}>
                  {c}
                </button>
              ))}
            </div>

            <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', marginLeft:'auto', flexWrap:'wrap' }}>
              {/* Duration filter */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                <label style={{ fontSize:'0.8rem', color:'var(--text-muted)', whiteSpace:'nowrap' }}>Duration</label>
                <select className="input" value={maxDur} onChange={e=>setMaxDur(e.target.value)} style={{ fontSize:'0.8125rem', padding:'0.35rem 0.625rem', colorScheme:'dark', width:'130px' }}>
                  {DUR_OPTS.map(o=><option key={o.val} value={o.val}>{o.label}</option>)}
                </select>
              </div>

              {/* Max cost */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                <label style={{ fontSize:'0.8rem', color:'var(--text-muted)', whiteSpace:'nowrap' }}>Max $</label>
                <input type="number" min="0" placeholder="Any" className="input"
                  style={{ width:'80px', fontSize:'0.875rem', padding:'0.35rem 0.625rem' }}
                  value={maxCost} onChange={e=>setMaxCost(e.target.value)} />
              </div>

              {hasFilters && (
                <button className="btn btn-ghost btn-sm" onClick={()=>{setSelectedCat('');setSelectedCity(null);setMaxCost('');setMaxDur('')}} style={{ color:'#f87171', fontSize:'0.8rem' }}>
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Body grid ──────────────────────────────────────────── */}
      <div className="page-container" style={{ padding:'1.5rem', display:'grid', gridTemplateColumns:'220px 1fr', gap:'1.5rem', alignItems:'start' }}>

        {/* City sidebar */}
        <div style={{ position:'sticky', top: showFilters ? '9.5rem' : '5rem' }}>
          <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.75rem' }}>Filter by City</div>

          {selectedCity && (
            <div onClick={()=>setSelectedCity(null)} style={{ padding:'0.625rem 1rem', borderRadius:'var(--radius-md)', border:'1px solid rgba(255,107,69,0.5)', background:'rgba(255,107,69,0.1)', cursor:'pointer', marginBottom:'0.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--color-coral-400)' }}>{selectedCity.name}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{selectedCity.country}</div>
              </div>
              <span style={{ color:'var(--text-muted)' }}>✕</span>
            </div>
          )}

          <div style={{ position:'relative', margin:'0.5rem 0' }}>
            <span style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none', display:'flex' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input className="input" style={{ paddingLeft:'2.25rem', fontSize:'0.8125rem', padding:'0.4rem 0.625rem 0.4rem 2.25rem' }}
              placeholder="Search cities…" value={citySearch} onChange={e=>setCitySearch(e.target.value)} />
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem', maxHeight:'360px', overflowY:'auto' }}>
            {citySearch.length > 1 && cities.filter(c=>c.id!==selectedCity?.id).map(c=>(
              <div key={c.id} onClick={()=>setSelectedCity(c)} style={{ padding:'0.625rem 1rem', borderRadius:'var(--radius-md)', border:'1px solid var(--border-subtle)', background:'rgba(255,255,255,0.03)', cursor:'pointer', transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
                <div style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--text-primary)' }}>{c.name}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{c.country}</div>
              </div>
            ))}
            {citySearch.length <= 1 && !selectedCity && <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', padding:'0.5rem' }}>Type to search cities</div>}
            {citySearch.length > 1 && cities.length === 0 && <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', padding:'0.5rem' }}>No cities found</div>}
          </div>
        </div>

        {/* Activity grid */}
        <div>
          <div style={{ marginBottom:'1rem', fontSize:'0.875rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'0.375rem' }}>
            {isFetching ? 'Searching…' : `${activities.length} activit${activities.length!==1?'ies':'y'} found`}
            {selectedCity && <span>in <strong style={{ color:'var(--text-primary)' }}>{selectedCity.name}</strong></span>}
            {selectedCat && <span style={{ textTransform:'capitalize', color: CAT_COLORS[selectedCat] }}>· {selectedCat}</span>}
          </div>

          {isFetching ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1rem' }}>
              {[...Array(9)].map((_,i)=><div key={i} className="card skeleton" style={{ height:'240px' }} />)}
            </div>
          ) : activities.length === 0 ? (
            <div className="card" style={{ padding:'3rem', textAlign:'center' }}>
              <p style={{ color:'var(--text-muted)', fontSize:'0.9375rem', marginBottom:'1rem' }}>No activities found. Try adjusting your filters.</p>
              {hasFilters && <button className="btn btn-secondary btn-sm" onClick={()=>{setSelectedCat('');setSelectedCity(null);setMaxCost('');setMaxDur('')}}>Clear filters</button>}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1rem', alignItems:'start' }}>
              {activities.map(a => <ActivityCard key={a.id} activity={a} onQuickView={setQuickView} />)}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {quickView  && <QuickViewModal activity={quickView} onClose={()=>setQuickView(null)} onAddToTrip={openAddToTrip} />}
      {addToTrip  && <AddToTripModal activity={addToTrip} onClose={()=>setAddToTrip(null)} />}

      <style>{`
        @media(max-width:720px){.page-container[style*='220px']{grid-template-columns:1fr !important}}
        @keyframes scale-in{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
      `}</style>
    </div>
  )
}
