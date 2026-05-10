import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetAPI, tripAPI } from '../api/api'

const CATEGORIES = ['accommodation', 'transport', 'food', 'activities', 'shopping', 'health', 'other']

const CAT_COLORS = {
  accommodation: { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc', bar: '#6366f1' },
  transport:     { bg: 'rgba(45,212,191,0.12)',  color: '#2dd4bf', bar: '#2dd4bf' },
  food:          { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c', bar: '#fb923c' },
  activities:    { bg: 'rgba(255,107,69,0.12)',  color: '#ff6b45', bar: '#ff6b45' },
  shopping:      { bg: 'rgba(244,114,182,0.12)', color: '#f472b6', bar: '#f472b6' },
  health:        { bg: 'rgba(134,239,172,0.12)', color: '#86efac', bar: '#86efac' },
  other:         { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', bar: '#94a3b8' },
}

const Icons = {
  Back:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Plus:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Edit:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Check:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Alert:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
}

function pct(part, total) {
  if (!total) return 0
  return Math.min(100, Math.round((part / total) * 100))
}

function AddItemModal({ tripId, onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ category: 'accommodation', label: '', estimated_cost: '', actual_cost: '' })
  const [err, setErr] = useState('')

  const mut = useMutation({
    mutationFn: () => budgetAPI.create(tripId, {
      category: form.category,
      label: form.label,
      estimated_cost: parseFloat(form.estimated_cost) || 0,
      actual_cost: form.actual_cost ? parseFloat(form.actual_cost) : null,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budget', tripId] }); onClose() },
    onError: e => setErr(e?.response?.data?.error || 'Failed to add item'),
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)' }}>
      <div className="auth-card animate-scale-in" style={{ width:'100%', maxWidth:'440px', padding:'2rem', margin:'1rem' }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.125rem', marginBottom:'1.5rem' }}>Add Budget Item</h3>

        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="input select" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform:'capitalize' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Label <span style={{ color:'var(--color-coral-500)' }}>*</span></label>
            <input className="input" placeholder="e.g. Flight to Paris" value={form.label} onChange={e => set('label', e.target.value)} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Estimated ($)</label>
              <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={form.estimated_cost} onChange={e => set('estimated_cost', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Actual ($)</label>
              <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={form.actual_cost} onChange={e => set('actual_cost', e.target.value)} />
            </div>
          </div>
        </div>

        {err && <div style={{ color:'#f87171', fontSize:'0.8rem', marginTop:'0.75rem', display:'flex', gap:'0.25rem' }}><Icons.Alert />{err}</div>}

        <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
          <button className="btn btn-secondary" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex:2 }} disabled={!form.label || mut.isPending} onClick={() => mut.mutate()}>
            {mut.isPending ? <><div className="spinner"/>Adding…</> : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BudgetRow({ item, tripId }) {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [actual, setActual] = useState(item.actual_cost || '')
  const c = CAT_COLORS[item.category] || CAT_COLORS.other

  const updateMut = useMutation({
    mutationFn: () => budgetAPI.update(item.id, { actual_cost: actual ? parseFloat(actual) : null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budget', tripId] }); setEditing(false) },
  })

  const removeMut = useMutation({
    mutationFn: () => budgetAPI.remove(item.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget', tripId] }),
  })

  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', borderBottom:'1px solid var(--border-subtle)' }}>
      <span style={{ padding:'0.2rem 0.6rem', borderRadius:'9999px', fontSize:'0.7rem', fontWeight:700, textTransform:'capitalize', background:c.bg, color:c.color, border:`1px solid ${c.color}30`, flexShrink:0 }}>
        {item.category}
      </span>
      <span style={{ flex:1, fontSize:'0.9rem', color:'var(--text-primary)' }}>{item.label}</span>
      <span style={{ fontSize:'0.875rem', color:'var(--text-secondary)', minWidth:'70px', textAlign:'right' }}>
        ${Number(item.estimated_cost).toFixed(2)}
      </span>
      {editing ? (
        <div style={{ display:'flex', gap:'0.375rem', alignItems:'center' }}>
          <input type="number" min="0" step="0.01" value={actual} onChange={e => setActual(e.target.value)}
            style={{ width:'80px', padding:'0.25rem 0.5rem', background:'rgba(255,255,255,0.08)', border:'1px solid var(--border-default)', borderRadius:'var(--radius-sm)', color:'var(--text-primary)', fontSize:'0.8125rem' }} />
          <button className="btn btn-ghost btn-sm" onClick={() => updateMut.mutate()} style={{ padding:'0.25rem', color:'var(--color-teal-400)' }}><Icons.Check /></button>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} style={{ padding:'0.25rem' }}>✕</button>
        </div>
      ) : (
        <span style={{ fontSize:'0.875rem', minWidth:'70px', textAlign:'right', color: item.actual_cost ? 'var(--color-teal-400)' : 'var(--text-muted)' }}>
          {item.actual_cost ? `$${Number(item.actual_cost).toFixed(2)}` : '—'}
        </span>
      )}
      {!editing && (
        <div style={{ display:'flex', gap:'0.25rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)} style={{ padding:'0.25rem' }}><Icons.Edit /></button>
          <button className="btn btn-ghost btn-sm" onClick={() => removeMut.mutate()} style={{ padding:'0.25rem', color:'#f87171' }} disabled={removeMut.isPending}><Icons.Trash /></button>
        </div>
      )}
    </div>
  )
}

export default function Budget() {
  const { id: tripId } = useParams()
  const navigate = useNavigate()
  const [showAdd, setShowAdd] = useState(false)

  const { data: trip } = useQuery({ queryKey: ['trip', tripId], queryFn: () => tripAPI.get(tripId).then(r => r.data) })
  const { data, isLoading } = useQuery({ queryKey: ['budget', tripId], queryFn: () => budgetAPI.list(tripId).then(r => r.data) })

  const items = data?.items || []
  const summary = data?.summary || { total_estimated: 0, total_actual: 0, by_category: {} }
  const totalBudget = Number(trip?.total_budget || 0)
  const spent = summary.total_actual
  const estimated = summary.total_estimated
  const remaining = totalBudget - spent

  // Group items by category for display
  const byCategory = {}
  items.forEach(i => { if (!byCategory[i.category]) byCategory[i.category] = []; byCategory[i.category].push(i) })

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ background:'rgba(15,22,41,0.85)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border-subtle)', position:'sticky', top:0, zIndex:10 }}>
        <div className="page-container" style={{ padding:'1rem 1.5rem', display:'flex', alignItems:'center', gap:'1rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/trips/${tripId}`)} style={{ gap:'0.375rem' }}><Icons.Back />Itinerary</button>
          <div style={{ width:'1px', height:'20px', background:'var(--border-subtle)' }} />
          <h1 className="text-headline" style={{ flex:1 }}>Budget</h1>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Icons.Plus /> Add Item</button>
        </div>
      </div>

      <div className="page-container" style={{ padding:'1.5rem', display:'grid', gridTemplateColumns:'280px 1fr', gap:'1.5rem', alignItems:'start' }}>

        {/* ── Summary sidebar ─────────────────────────────────── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem', position:'sticky', top:'5rem' }}>
          {/* Total budget card */}
          <div className="card" style={{ padding:'1.25rem' }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.5rem' }}>Total Budget</div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.75rem', color:'var(--text-primary)' }}>
              {totalBudget > 0 ? `$${totalBudget.toLocaleString()}` : '—'}
            </div>
            {totalBudget > 0 && (
              <>
                <div style={{ marginTop:'1rem', height:'6px', background:'rgba(255,255,255,0.08)', borderRadius:'9999px', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct(spent, totalBudget)}%`, background: remaining < 0 ? '#ef4444' : 'var(--gradient-accent)', borderRadius:'9999px', transition:'width 0.4s' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:'0.5rem', fontSize:'0.75rem' }}>
                  <span style={{ color: remaining < 0 ? '#f87171' : 'var(--color-teal-400)' }}>
                    {remaining < 0 ? `Over by $${Math.abs(remaining).toFixed(0)}` : `$${remaining.toFixed(0)} left`}
                  </span>
                  <span style={{ color:'var(--text-muted)' }}>{pct(spent, totalBudget)}% used</span>
                </div>
              </>
            )}
          </div>

          {/* Estimated vs Actual */}
          <div className="card" style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'0.875rem' }}>
            {[{ label:'Estimated', value:estimated, color:'var(--color-coral-400)' }, { label:'Actual Spent', value:spent, color:'var(--color-teal-400)' }].map(({ label, value, color }) => (
              <div key={label}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.25rem' }}>
                  <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:700, color }}>${value.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* By category breakdown */}
          <div className="card" style={{ padding:'1.25rem' }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.875rem' }}>By Category</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
              {Object.entries(summary.by_category).map(([cat, vals]) => {
                const c = CAT_COLORS[cat] || CAT_COLORS.other
                return (
                  <div key={cat}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.25rem' }}>
                      <span style={{ fontSize:'0.8rem', color:c.color, textTransform:'capitalize', fontWeight:600 }}>{cat}</span>
                      <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>${vals.estimated.toFixed(0)}</span>
                    </div>
                    <div style={{ height:'4px', background:'rgba(255,255,255,0.06)', borderRadius:'9999px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct(vals.estimated, estimated)}%`, background:c.bar, borderRadius:'9999px' }} />
                    </div>
                  </div>
                )
              })}
              {Object.keys(summary.by_category).length === 0 && (
                <div style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>No items yet</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Items list ──────────────────────────────────────── */}
        <div>
          {isLoading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="spinner" style={{ width:'1.5rem', height:'1.5rem' }} /></div>
          ) : items.length === 0 ? (
            <div className="card" style={{ padding:'3rem', textAlign:'center' }}>
              <p style={{ color:'var(--text-muted)', marginBottom:'1rem' }}>No budget items yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Icons.Plus /> Add First Item</button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {/* Column headers */}
              <div style={{ display:'flex', gap:'0.75rem', padding:'0 1rem', fontSize:'0.75rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                <span style={{ flex:1 }}>Item</span>
                <span style={{ minWidth:'70px', textAlign:'right' }}>Estimated</span>
                <span style={{ minWidth:'70px', textAlign:'right' }}>Actual</span>
                <span style={{ width:'56px' }} />
              </div>

              {Object.entries(byCategory).map(([cat, catItems]) => (
                <div key={cat} className="card" style={{ overflow:'hidden' }}>
                  <div style={{ padding:'0.625rem 1rem', background:'rgba(255,255,255,0.02)', borderBottom:'1px solid var(--border-subtle)', fontSize:'0.75rem', fontWeight:700, textTransform:'capitalize', color: (CAT_COLORS[cat]||CAT_COLORS.other).color }}>
                    {cat}
                  </div>
                  {catItems.map(item => <BudgetRow key={item.id} item={item} tripId={tripId} />)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Responsive */}
      <style>{`@media(max-width:760px){.page-container{grid-template-columns:1fr !important;}}`}</style>
      {showAdd && <AddItemModal tripId={tripId} onClose={() => setShowAdd(false)} />}
    </div>
  )
}
