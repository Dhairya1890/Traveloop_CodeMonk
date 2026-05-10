import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notesAPI, tripAPI, stopAPI } from '../api/api'

const Icons = {
  Back:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Plus:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>,
  Edit:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Check: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  MapPin: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
}

function fmt(d) {
  return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' })
}

function fmtShort(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric' })
}

function NoteCard({ note, tripId, stops }) {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(note.content)

  const updateMut = useMutation({
    mutationFn: () => notesAPI.update(note.id, { content }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes', tripId] }); setEditing(false) },
  })
  const removeMut = useMutation({
    mutationFn: () => notesAPI.remove(note.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', tripId] }),
  })

  const linkedStop = stops?.find(s => s.id === note.stop_id)

  return (
    <div className="card" style={{ padding:'1.125rem 1.25rem', display:'flex', flexDirection:'column', gap:'0.625rem' }}>
      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          {linkedStop && (
            <span style={{ display:'flex', alignItems:'center', gap:'0.25rem', padding:'0.15rem 0.5rem', borderRadius:'9999px', fontSize:'0.7rem', fontWeight:600, background:'rgba(255,107,69,0.1)', color:'var(--color-coral-400)', border:'1px solid rgba(255,107,69,0.25)' }}>
              <Icons.MapPin />{linkedStop.City?.name || 'Stop'} · {fmtShort(linkedStop.arrival_date)}
            </span>
          )}
          <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{fmt(note.created_at)}</span>
        </div>
        <div style={{ display:'flex', gap:'0.25rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(p => !p)} style={{ padding:'0.25rem' }}><Icons.Edit /></button>
          <button className="btn btn-ghost btn-sm" onClick={() => removeMut.mutate()} style={{ padding:'0.25rem', color:'#f87171' }} disabled={removeMut.isPending}><Icons.Trash /></button>
        </div>
      </div>

      {/* Content */}
      {editing ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
          <textarea
            autoFocus
            rows={4}
            className="input"
            style={{ resize:'vertical', fontSize:'0.9rem', lineHeight:1.65 }}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <div style={{ display:'flex', gap:'0.5rem', justifyContent:'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setContent(note.content); setEditing(false) }}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={() => updateMut.mutate()} disabled={!content.trim() || updateMut.isPending}>
              {updateMut.isPending ? 'Saving…' : <><Icons.Check /> Save</>}
            </button>
          </div>
        </div>
      ) : (
        <p style={{ fontSize:'0.9375rem', color:'var(--text-secondary)', lineHeight:1.7, whiteSpace:'pre-wrap', margin:0 }}>
          {note.content}
        </p>
      )}
    </div>
  )
}

export default function TripNotes() {
  const { id: tripId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [content, setContent] = useState('')
  const [stopId, setStopId] = useState('')
  const [composing, setComposing] = useState(false)

  const { data: trip } = useQuery({ queryKey: ['trip', tripId], queryFn: () => tripAPI.get(tripId).then(r => r.data) })
  const { data: notes = [], isLoading } = useQuery({ queryKey: ['notes', tripId], queryFn: () => notesAPI.list(tripId).then(r => r.data) })
  const { data: stops = [] } = useQuery({ queryKey: ['stops', tripId], queryFn: () => stopAPI.listByTrip(tripId).then(r => r.data) })

  const createMut = useMutation({
    mutationFn: () => notesAPI.create(tripId, { content: content.trim(), stop_id: stopId || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes', tripId] }); setContent(''); setStopId(''); setComposing(false) },
  })

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ background:'rgba(15,22,41,0.85)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border-subtle)', position:'sticky', top:0, zIndex:10 }}>
        <div className="page-container" style={{ padding:'1rem 1.5rem', display:'flex', alignItems:'center', gap:'1rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/trips/${tripId}`)} style={{ gap:'0.375rem' }}><Icons.Back />Itinerary</button>
          <div style={{ width:'1px', height:'20px', background:'var(--border-subtle)' }} />
          <h1 className="text-headline" style={{ flex:1 }}>
            Notes
            {notes.length > 0 && <span style={{ fontSize:'0.8125rem', fontWeight:400, color:'var(--text-muted)', marginLeft:'0.5rem' }}>· {notes.length}</span>}
          </h1>
          <button className="btn btn-primary btn-sm" onClick={() => setComposing(p => !p)}>
            <Icons.Plus /> New Note
          </button>
        </div>
      </div>

      <div className="page-container" style={{ padding:'1.5rem', maxWidth:'760px' }}>

        {/* Compose box */}
        {composing && (
          <div className="card animate-scale-in" style={{ padding:'1.25rem', marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.9375rem', marginBottom:'1rem', color:'var(--text-primary)' }}>New Note</h3>

            {/* Optional stop link */}
            {stops.length > 0 && (
              <div className="form-group" style={{ marginBottom:'0.875rem' }}>
                <label className="form-label">Link to stop (optional)</label>
                <select className="input select" value={stopId} onChange={e => setStopId(e.target.value)}>
                  <option value="">General trip note</option>
                  {stops.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.City?.name} · {fmtShort(s.arrival_date)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <textarea
              autoFocus
              rows={5}
              className="input"
              placeholder="Write anything — tips, reminders, observations, memories…"
              style={{ resize:'vertical', lineHeight:1.7, fontSize:'0.9375rem', marginBottom:'0.875rem' }}
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && content.trim()) createMut.mutate() }}
            />

            <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Ctrl+Enter to save</span>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => { setContent(''); setComposing(false) }}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={() => createMut.mutate()} disabled={!content.trim() || createMut.isPending}>
                  {createMut.isPending ? 'Saving…' : <><Icons.Check /> Save Note</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes list */}
        {isLoading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="spinner" style={{ width:'1.5rem', height:'1.5rem' }} /></div>
        ) : notes.length === 0 ? (
          <div className="card" style={{ padding:'3.5rem', textAlign:'center' }}>
            <p style={{ color:'var(--text-muted)', marginBottom:'1rem', fontSize:'0.9375rem' }}>
              No notes yet. Capture your thoughts, reminders, and memories.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setComposing(true)}><Icons.Plus /> Write a note</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {notes.map(note => <NoteCard key={note.id} note={note} tripId={tripId} stops={stops} />)}
          </div>
        )}
      </div>
    </div>
  )
}
