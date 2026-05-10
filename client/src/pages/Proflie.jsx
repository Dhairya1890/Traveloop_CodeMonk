import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/authContext'
import api from '../api/api'

const Icons = {
  User:   () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Mail:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Lock:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Globe:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Image:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Check:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Logout: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Alert:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
}

const LANGS = [
  { code: 'en', label: '🇺🇸 English' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'ja', label: '🇯🇵 日本語' },
  { code: 'zh', label: '🇨🇳 中文' },
  { code: 'pt', label: '🇧🇷 Português' },
  { code: 'hi', label: '🇮🇳 हिन्दी' },
]

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [name, setName] = useState(user?.name || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '')
  const [lang, setLang] = useState(user?.language_pref || 'en')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')

  const profileMut = useMutation({
    mutationFn: () => api.patch('/auth/me', { name, avatar_url: avatarUrl, language_pref: lang }),
    onSuccess: (res) => {
      // Update local user in auth context if available
      setProfileMsg('Profile updated!')
      setProfileErr('')
      setTimeout(() => setProfileMsg(''), 3000)
      qc.invalidateQueries({ queryKey: ['auth-me'] })
    },
    onError: e => { setProfileErr(e?.response?.data?.error || 'Failed to update profile'); setProfileMsg('') },
  })

  const pwMut = useMutation({
    mutationFn: () => api.patch('/auth/password', { current_password: currentPw, new_password: newPw }),
    onSuccess: () => { setPwMsg('Password changed!'); setPwErr(''); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setTimeout(() => setPwMsg(''), 3000) },
    onError: e => { setPwErr(e?.response?.data?.error || 'Failed to change password'); setPwMsg('') },
  })

  const handlePwSubmit = () => {
    if (newPw !== confirmPw) return setPwErr('Passwords do not match')
    if (newPw.length < 6) return setPwErr('Password must be at least 6 characters')
    setPwErr(''); pwMut.mutate()
  }

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ background: 'rgba(15,22,41,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="page-container" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 className="text-headline" style={{ flex: 1 }}>Profile & Settings</h1>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <button className="btn btn-ghost btn-sm" onClick={logout} style={{ color: '#f87171', gap: '0.375rem' }}>
            <Icons.Logout /> Sign out
          </button>
        </div>
      </div>

      <div className="page-container" style={{ padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* ── Avatar sidebar ─────────────────────────────────── */}
        <div style={{ position: 'sticky', top: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-coral-500)' }} onError={e => { e.target.style.display='none' }} />
          ) : (
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff' }}>
              {initials}
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>{user?.name}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{user?.email}</div>
            {user?.role === 'admin' && (
              <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.15rem 0.625rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(255,107,69,0.15)', color: 'var(--color-coral-400)', border: '1px solid rgba(255,107,69,0.3)' }}>Admin</span>
            )}
          </div>
          {user?.role === 'admin' && (
            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => navigate('/admin')}>Admin Dashboard</button>
          )}
        </div>

        {/* ── Settings panels ────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Profile info */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icons.User /> Personal Info
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Icons.Mail /> Email</label>
                <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Icons.Image /> Avatar URL</label>
                <input className="input" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://…" />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Icons.Globe /> Language</label>
                <select className="input select" value={lang} onChange={e => setLang(e.target.value)}>
                  {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
            </div>

            {profileMsg && <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-teal-400)', fontSize: '0.875rem', marginTop: '0.875rem' }}><Icons.Check />{profileMsg}</div>}
            {profileErr && <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#f87171', fontSize: '0.875rem', marginTop: '0.875rem' }}><Icons.Alert />{profileErr}</div>}

            <button
              className="btn btn-primary"
              style={{ marginTop: '1.25rem' }}
              onClick={() => profileMut.mutate()}
              disabled={profileMut.isPending}
            >
              {profileMut.isPending ? <><div className="spinner" />Saving…</> : <><Icons.Check /> Save changes</>}
            </button>
          </div>

          {/* Change password */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icons.Lock /> Change Password
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="input" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Enter current password" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="At least 6 characters" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password"
                  onKeyDown={e => e.key === 'Enter' && handlePwSubmit()} />
              </div>
            </div>

            {pwMsg && <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-teal-400)', fontSize: '0.875rem', marginTop: '0.875rem' }}><Icons.Check />{pwMsg}</div>}
            {pwErr && <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#f87171', fontSize: '0.875rem', marginTop: '0.875rem' }}><Icons.Alert />{pwErr}</div>}

            <button
              className="btn btn-primary"
              style={{ marginTop: '1.25rem' }}
              onClick={handlePwSubmit}
              disabled={!currentPw || !newPw || !confirmPw || pwMut.isPending}
            >
              {pwMut.isPending ? <><div className="spinner" />Updating…</> : 'Update Password'}
            </button>
          </div>

          {/* Danger zone */}
          <div className="card" style={{ padding: '1.5rem', border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.03)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: '#f87171', marginBottom: '0.625rem' }}>Danger Zone</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Signing out will clear your session. Your data will remain intact.
            </p>
            <button className="btn btn-sm" onClick={logout} style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', gap: '0.375rem' }}>
              <Icons.Logout /> Sign out of all sessions
            </button>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:760px){.page-container[style*='grid-template-columns']{grid-template-columns:1fr !important;}}`}</style>
    </div>
  )
}
