import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../api/api'
import api from '../api/api'

const Icons = {
  Users:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Trip:   () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2A1 1 0 0 0 3.9 7l3.5 3.5L3 14l1.5 1.5 4-1.5 1 4L11 19.5l.5-4 4 4 1.3-1.3z"/></svg>,
  Globe:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  MapPin: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Trash:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>,
  Shield: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Back:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Star:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  )
}

function UserRow({ user, onDelete }) {
  const [confirm, setConfirm] = useState(false)
  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <td style={{ padding: '0.875rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
          ) : (
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '0.875rem 1rem' }}>
        <span style={{
          padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize',
          background: user.role === 'admin' ? 'rgba(255,107,69,0.12)' : 'rgba(148,163,184,0.1)',
          color: user.role === 'admin' ? 'var(--color-coral-400)' : 'var(--text-muted)',
          border: `1px solid ${user.role === 'admin' ? 'rgba(255,107,69,0.3)' : 'var(--border-subtle)'}`,
        }}>
          {user.role === 'admin' && <Icons.Shield />} {user.role}
        </span>
      </td>
      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        {user.Trips?.length || 0} trips
      </td>
      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </td>
      <td style={{ padding: '0.875rem 1rem' }}>
        {user.role !== 'admin' && (
          confirm ? (
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button className="btn btn-sm" onClick={() => onDelete(user.id)} style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}>
                Confirm
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirm(false)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Cancel</button>
            </div>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirm(true)} style={{ padding: '0.375rem', color: '#f87171', opacity: 0.7 }}>
              <Icons.Trash />
            </button>
          )
        )}
      </td>
    </tr>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminAPI.stats().then(r => r.data),
  })

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminAPI.users().then(r => r.data),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ background: 'rgba(15,22,41,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="page-container" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ gap: '0.375rem' }}><Icons.Back />Dashboard</button>
          <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <span style={{ color: 'var(--color-coral-400)' }}><Icons.Shield /></span>
            <h1 className="text-headline">Admin Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ padding: '1.5rem 1.5rem 3rem' }}>

        {/* ── Stat cards ──────────────────────────────────────── */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[...Array(6)].map((_, i) => <div key={i} className="card skeleton" style={{ height: '88px' }} />)}
          </div>
        ) : stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <StatCard icon={<Icons.Users />}  label="Total Users"      value={stats.counts.users}        color="#a5b4fc" />
            <StatCard icon={<Icons.Trip />}   label="Total Trips"      value={stats.counts.trips}        color="#fb923c" />
            <StatCard icon={<Icons.Globe />}  label="Public Trips"     value={stats.counts.public_trips} color="#2dd4bf" />
            <StatCard icon={<Icons.MapPin />} label="Total Stops"      value={stats.counts.stops}        color="#ff6b45" />
            <StatCard icon={<Icons.Globe />}  label="Cities"           value={stats.counts.cities}       color="#86efac" />
            <StatCard icon={<Icons.Star />}   label="Activities"       value={stats.counts.activities}   color="#fbbf24" />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Users table ───────────────────────────────────── */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', flex: 1 }}>
                Users <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 400 }}>({users.length})</span>
              </h2>
              <input className="input" style={{ width: '200px', fontSize: '0.8125rem', padding: '0.375rem 0.625rem' }}
                placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {usersLoading ? (
              <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      {['User', 'Role', 'Trips', 'Joined', ''].map(h => (
                        <th key={h} style={{ padding: '0.625rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => <UserRow key={u.id} user={u} onDelete={(id) => deleteMut.mutate(id)} />)}
                    {filtered.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Top cities + recent trips ──────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Top Cities */}
            <div className="card" style={{ padding: '1.125rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Top Cities</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {stats?.top_cities?.map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span style={{ width: '18px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', color: i === 0 ? '#fbbf24' : 'var(--text-muted)' }}>#{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.country}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-coral-400)', fontWeight: 600 }}>{c.stop_count} stops</span>
                  </div>
                ))}
                {!stats?.top_cities?.length && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No data yet</div>}
              </div>
            </div>

            {/* Recent Trips */}
            <div className="card" style={{ padding: '1.125rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Recent Trips</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {stats?.recent_trips?.map(t => (
                  <div key={t.id} style={{ padding: '0.625rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      by {t.User?.name}
                      <span style={{ textTransform: 'capitalize', marginLeft: '0.375rem', color: t.status === 'ongoing' ? 'var(--color-teal-400)' : 'var(--text-muted)' }}>· {t.status}</span>
                    </div>
                  </div>
                ))}
                {!stats?.recent_trips?.length && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No trips yet</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.page-container [style*="grid-template-columns: 1fr 280px"]{grid-template-columns:1fr !important;}}`}</style>
    </div>
  )
}
