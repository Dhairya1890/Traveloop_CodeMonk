import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { tripAPI } from '../api/api'

/* ── Icons ───────────────────────────────────────────────────── */
const Icons = {
  Back: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  Text: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Dollar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Image: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Globe: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Alert: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
}

/* ── Helpers ─────────────────────────────────────────────────── */
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function tripDays(start, end) {
  if (!start || !end) return null
  const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : null
}

/* ── Section label ───────────────────────────────────────────── */
function SectionLabel({ icon, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      marginBottom: '0.75rem',
      paddingBottom: '0.625rem',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <span style={{ color: 'var(--color-coral-500)' }}>{icon}</span>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 600,
        fontSize: '0.875rem', color: 'var(--text-secondary)',
        letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>{children}</span>
    </div>
  )
}

/* ── Live Preview Panel ──────────────────────────────────────── */
function PreviewPanel({ values }) {
  const { title, start_date, end_date, description, cover_photo, total_budget, is_public, status } = values
  const days = tripDays(start_date, end_date)
  const coverStyle = cover_photo
    ? { background: `url(${cover_photo}) center/cover no-repeat` }
    : { background: 'linear-gradient(135deg, var(--color-navy-700) 0%, var(--color-coral-600) 100%)' }

  return (
    <div style={{ position: 'sticky', top: '6rem' }}>
      <p style={{
        fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        marginBottom: '1rem',
      }}>Live Preview</p>

      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Cover */}
        <div style={{ height: '180px', position: 'relative', ...coverStyle }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(6,13,31,0.75) 0%, transparent 55%)',
          }} />

          {/* Status chip */}
          <div style={{
            position: 'absolute', top: '0.75rem', left: '0.75rem',
            padding: '0.2rem 0.6rem',
            background: 'rgba(251,191,36,0.15)', color: '#fbbf24',
            border: '1px solid rgba(251,191,36,0.35)',
            borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700,
            backdropFilter: 'blur(8px)', textTransform: 'capitalize',
          }}>
            {status || 'planning'}
          </div>

          {is_public && (
            <div style={{
              position: 'absolute', top: '0.75rem', right: '0.75rem',
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.2rem 0.5rem',
              background: 'rgba(45,212,191,0.15)', color: 'var(--color-teal-400)',
              border: '1px solid rgba(45,212,191,0.3)',
              borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
              backdropFilter: 'blur(8px)',
            }}>
              <Icons.Globe /> Public
            </div>
          )}

          {days && (
            <div style={{
              position: 'absolute', bottom: '0.75rem', left: '0.75rem',
              fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)',
            }}>
              {days} day{days !== 1 ? 's' : ''}
            </div>
          )}

          {!cover_photo && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.2)',
            }}>
              <Icons.MapPin />
            </div>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: '1.125rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '1.0625rem', color: title ? 'var(--text-primary)' : 'var(--text-muted)',
          }}>
            {title || 'Your trip title…'}
          </h3>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            color: 'var(--text-muted)', fontSize: '0.8125rem',
          }}>
            <Icons.Calendar />
            {start_date && end_date
              ? `${fmtDate(start_date)} — ${fmtDate(end_date)}`
              : 'Travel dates…'}
          </div>

          {description && (
            <p style={{
              fontSize: '0.8125rem', color: 'var(--text-secondary)',
              lineHeight: 1.55, marginTop: '0.25rem',
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {description}
            </p>
          )}

          {total_budget > 0 && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
              Budget: <span style={{ color: 'var(--color-amber-400)', fontWeight: 600 }}>
                ${Number(total_budget).toLocaleString()}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Tip */}
      <p style={{
        marginTop: '1rem', fontSize: '0.775rem',
        color: 'var(--text-muted)', lineHeight: 1.6,
      }}>
        After creating, you can add cities, activities, budget items, and more from the itinerary view.
      </p>
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function CreateTrip() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      cover_photo: '',
      total_budget: '',
      is_public: false,
      status: 'planning',
    },
  })

  const values = watch()

  const mutation = useMutation({
    mutationFn: (data) => tripAPI.create({
      ...data,
      total_budget: data.total_budget ? Number(data.total_budget) : 0,
    }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      navigate(`/trips/${data.id}`)
    },
    onError: (err) => {
      setServerError(
        err?.response?.data?.error
        || err?.response?.data?.message
        || 'Failed to create trip. Please try again.'
      )
    },
  })

  const onSubmit = (data) => {
    setServerError('')
    mutation.mutate(data)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(15,22,41,0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div className="page-container" style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '1rem 1.5rem',
        }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/trips')}
            style={{ gap: '0.375rem' }}
          >
            <Icons.Back /> Back
          </button>
          <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)' }} />
          <h1 className="text-title">Plan a New Trip</h1>
        </div>
      </div>

      {/* ── Two-column layout ────────────────────────────────── */}
      <div className="page-container" style={{
        padding: '2rem 1.5rem',
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '2.5rem',
        alignItems: 'start',
      }}>

        {/* ── Form ────────────────────────────────────────────── */}
        <form id="create-trip-form" onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* ── Section: Basics ─────────────────────────────── */}
          <div className="card-flat" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <SectionLabel icon={<Icons.Text />}>Trip Details</SectionLabel>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Title */}
              <div className="form-group">
                <label className="form-label" htmlFor="trip-title">
                  Trip name <span style={{ color: 'var(--color-coral-500)' }}>*</span>
                </label>
                <input
                  id="trip-title"
                  type="text"
                  placeholder="e.g. Summer in Southeast Asia"
                  className={`input ${errors.title ? 'input-error' : ''}`}
                  {...register('title', {
                    required: 'Trip name is required',
                    minLength: { value: 2, message: 'At least 2 characters' },
                    maxLength: { value: 200, message: 'Max 200 characters' },
                  })}
                />
                {errors.title && (
                  <span className="form-error"><Icons.Alert />{errors.title.message}</span>
                )}
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="trip-desc">Description</label>
                <textarea
                  id="trip-desc"
                  rows={3}
                  placeholder="What's this trip about? Any goals or highlights?"
                  className="input"
                  style={{ resize: 'vertical', minHeight: '80px', lineHeight: 1.6 }}
                  {...register('description', {
                    maxLength: { value: 1000, message: 'Max 1000 characters' },
                  })}
                />
                {errors.description && (
                  <span className="form-error"><Icons.Alert />{errors.description.message}</span>
                )}
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label" htmlFor="trip-status">Status</label>
                <select
                  id="trip-status"
                  className="input"
                  style={{ cursor: 'pointer' }}
                  {...register('status')}
                >
                  <option value="planning">Planning</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Section: Dates ──────────────────────────────── */}
          <div className="card-flat" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <SectionLabel icon={<Icons.Calendar />}>Travel Dates</SectionLabel>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Start date */}
              <div className="form-group">
                <label className="form-label" htmlFor="trip-start">
                  Start date <span style={{ color: 'var(--color-coral-500)' }}>*</span>
                </label>
                <input
                  id="trip-start"
                  type="date"
                  min={today}
                  className={`input ${errors.start_date ? 'input-error' : ''}`}
                  style={{ colorScheme: 'dark' }}
                  {...register('start_date', { required: 'Start date is required' })}
                />
                {errors.start_date && (
                  <span className="form-error"><Icons.Alert />{errors.start_date.message}</span>
                )}
              </div>

              {/* End date */}
              <div className="form-group">
                <label className="form-label" htmlFor="trip-end">
                  End date <span style={{ color: 'var(--color-coral-500)' }}>*</span>
                </label>
                <input
                  id="trip-end"
                  type="date"
                  min={values.start_date || today}
                  className={`input ${errors.end_date ? 'input-error' : ''}`}
                  style={{ colorScheme: 'dark' }}
                  {...register('end_date', {
                    required: 'End date is required',
                    validate: (v) =>
                      !values.start_date || v >= values.start_date
                        ? true
                        : 'End date must be after start date',
                  })}
                />
                {errors.end_date && (
                  <span className="form-error"><Icons.Alert />{errors.end_date.message}</span>
                )}
              </div>
            </div>

            {/* Duration pill */}
            {tripDays(values.start_date, values.end_date) && (
              <div style={{
                marginTop: '0.875rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.875rem',
                background: 'rgba(255,107,69,0.1)', color: 'var(--color-coral-400)',
                border: '1px solid rgba(255,107,69,0.25)',
                borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 600,
              }}>
                <Icons.Calendar />
                {tripDays(values.start_date, values.end_date)} day trip
              </div>
            )}
          </div>

          {/* ── Section: Budget & Cover ──────────────────────── */}
          <div className="card-flat" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <SectionLabel icon={<Icons.Dollar />}>Budget & Cover</SectionLabel>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Budget */}
              <div className="form-group">
                <label className="form-label" htmlFor="trip-budget">Total budget (USD)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500,
                    pointerEvents: 'none',
                  }}>$</span>
                  <input
                    id="trip-budget"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`input ${errors.total_budget ? 'input-error' : ''}`}
                    style={{ paddingLeft: '1.75rem' }}
                    {...register('total_budget', {
                      min: { value: 0, message: 'Budget cannot be negative' },
                    })}
                  />
                </div>
                {errors.total_budget && (
                  <span className="form-error"><Icons.Alert />{errors.total_budget.message}</span>
                )}
              </div>

              {/* Cover photo URL */}
              <div className="form-group">
                <label className="form-label" htmlFor="trip-cover">Cover photo URL</label>
                <div className="input-icon-wrap">
                  <span className="icon-left"><Icons.Image /></span>
                  <input
                    id="trip-cover"
                    type="url"
                    placeholder="https://images.unsplash.com/…"
                    className="input has-icon-left"
                    {...register('cover_photo')}
                  />
                </div>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Paste any image URL — Unsplash works great.
                </p>
              </div>
            </div>
          </div>

          {/* ── Section: Visibility ──────────────────────────── */}
          <div className="card-flat" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
            <SectionLabel icon={<Icons.Globe />}>Visibility</SectionLabel>

            <Controller
              name="is_public"
              control={control}
              render={({ field }) => (
                <label
                  htmlFor="trip-public"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', padding: '0.75rem 1rem',
                    background: field.value ? 'rgba(45,212,191,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${field.value ? 'rgba(45,212,191,0.25)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.2s var(--ease-out)',
                  }}
                >
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontWeight: 600,
                      fontSize: '0.9375rem', color: 'var(--text-primary)',
                    }}>
                      Make trip public
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                      Anyone with the link can view your itinerary
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <div
                    id="trip-public"
                    role="switch"
                    aria-checked={field.value}
                    onClick={() => field.onChange(!field.value)}
                    style={{
                      width: '44px', height: '24px', flexShrink: 0,
                      borderRadius: '9999px',
                      background: field.value
                        ? 'var(--gradient-accent)'
                        : 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      position: 'relative', cursor: 'pointer',
                      transition: 'background 0.25s var(--ease-out)',
                    }}
                  >
                    <div style={{
                      width: '18px', height: '18px',
                      background: '#fff',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '2px',
                      left: field.value ? '22px' : '2px',
                      transition: 'left 0.25s var(--ease-spring)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                    }} />
                  </div>
                </label>
              )}
            />
          </div>

          {/* ── Server error ─────────────────────────────────── */}
          {serverError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem 1rem', marginBottom: '1.25rem',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem', color: '#f87171',
            }}>
              <Icons.Alert />{serverError}
            </div>
          )}

          {/* ── Actions ──────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/trips')}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              id="create-trip-submit"
              type="submit"
              disabled={mutation.isPending}
              className="btn btn-primary"
              style={{ flex: 2 }}
            >
              {mutation.isPending
                ? <><div className="spinner" /> Creating trip…</>
                : 'Create Trip'}
            </button>
          </div>
        </form>

        {/* ── Preview ─────────────────────────────────────────── */}
        <PreviewPanel values={values} />
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 860px) {
          #create-trip-form { grid-column: 1 / -1 !important; }
          .page-container > div:last-child { display: none !important; }
          .page-container { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
