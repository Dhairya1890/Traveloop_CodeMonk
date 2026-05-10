import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/authContext'
import './App.css'

/* ── Pages ──────────────────────────────────────────────────── */
import Auth             from './pages/Login'
import Dashboard        from './pages/Dashboard'
import MyTrips          from './pages/MyTrips'
import CreateTrip       from './pages/CreateTrip'
import ItineraryView    from './pages/ItineraryView'
import ActivitySearch   from './pages/ActivitySearch'
import Budget           from './pages/Budget'
import PackingChecklist from './pages/PackingChecklist'
import TripNotes        from './pages/TripNotes'
import PublicItinerary  from './pages/PublicItinerary'
import Profile          from './pages/Proflie'
import AdminDashboard   from './pages/AdminDashboard'

/* ── TanStack Query client ───────────────────────────────────── */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:  1000 * 60 * 5,  // 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

/* ── Route Guards ────────────────────────────────────────────── */
function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <AppLoader />
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />
}

function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <AppLoader />
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}

function AdminRoute() {
  const { user, loading, isAuthenticated } = useAuth()
  if (loading) return <AppLoader />
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

/* ── Full-screen loader (shown while verifying token) ─────────── */
function AppLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      background: 'var(--bg-base)',
    }}>
      <div style={{
        width: '48px', height: '48px',
        background: 'var(--gradient-accent)',
        borderRadius: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulse-glow 2s ease-in-out infinite',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2A1 1 0 0 0 3.9 7l3.5 3.5L3 14l1.5 1.5 4-1.5 1 4L11 19.5l.5-4 4 4 1.3-1.3z"/>
        </svg>
      </div>
      <div className="spinner" style={{ width: '1.5rem', height: '1.5rem' }} />
    </div>
  )
}

/* ── App ──────────────────────────────────────────────────────── */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/share/:token" element={<PublicItinerary />} />

            {/* Auth only (redirect to dashboard if already logged in) */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/auth" element={<Auth />} />
            </Route>

            {/* Protected */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard"          element={<Dashboard />} />
              <Route path="/trips"              element={<MyTrips />} />
              <Route path="/trips/new"          element={<CreateTrip />} />
              <Route path="/trips/:id"          element={<ItineraryView />} />
              <Route path="/trips/:id/budget"   element={<Budget />} />
              <Route path="/trips/:id/packing"  element={<PackingChecklist />} />
              <Route path="/trips/:id/notes"    element={<TripNotes />} />
              <Route path="/activities"         element={<ActivitySearch />} />
              <Route path="/profile"            element={<Profile />} />
            </Route>

            {/* Admin */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
