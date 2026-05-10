import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetAPI, tripAPI } from '../api/api'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'

const CATEGORIES = ['transport', 'stay', 'food', 'activity', 'shopping', 'other']
const CAT_COLORS = {
  transport: { bg: 'rgba(45,212,191,0.12)',  color: '#2dd4bf', hex: '#2dd4bf' },
  stay:      { bg: 'rgba(99,102,241,0.15)',  color: '#a5b4fc', hex: '#6366f1' },
  food:      { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c', hex: '#fb923c' },
  activity:  { bg: 'rgba(255,107,69,0.12)',  color: '#ff6b45', hex: '#ff6b45' },
  shopping:  { bg: 'rgba(244,114,182,0.12)', color: '#f472b6', hex: '#f472b6' },
  other:     { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', hex: '#94a3b8' },
}

const Icons = {
  Back:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Plus:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Edit:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Check: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Alert: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
}

function pct(part, total) { return total ? Math.min(100, Math.round((part / total) * 100)) : 0 }

/* ── Add Item Modal ────────────────────────────────────────────── */
function AddItemModal({ tripId, onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ category: 'transport', label: '', estimated_cost: '', actual_cost: '' })
  const [err, setErr] = useState('')
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const mut = useMutation({
    mutationFn: () => budgetAPI.create(tripId, {
      category: form.category, label: form.label,
      estimated_cost: parseFloat(form.estimated_cost) || 0,
      actual_cost: form.actual_cost ? parseFloat(form.actual_cost) : null,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budget', tripId] }); onClose() },
    onError:   e => setErr(e?.response?.data?.error || 'Failed to add item'),
  })
  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)' }}>
      <div className="auth-card animate-scale-in" style={{ width:'100%', maxWidth:'440px', padding:'2rem', margin:'1rem' }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.125rem', marginBottom:'1.5rem' }}>Add Budget Item</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)} style={{ colorScheme:'dark' }}>
              {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform:'capitalize' }}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
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
            {mut.isPending ? <><div className="spinner" />Adding…</> : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Budget Row ───────────────────────────────────────────────── */
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
  const over = item.actual_cost && Number(item.actual_cost) > Number(item.estimated_cost)
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', borderBottom:'1px solid var(--border-subtle)' }}>
      <span style={{ padding:'0.2rem 0.6rem', borderRadius:'9999px', fontSize:'0.7rem', fontWeight:700, textTransform:'capitalize', background:c.bg, color:c.color, border:`1px solid ${c.color}30`, flexShrink:0 }}>{item.category}</span>
      <span style={{ flex:1, fontSize:'0.9rem', color:'var(--text-primary)' }}>{item.label}</span>
      <span style={{ fontSize:'0.875rem', color:'var(--text-secondary)', minWidth:'70px', textAlign:'right' }}>${Number(item.estimated_cost).toFixed(2)}</span>
      {editing ? (
        <div style={{ display:'flex', gap:'0.375rem', alignItems:'center' }}>
          <input type="number" min="0" step="0.01" value={actual} onChange={e => setActual(e.target.value)}
            style={{ width:'80px', padding:'0.25rem 0.5rem', background:'rgba(255,255,255,0.08)', border:'1px solid var(--border-default)', borderRadius:'var(--radius-sm)', color:'var(--text-primary)', fontSize:'0.8125rem' }} />
          <button className="btn btn-ghost btn-sm" onClick={() => updateMut.mutate()} style={{ padding:'0.25rem', color:'var(--color-teal-400)' }}><Icons.Check /></button>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} style={{ padding:'0.25rem' }}>✕</button>
        </div>
      ) : (
        <span style={{ fontSize:'0.875rem', minWidth:'70px', textAlign:'right', color: over ? '#f87171' : item.actual_cost ? 'var(--color-teal-400)' : 'var(--text-muted)', display:'flex', alignItems:'center', gap:'0.25rem', justifyContent:'flex-end' }}>
          {over && <Icons.Alert />}
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

/* ── Custom Donut Label ───────────────────────────────────────── */
const DonutLabel = ({ cx, cy, total }) => (
  <>
    <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--text-primary)" style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', fontWeight:800 }}>${Math.round(total).toLocaleString()}</text>
    <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-muted)" style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>estimated</text>
  </>
)

/* ── Custom Tooltip ───────────────────────────────────────────── */
const ChartTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-default)', borderRadius:'var(--radius-md)', padding:'0.625rem 0.875rem', fontSize:'0.8125rem' }}>
      <div style={{ fontWeight:600, color:'var(--text-primary)', textTransform:'capitalize', marginBottom:'0.25rem' }}>{payload[0].name}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.fill || p.color, display:'flex', justifyContent:'space-between', gap:'1rem' }}>
          <span>{p.dataKey === 'estimated' ? 'Est.' : 'Actual'}</span>
          <span style={{ fontWeight:700 }}>${Number(p.value).toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────────── */
export default function Budget() {
  const { id: tripId } = useParams()
  const navigate = useNavigate()
  const [showAdd, setShowAdd] = useState(false)

  const { data: trip } = useQuery({ queryKey:['trip', tripId], queryFn:() => tripAPI.get(tripId).then(r => r.data) })
  const { data, isLoading } = useQuery({ queryKey:['budget', tripId], queryFn:() => budgetAPI.list(tripId).then(r => r.data) })

  const items    = data?.items || []
  const summary  = data?.summary || { total_estimated:0, total_actual:0, by_category:{} }
  const totalBudget = Number(trip?.total_budget || 0)
  const estimated   = Number(summary.total_estimated || 0)
  const spent       = Number(summary.total_actual    || 0)
  const remaining   = totalBudget - spent
  const isOverBudget = totalBudget > 0 && spent > totalBudget
  const isOverEstimate = estimated > 0 && spent > estimated

  // Avg cost per day
  const tripDays = trip?.start_date && trip?.end_date
    ? Math.max(1, Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000))
    : null
  const avgPerDay = tripDays ? (estimated / tripDays) : null

  // Donut chart data
  const pieData = Object.entries(summary.by_category)
    .filter(([, v]) => v.estimated > 0)
    .map(([cat, v]) => ({ name: cat, value: Number(v.estimated), color: (CAT_COLORS[cat]||CAT_COLORS.other).hex }))

  // Bar chart data
  const barData = Object.entries(summary.by_category).map(([cat, v]) => ({
    name: cat.charAt(0).toUpperCase()+cat.slice(1),
    estimated: Number(v.estimated),
    actual: Number(v.actual || 0),
    fill: (CAT_COLORS[cat]||CAT_COLORS.other).hex,
  }))

  // Group items by category
  const byCategory = {}
  items.forEach(i => { if (!byCategory[i.category]) byCategory[i.category] = []; byCategory[i.category].push(i) })

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)' }}>

      {/* ── Sticky header ────────────────────────────────────── */}
      <div style={{ background:'rgba(15,22,41,0.92)', backdropFilter:'blur(14px)', borderBottom:'1px solid var(--border-subtle)', position:'sticky', top:0, zIndex:10 }}>
        <div className="page-container" style={{ padding:'1rem 1.5rem', display:'flex', alignItems:'center', gap:'1rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/trips/${tripId}`)} style={{ gap:'0.375rem' }}><Icons.Back />Itinerary</button>
          <div style={{ width:'1px', height:'20px', background:'var(--border-subtle)' }} />
          <h1 className="text-headline" style={{ flex:1 }}>Budget & Cost Breakdown</h1>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Icons.Plus /> Add Item</button>
        </div>
      </div>

      {/* ── Over-budget alert ─────────────────────────────────── */}
      {(isOverBudget || isOverEstimate) && (
        <div style={{ background: isOverBudget ? 'rgba(239,68,68,0.1)' : 'rgba(251,146,60,0.1)', borderBottom:`1px solid ${isOverBudget ? 'rgba(239,68,68,0.3)' : 'rgba(251,146,60,0.3)'}`, padding:'0.75rem 1.5rem', display:'flex', alignItems:'center', gap:'0.625rem' }}>
          <Icons.Alert />
          <span style={{ fontSize:'0.875rem', color: isOverBudget ? '#f87171' : '#fb923c', fontWeight:600 }}>
            {isOverBudget
              ? `Over budget by $${Math.abs(remaining).toFixed(2)} — you've spent more than your set budget.`
              : `Actual spend ($${spent.toFixed(2)}) exceeds estimated ($${estimated.toFixed(2)}).`}
          </span>
        </div>
      )}

      {/* ── Stats strip ───────────────────────────────────────── */}
      <div style={{ background:'var(--bg-surface)', borderBottom:'1px solid var(--border-subtle)' }}>
        <div className="page-container" style={{ padding:'1rem 1.5rem', display:'flex', gap:'2rem', flexWrap:'wrap' }}>
          {[
            { label:'Total Budget',  value: totalBudget > 0 ? `$${totalBudget.toLocaleString()}` : '—', color:'var(--text-primary)' },
            { label:'Estimated',     value: `$${estimated.toFixed(0)}`,  color:'var(--color-coral-400)' },
            { label:'Actual Spent',  value: `$${spent.toFixed(0)}`,      color:'var(--color-teal-400)' },
            { label:'Remaining',     value: totalBudget > 0 ? `$${remaining.toFixed(0)}` : '—', color: remaining < 0 ? '#f87171' : '#4ade80' },
            { label:'Avg / Day',     value: avgPerDay ? `$${avgPerDay.toFixed(0)}` : '—', color:'var(--text-secondary)' },
            { label:'Trip Length',   value: tripDays ? `${tripDays} days` : '—', color:'var(--text-secondary)' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em' }}>{label}</div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.1rem', color }}>{value}</div>
            </div>
          ))}
          {totalBudget > 0 && (
            <div style={{ marginLeft:'auto', alignSelf:'center', minWidth:'160px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:'4px' }}>
                <span>Budget used</span><span>{pct(spent, totalBudget)}%</span>
              </div>
              <div style={{ height:'6px', background:'rgba(255,255,255,0.08)', borderRadius:'9999px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pct(spent, totalBudget)}%`, background: isOverBudget ? '#ef4444' : 'var(--gradient-accent)', borderRadius:'9999px', transition:'width 0.5s' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="page-container" style={{ padding:'1.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', alignItems:'start' }}>

        {/* ── Donut chart ───────────────────────────────────── */}
        <div className="card" style={{ padding:'1.5rem' }}>
          <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'1rem' }}>Cost by Category</div>
          {pieData.length === 0 ? (
            <div style={{ height:'200px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:'0.875rem' }}>Add items to see breakdown</div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap' }}>
              <div style={{ width:200, height:200, flexShrink:0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={88} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                    </Pie>
                    <DonutLabel cx={100} cy={100} total={estimated} />
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', flex:1 }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:d.color, flexShrink:0 }} />
                    <span style={{ fontSize:'0.8125rem', color:'var(--text-secondary)', flex:1, textTransform:'capitalize' }}>{d.name}</span>
                    <span style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--text-primary)' }}>${d.value.toFixed(0)}</span>
                    <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{pct(d.value, estimated)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Bar chart ─────────────────────────────────────── */}
        <div className="card" style={{ padding:'1.5rem' }}>
          <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'1rem' }}>Estimated vs Actual</div>
          {barData.length === 0 ? (
            <div style={{ height:'200px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:'0.875rem' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top:4, right:8, left:-10, bottom:0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip content={<ChartTip />} cursor={{ fill:'rgba(255,255,255,0.04)' }} />
                <Legend wrapperStyle={{ fontSize:'0.75rem', color:'var(--text-muted)' }} />
                <Bar dataKey="estimated" name="Estimated" fill="rgba(255,107,69,0.5)"  radius={[4,4,0,0]} />
                <Bar dataKey="actual"    name="Actual"    fill="rgba(45,212,191,0.7)"  radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Items list ────────────────────────────────────────── */}
      <div className="page-container" style={{ padding:'0 1.5rem 2rem' }}>
        {isLoading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="spinner" style={{ width:'1.5rem', height:'1.5rem' }} /></div>
        ) : items.length === 0 ? (
          <div className="card" style={{ padding:'3rem', textAlign:'center' }}>
            <p style={{ color:'var(--text-muted)', marginBottom:'1rem' }}>No budget items yet. Add your first expense.</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Icons.Plus /> Add First Item</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'flex', gap:'0.75rem', padding:'0 1rem', fontSize:'0.75rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
              <span style={{ flex:1 }}>Item</span>
              <span style={{ minWidth:'70px', textAlign:'right' }}>Estimated</span>
              <span style={{ minWidth:'70px', textAlign:'right' }}>Actual</span>
              <span style={{ width:'56px' }} />
            </div>
            {Object.entries(byCategory).map(([cat, catItems]) => {
              const catEst = catItems.reduce((s,i) => s+Number(i.estimated_cost),0)
              const catAct = catItems.reduce((s,i) => s+Number(i.actual_cost||0),0)
              const catOver = catAct > catEst && catEst > 0
              const c = CAT_COLORS[cat] || CAT_COLORS.other
              return (
                <div key={cat} className="card" style={{ overflow:'hidden', border: catOver ? `1px solid rgba(239,68,68,0.3)` : undefined }}>
                  <div style={{ padding:'0.625rem 1rem', background:'rgba(255,255,255,0.02)', borderBottom:'1px solid var(--border-subtle)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'0.75rem', fontWeight:700, textTransform:'capitalize', color:c.color }}>{cat}</span>
                    <div style={{ display:'flex', gap:'1rem', fontSize:'0.75rem' }}>
                      <span style={{ color:'var(--text-muted)' }}>Est. <strong style={{ color:'var(--text-secondary)' }}>${catEst.toFixed(0)}</strong></span>
                      {catAct > 0 && <span style={{ color: catOver ? '#f87171' : 'var(--color-teal-400)' }}>Actual <strong>${catAct.toFixed(0)}</strong>{catOver && ' ▲'}</span>}
                    </div>
                  </div>
                  {catItems.map(item => <BudgetRow key={item.id} item={item} tripId={tripId} />)}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`@media(max-width:760px){.page-container[style*="1fr 1fr"]{grid-template-columns:1fr !important;}}`}</style>
      {showAdd && <AddItemModal tripId={tripId} onClose={() => setShowAdd(false)} />}
    </div>
  )
}
