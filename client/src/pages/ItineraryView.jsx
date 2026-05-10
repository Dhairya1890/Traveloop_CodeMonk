import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { tripAPI, stopAPI, cityAPI, activityAPI, budgetAPI } from '../api/api'
import { Icons, fmtDate, stopDays, statusColor } from '../components/shared/itineraryUtils.jsx'

/* ─────────────────────────────────────────────────────────────
   ADD STOP MODAL — city search + date picker
───────────────────────────────────────────────────────────── */
function AddStopModal({ tripId, trip, onClose }) {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState(null)
  const [arrival, setArrival] = useState(trip?.start_date || '')
  const [departure, setDeparture] = useState('')
  const [notes, setNotes] = useState('')
  const [err, setErr] = useState('')

  const { data: cities = [], isFetching } = useQuery({
    queryKey: ['cities-search', search],
    queryFn: () => cityAPI.list({ search }).then(r => r.data),
    enabled: search.length > 1,
    staleTime: 30000,
  })

  const mutation = useMutation({
    mutationFn: () => stopAPI.create(tripId, { city_id: selectedCity.id, arrival_date: arrival, departure_date: departure, notes }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stops', tripId] }); onClose() },
    onError: e => setErr(e?.response?.data?.error || 'Failed to add stop'),
  })

  const submit = () => {
    if (!selectedCity) return setErr('Select a city')
    if (!arrival || !departure) return setErr('Both dates are required')
    if (departure < arrival) return setErr('Departure must be after arrival')
    setErr(''); mutation.mutate()
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)' }}>
      <div className="auth-card animate-scale-in" style={{ width:'100%', maxWidth:'480px', padding:'2rem', margin:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.125rem' }}>Add a Stop</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding:'0.375rem' }}><Icons.X /></button>
        </div>

        {/* City search */}
        {!selectedCity ? (
          <div className="form-group" style={{ marginBottom:'1rem' }}>
            <label className="form-label">Search city</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }}><Icons.Search /></span>
              <input className="input" style={{ paddingLeft:'2.5rem' }} placeholder="e.g. Paris, Tokyo…" value={search} onChange={e => setSearch(e.target.value)} autoFocus />
            </div>
            {search.length > 1 && (
              <div style={{ maxHeight:'220px', overflowY:'auto', marginTop:'0.5rem', border:'1px solid var(--border-default)', borderRadius:'var(--radius-md)', background:'var(--bg-elevated)' }}>
                {isFetching && <div style={{ padding:'1rem', color:'var(--text-muted)', fontSize:'0.875rem' }}>Searching…</div>}
                {!isFetching && cities.length === 0 && <div style={{ padding:'1rem', color:'var(--text-muted)', fontSize:'0.875rem' }}>No cities found</div>}
                {cities.map(c => (
                  <div key={c.id} onClick={() => setSelectedCity(c)} style={{ padding:'0.75rem 1rem', cursor:'pointer', display:'flex', justifyContent:'space-between', borderBottom:'1px solid var(--border-subtle)', transition:'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <span style={{ fontWeight:500, color:'var(--text-primary)', fontSize:'0.9375rem' }}>{c.name}</span>
                    <span style={{ color:'var(--text-muted)', fontSize:'0.8125rem' }}>{c.country}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.75rem 1rem', background:'rgba(255,107,69,0.08)', border:'1px solid rgba(255,107,69,0.25)', borderRadius:'var(--radius-md)', marginBottom:'1rem' }}>
            <div>
              <div style={{ fontWeight:600, color:'var(--text-primary)' }}>{selectedCity.name}</div>
              <div style={{ fontSize:'0.8125rem', color:'var(--text-muted)' }}>{selectedCity.country}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedCity(null)} style={{ padding:'0.375rem' }}><Icons.X /></button>
          </div>
        )}

        {/* Dates */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
          <div className="form-group">
            <label className="form-label">Arrival</label>
            <input type="date" className="input" style={{ colorScheme:'dark' }} value={arrival} onChange={e => setArrival(e.target.value)} min={trip?.start_date} max={trip?.end_date} />
          </div>
          <div className="form-group">
            <label className="form-label">Departure</label>
            <input type="date" className="input" style={{ colorScheme:'dark' }} value={departure} onChange={e => setDeparture(e.target.value)} min={arrival || trip?.start_date} max={trip?.end_date} />
          </div>
        </div>

        {/* Notes */}
        <div className="form-group" style={{ marginBottom:'1.25rem' }}>
          <label className="form-label">Notes (optional)</label>
          <textarea className="input" rows={2} style={{ resize:'vertical' }} placeholder="Hotel name, transport info…" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        {err && <div style={{ display:'flex', gap:'0.375rem', alignItems:'center', color:'#f87171', fontSize:'0.8125rem', marginBottom:'1rem' }}><Icons.Alert />{err}</div>}

        <div style={{ display:'flex', gap:'0.75rem' }}>
          <button className="btn btn-secondary" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex:2 }} onClick={submit} disabled={mutation.isPending}>
            {mutation.isPending ? <><div className="spinner"/>Adding…</> : 'Add Stop'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ACTIVITY PANEL — shown inside an expanded stop
───────────────────────────────────────────────────────────── */
function ActivityPanel({ stop, tripId }) {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [addErr, setAddErr] = useState('')

  const { data: cityActivities = [], isFetching } = useQuery({
    queryKey: ['activities-city', stop.city_id, search],
    queryFn: () => activityAPI.listByCity(stop.city_id, { search }).then(r => r.data),
    staleTime: 60000,
  })

  const addedIds = new Set(stop.Activities?.map(a => a.id) || [])

  const addMut = useMutation({
    mutationFn: (actId) => activityAPI.addToStop(stop.id, { activity_id: actId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stops', tripId] }); setAddErr('') },
    onError: e => setAddErr(e?.response?.data?.error || 'Failed to add'),
  })

  const removeMut = useMutation({
    mutationFn: (actId) => activityAPI.removeFromStop(stop.id, actId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stops', tripId] }),
  })

  const filtered = cityActivities.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ padding:'1rem 1.25rem', borderTop:'1px solid var(--border-subtle)', background:'rgba(255,255,255,0.02)' }}>
      {/* Current activities */}
      {stop.Activities?.length > 0 && (
        <div style={{ marginBottom:'1rem' }}>
          <div style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.5rem' }}>Added Activities</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
            {stop.Activities.map(a => (
              <div key={a.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.5rem 0.75rem', background:'rgba(45,212,191,0.06)', border:'1px solid rgba(45,212,191,0.15)', borderRadius:'var(--radius-sm)' }}>
                <div>
                  <span style={{ fontSize:'0.875rem', color:'var(--text-primary)', fontWeight:500 }}>{a.name}</span>
                  {a.cost > 0 && <span style={{ fontSize:'0.75rem', color:'var(--color-amber-400)', marginLeft:'0.5rem' }}>${a.cost}</span>}
                  {a.duration_minutes && <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginLeft:'0.375rem' }}>{a.duration_minutes}min</span>}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => removeMut.mutate(a.id)} style={{ padding:'0.25rem', color:'#f87171' }}><Icons.Trash /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse city activities */}
      <div style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.5rem' }}>Browse Activities in {stop.City?.name}</div>
      <div style={{ position:'relative', marginBottom:'0.625rem' }}>
        <span style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }}><Icons.Search /></span>
        <input className="input" style={{ paddingLeft:'2.25rem', fontSize:'0.875rem', padding:'0.5rem 0.75rem 0.5rem 2.25rem' }} placeholder="Filter activities…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {addErr && <div style={{ color:'#f87171', fontSize:'0.8rem', marginBottom:'0.5rem', display:'flex', gap:'0.25rem', alignItems:'center' }}><Icons.Alert />{addErr}</div>}
      <div style={{ maxHeight:'200px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'0.375rem' }}>
        {isFetching && <div style={{ color:'var(--text-muted)', fontSize:'0.8rem', padding:'0.5rem' }}>Loading…</div>}
        {!isFetching && filtered.length === 0 && <div style={{ color:'var(--text-muted)', fontSize:'0.8rem', padding:'0.5rem' }}>No activities found</div>}
        {filtered.map(a => {
          const added = addedIds.has(a.id)
          return (
            <div key={a.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.5rem 0.75rem', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-sm)' }}>
              <div>
                <span style={{ fontSize:'0.875rem', color:'var(--text-primary)', fontWeight:500 }}>{a.name}</span>
                <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginLeft:'0.375rem', textTransform:'capitalize' }}>{a.category}</span>
                {a.cost > 0 && <span style={{ fontSize:'0.75rem', color:'var(--color-amber-400)', marginLeft:'0.375rem' }}>${a.cost}</span>}
              </div>
              <button
                className="btn btn-sm"
                disabled={added || addMut.isPending}
                onClick={() => !added && addMut.mutate(a.id)}
                style={{ padding:'0.25rem 0.625rem', fontSize:'0.75rem', background: added ? 'rgba(45,212,191,0.12)' : 'rgba(255,107,69,0.12)', color: added ? 'var(--color-teal-400)' : 'var(--color-coral-400)', border:`1px solid ${added ? 'rgba(45,212,191,0.25)' : 'rgba(255,107,69,0.25)'}`, borderRadius:'9999px' }}
              >
                {added ? <><Icons.Check /> Added</> : <><Icons.Plus /> Add</>}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STOP CARD
───────────────────────────────────────────────────────────── */
function StopCard({ stop, index, tripId, trip, totalStops, onMoveUp, onMoveDown }) {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [arrival, setArrival] = useState(stop.arrival_date)
  const [departure, setDeparture] = useState(stop.departure_date)
  const [notes, setNotes] = useState(stop.notes || '')

  const removeMut = useMutation({
    mutationFn: () => stopAPI.remove(stop.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stops', tripId] }),
  })

  const updateMut = useMutation({
    mutationFn: () => stopAPI.update(stop.id, { arrival_date: arrival, departure_date: departure, notes }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stops', tripId] }); setEditing(false) },
  })

  const days = stopDays(stop.arrival_date, stop.departure_date)

  return (
    <div style={{ display:'flex', gap:'0', position:'relative' }}>
      {/* Timeline column */}
      <div style={{ width:'48px', display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
        <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'var(--gradient-accent)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.875rem', zIndex:1, boxShadow:'0 0 0 4px var(--bg-base)' }}>{index + 1}</div>
        {index < totalStops - 1 && <div style={{ width:'2px', flex:1, background:'linear-gradient(to bottom, rgba(255,107,69,0.4), rgba(255,107,69,0.1))', minHeight:'24px' }} />}
      </div>

      {/* Card */}
      <div className="card" style={{ flex:1, marginBottom:'1rem', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ padding:'1rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.75rem' }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem' }}>
              <span style={{ color:'var(--color-coral-400)' }}><Icons.MapPin /></span>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {stop.City?.name}
              </h3>
              <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{stop.City?.country}</span>
            </div>
            {!editing ? (
              <div style={{ display:'flex', gap:'1rem', fontSize:'0.8rem', color:'var(--text-muted)' }}>
                <span style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}><Icons.Calendar />{fmtDate(stop.arrival_date)} → {fmtDate(stop.departure_date)}</span>
                <span style={{ color:'var(--color-coral-400)', fontWeight:600 }}>{days} day{days !== 1 ? 's' : ''}</span>
                {stop.Activities?.length > 0 && <span>{stop.Activities.length} activit{stop.Activities.length !== 1 ? 'ies' : 'y'}</span>}
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginTop:'0.5rem' }}>
                <input type="date" className="input" style={{ fontSize:'0.8125rem', padding:'0.375rem 0.625rem', colorScheme:'dark' }} value={arrival} onChange={e => setArrival(e.target.value)} min={trip?.start_date} max={trip?.end_date} />
                <input type="date" className="input" style={{ fontSize:'0.8125rem', padding:'0.375rem 0.625rem', colorScheme:'dark' }} value={departure} onChange={e => setDeparture(e.target.value)} min={arrival} max={trip?.end_date} />
                <textarea className="input" rows={2} style={{ gridColumn:'1/-1', fontSize:'0.8125rem', resize:'vertical' }} placeholder="Notes…" value={notes} onChange={e => setNotes(e.target.value)} />
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={() => updateMut.mutate()} disabled={updateMut.isPending}>{updateMut.isPending ? 'Saving…' : 'Save'}</button>
              </div>
            )}
          </div>
          {!editing && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.15rem' }}>
              {/* Reorder */}
              <div style={{ display:'flex', gap:'0.15rem', marginBottom:'0.25rem' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={onMoveUp}
                  disabled={index === 0}
                  style={{ padding:'0.25rem', opacity: index === 0 ? 0.25 : 1 }}
                  title="Move up"
                >
                  <Icons.ChevronUp />
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={onMoveDown}
                  disabled={index === totalStops - 1}
                  style={{ padding:'0.25rem', opacity: index === totalStops - 1 ? 0.25 : 1 }}
                  title="Move down"
                >
                  <Icons.ChevronDown />
                </button>
              </div>
              {/* Actions */}
              <div style={{ display:'flex', gap:'0.15rem' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)} style={{ padding:'0.375rem' }} title="Edit stop"><Icons.Edit /></button>
                <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(p => !p)} style={{ padding:'0.375rem', color: expanded ? 'var(--color-coral-400)' : undefined }} title="Activities">
                  <Icons.Plus />
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => removeMut.mutate()} style={{ padding:'0.375rem', color:'#f87171' }} title="Remove stop" disabled={removeMut.isPending}><Icons.Trash /></button>
              </div>
            </div>
          )}
        </div>

        {/* Notes display */}
        {!editing && stop.notes && (
          <div style={{ padding:'0 1.25rem 0.75rem', fontSize:'0.8125rem', color:'var(--text-secondary)', fontStyle:'italic' }}>{stop.notes}</div>
        )}

        {/* Activity panel */}
        {expanded && <ActivityPanel stop={stop} tripId={tripId} />}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   CATEGORY CONFIG
───────────────────────────────────────────────────────────── */
const CAT = {
  sightseeing: { icon: '🏛', color: '#a78bfa' },
  food:        { icon: '🍜', color: '#fb923c' },
  adventure:   { icon: '🏃', color: '#34d399' },
  shopping:    { icon: '🛍', color: '#f472b6' },
  nightlife:   { icon: '🌙', color: '#60a5fa' },
  culture:     { icon: '🎭', color: '#fbbf24' },
  nature:      { icon: '🌿', color: '#4ade80' },
  transport:   { icon: '🚆', color: '#94a3b8' },
}

/* ─────────────────────────────────────────────────────────────
   DAY-WISE VIEW
───────────────────────────────────────────────────────────── */
function DayWiseView({ trip, stops }) {
  if (!stops.length) return (
    <div style={{ textAlign:'center', padding:'4rem 2rem', color:'var(--text-muted)' }}>No stops yet — switch to Builder to add cities.</div>
  )

  let dayNum = 0
  const WDAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const fmtDay = (d) => { const x = new Date(d + 'T00:00:00'); return `${WDAY[x.getDay()]}, ${MONTH[x.getMonth()]} ${x.getDate()}` }

  const totalTripDays = Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000) + 1

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>
      {stops.map((stop, stopIdx) => {
        // Build day list for this stop
        const arr = new Date(stop.arrival_date + 'T00:00:00')
        const dep = new Date(stop.departure_date + 'T00:00:00')
        const stopDayList = []
        for (let d = new Date(arr); d <= dep; d.setDate(d.getDate() + 1))
          stopDayList.push(new Date(d).toISOString().slice(0,10))

        const totalCost = (stop.Activities || []).reduce((s,a) => s + Number(a.cost || 0), 0)
        const totalMins = (stop.Activities || []).reduce((s,a) => s + Number(a.duration_minutes || 0), 0)
        const startDay = dayNum + 1
        dayNum += stopDayList.length

        return (
          <div key={stop.id} style={{ borderRadius:'var(--radius-lg)', overflow:'hidden', border:'1px solid var(--border-subtle)', background:'var(--bg-surface)' }}>
            {/* ── City header ──────────────────────────── */}
            <div style={{ padding:'1rem 1.25rem', background:'linear-gradient(135deg, rgba(255,107,69,0.1), rgba(45,212,191,0.06))', borderBottom:'1px solid var(--border-subtle)', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'var(--gradient-accent)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'var(--font-display)', fontWeight:800, fontSize:'0.875rem', flexShrink:0 }}>{stopIdx+1}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.0625rem', color:'var(--text-primary)' }}>
                  {stop.City?.name} <span style={{ fontSize:'0.8125rem', color:'var(--text-muted)', fontWeight:400 }}>· {stop.City?.country}</span>
                </div>
                <div style={{ fontSize:'0.775rem', color:'var(--text-muted)', marginTop:'0.1rem' }}>
                  {fmtDay(stop.arrival_date)} → {fmtDay(stop.departure_date)} · Days {startDay}–{dayNum} · {stopDayList.length} night{stopDayList.length!==1?'s':''}
                </div>
              </div>
              <div style={{ display:'flex', gap:'1rem' }}>
                {totalCost > 0 && <div style={{ textAlign:'center' }}><div style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)' }}>Est. Cost</div><div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--color-coral-400)' }}>${totalCost.toLocaleString()}</div></div>}
                {totalMins > 0 && <div style={{ textAlign:'center' }}><div style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)' }}>Activities</div><div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--color-teal-400)' }}>{stop.Activities?.length || 0}</div></div>}
              </div>
            </div>

            {/* ── Activities block (shown once per stop) ── */}
            {stop.Activities?.length > 0 && (
              <div style={{ padding:'0.875rem 1.25rem', borderBottom:'1px solid var(--border-subtle)', background:'rgba(255,255,255,0.015)' }}>
                <div style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--text-muted)', marginBottom:'0.625rem' }}>Planned Activities</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  {stop.Activities.map(a => {
                    const cat = CAT[a.category] || CAT.sightseeing
                    return (
                      <div key={a.id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.625rem 0.875rem', borderRadius:'var(--radius-md)', background:'rgba(255,255,255,0.035)', border:'1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize:'1.1rem', flexShrink:0 }}>{cat.icon}</span>
                        <span style={{ flex:1, fontWeight:500, fontSize:'0.875rem', color:'var(--text-primary)' }}>{a.name}</span>
                        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', flexShrink:0 }}>
                          {a.category && <span style={{ padding:'0.15rem 0.5rem', borderRadius:'9999px', fontSize:'0.7rem', fontWeight:600, textTransform:'capitalize', background:`${cat.color}18`, color:cat.color, border:`1px solid ${cat.color}30` }}>{a.category}</span>}
                          {Number(a.duration_minutes) > 0 && <span style={{ display:'flex', alignItems:'center', gap:'0.2rem', fontSize:'0.775rem', color:'var(--text-muted)' }}><Icons.Clock />{a.duration_minutes < 60 ? `${a.duration_minutes}m` : `${Math.floor(a.duration_minutes/60)}h${a.duration_minutes%60?` ${a.duration_minutes%60}m`:''}`}</span>}
                          {Number(a.cost) > 0 && <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.8125rem', color:'var(--color-coral-400)' }}>${Number(a.cost).toFixed(0)}</span>}
                          {Number(a.cost) === 0 && <span style={{ fontSize:'0.775rem', color:'#4ade80', fontWeight:600 }}>Free</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Day rows ─────────────────────────────── */}
            <div style={{ display:'flex', flexDirection:'column' }}>
              {stopDayList.map((dateStr, di) => (
                <div key={dateStr} style={{ display:'flex', alignItems:'center', gap:'0', borderBottom: di < stopDayList.length-1 ? '1px solid var(--border-subtle)' : 'none', minHeight:'44px' }}>
                  <div style={{ width:'64px', padding:'0.625rem 0.875rem', textAlign:'center', borderRight:'1px solid var(--border-subtle)', flexShrink:0, background:'rgba(255,255,255,0.015)' }}>
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'0.8125rem', color:'var(--color-coral-400)' }}>Day {startDay + di}</div>
                  </div>
                  <div style={{ padding:'0.5rem 1rem', fontSize:'0.8125rem', color:'var(--text-secondary)' }}>
                    {fmtDay(dateStr)}
                    {di === 0 && stop.notes && <span style={{ marginLeft:'0.75rem', fontStyle:'italic', color:'var(--text-muted)' }}>— {stop.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN — ItineraryView
───────────────────────────────────────────────────────────── */
export default function ItineraryView() {
  const { id: tripId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showAddStop, setShowAddStop] = useState(false)
  const [viewMode, setViewMode] = useState('builder') // 'builder' | 'daywise'

  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripAPI.get(tripId).then(r => r.data),
  })

  const { data: stops = [], isLoading: stopsLoading } = useQuery({
    queryKey: ['stops', tripId],
    queryFn: () => stopAPI.listByTrip(tripId).then(r => r.data),
  })

  const reorderMut = useMutation({
    mutationFn: (ordered) => stopAPI.reorder(tripId, ordered),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stops', tripId] }),
  })

  const moveStop = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= stops.length) return
    const reordered = [...stops]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    const payload = reordered.map((s, i) => ({ id: s.id, order_index: i }))
    reorderMut.mutate(payload)
  }
  const { data: budgetData } = useQuery({
    queryKey: ['budget', tripId],
    queryFn: () => budgetAPI.list(tripId).then(r => r.data),
  })

  const sc = statusColor(trip?.status)
  const totalBudget = Number(trip?.total_budget || 0)
  // Activity cost = budget items under 'activity' category (reflects Budget page entries)
  const activityBudgetCost = budgetData?.summary?.by_category?.activity?.actual
    || budgetData?.summary?.by_category?.activity?.estimated
    || 0
  // Activity count = activities added to stops
  const totalActivities = stops.reduce((s, st) => s + (st.Activities?.length || 0), 0)

  if (tripLoading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-base)' }}>
      <div className="spinner" style={{ width:'2rem', height:'2rem' }} />
    </div>
  )

  if (!trip) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem', background:'var(--bg-base)' }}>
      <p style={{ color:'var(--text-muted)' }}>Trip not found.</p>
      <button className="btn btn-secondary" onClick={() => navigate('/trips')}>Back to trips</button>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)' }}>

      {/* ── Cover Hero ──────────────────────────────────────── */}
      <div style={{
        position:'relative', height:'240px', overflow:'hidden',
        background: trip.cover_photo ? `url(${trip.cover_photo}) center/cover no-repeat` : 'linear-gradient(135deg, var(--color-navy-800), var(--color-navy-700))',
      }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(6,13,31,0.3) 0%, rgba(6,13,31,0.75) 100%)' }} />
        <div className="page-container" style={{ position:'relative', height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'1.25rem 1.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/trips')} style={{ alignSelf:'flex-start', background:'rgba(0,0,0,0.3)', backdropFilter:'blur(8px)', gap:'0.375rem', color:'rgba(255,255,255,0.85)' }}>
            <Icons.Back /> My Trips
          </button>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.5rem' }}>
              <span style={{ padding:'0.2rem 0.625rem', borderRadius:'9999px', fontSize:'0.7rem', fontWeight:700, textTransform:'capitalize', background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`, backdropFilter:'blur(8px)' }}>{trip.status}</span>
              {trip.is_public && <span style={{ padding:'0.2rem 0.625rem', borderRadius:'9999px', fontSize:'0.7rem', fontWeight:600, background:'rgba(45,212,191,0.15)', color:'var(--color-teal-400)', border:'1px solid rgba(45,212,191,0.3)', backdropFilter:'blur(8px)' }}>Public</span>}
            </div>
            <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(1.5rem, 4vw, 2.25rem)', color:'#fff', marginBottom:'0.375rem' }}>{trip.title}</h1>
            <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.875rem' }}>
              {fmtDate(trip.start_date)} — {fmtDate(trip.end_date)}
              {trip.description && ` · ${trip.description}`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick stats bar ──────────────────────────────────── */}
      <div style={{ background:'var(--bg-surface)', borderBottom:'1px solid var(--border-subtle)' }}>
        <div className="page-container" style={{ padding:'0.875rem 1.5rem', display:'flex', gap:'2rem', flexWrap:'wrap' }}>
          {[
            { label:'Stops',            value: stops.length },
            { label:'Activities',       value: totalActivities },
            { label:'Budget',           value: totalBudget > 0 ? `$${totalBudget.toLocaleString()}` : '—' },
            { label:'Activity Spend',   value: activityBudgetCost > 0 ? `$${Number(activityBudgetCost).toLocaleString()}` : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize:'0.7rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.125rem', color:'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
          <div style={{ marginLeft:'auto', display:'flex', gap:'0.75rem', alignItems:'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/trips/${tripId}/budget`)}>Budget</button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/trips/${tripId}/packing`)}>Packing</button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/trips/${tripId}/notes`)}>Notes</button>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="page-container" style={{ padding:'2rem 1.5rem' }}>
        {/* Section header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:'0.75rem' }}>
          <div>
            <h2 className="text-headline">Itinerary</h2>
            <p style={{ fontSize:'0.8125rem', color:'var(--text-muted)', marginTop:'0.1rem' }}>
              {stops.length === 0 ? 'Add cities to start building your trip' : `${stops.length} stop${stops.length !== 1 ? 's' : ''} planned`}
            </p>
          </div>
          <div style={{ display:'flex', gap:'0.625rem', alignItems:'center' }}>
            {/* View toggle */}
            <div style={{ display:'flex', borderRadius:'var(--radius-md)', overflow:'hidden', border:'1px solid var(--border-default)', background:'rgba(255,255,255,0.03)' }}>
              <button
                onClick={() => setViewMode('builder')}
                style={{ padding:'0.4rem 0.875rem', fontSize:'0.8125rem', fontWeight:600, border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.35rem', transition:'background 0.15s, color 0.15s',
                  background: viewMode==='builder' ? 'var(--gradient-accent)' : 'transparent',
                  color: viewMode==='builder' ? '#fff' : 'var(--text-muted)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                Builder
              </button>
              <button
                onClick={() => setViewMode('daywise')}
                style={{ padding:'0.4rem 0.875rem', fontSize:'0.8125rem', fontWeight:600, border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.35rem', transition:'background 0.15s, color 0.15s',
                  background: viewMode==='daywise' ? 'var(--gradient-accent)' : 'transparent',
                  color: viewMode==='daywise' ? '#fff' : 'var(--text-muted)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Day View
              </button>
            </div>
            {viewMode === 'builder' && (
              <button className="btn btn-primary" onClick={() => setShowAddStop(true)}>
                <Icons.Plus /> Add Stop
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {stopsLoading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="spinner" style={{ width:'1.5rem', height:'1.5rem' }} /></div>
        ) : viewMode === 'daywise' ? (
          <DayWiseView trip={trip} stops={stops} />
        ) : stops.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem 2rem', borderRadius:'var(--radius-lg)', border:'2px dashed var(--border-default)', background:'rgba(255,255,255,0.02)' }}>
            <p style={{ color:'var(--text-muted)', fontSize:'0.9375rem', marginBottom:'1rem' }}>No stops yet. Add your first city!</p>
            <button className="btn btn-primary" onClick={() => setShowAddStop(true)}><Icons.Plus /> Add First Stop</button>
          </div>
        ) : (
          <div style={{ paddingLeft:'0.5rem' }}>
            {stops.map((stop, i) => (
              <StopCard
                key={stop.id}
                stop={stop}
                index={i}
                tripId={tripId}
                trip={trip}
                totalStops={stops.length}
                onMoveUp={() => moveStop(i, i - 1)}
                onMoveDown={() => moveStop(i, i + 1)}
              />
            ))}
          </div>
        )}
      </div>

      {showAddStop && <AddStopModal tripId={tripId} trip={trip} onClose={() => setShowAddStop(false)} />}
    </div>
  )
}
