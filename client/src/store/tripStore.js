import { create } from 'zustand'

/**
 * Zustand store for client-side trip state.
 * Server state (fetching/caching) is handled by TanStack Query.
 * This store manages UI state and the currently active trip.
 */
const useTripStore = create((set, get) => ({
  /* ── Active trip ──────────────────────────────────────────── */
  activeTrip: null,
  setActiveTrip: (trip) => set({ activeTrip: trip }),
  clearActiveTrip: () => set({ activeTrip: null }),

  /* ── Active stop (for itinerary builder) ──────────────────── */
  activeStopId: null,
  setActiveStopId: (id) => set({ activeStopId: id }),

  /* ── Stop order cache (optimistic reorder) ────────────────── */
  stopOrder: [],
  setStopOrder: (stops) => set({ stopOrder: stops }),
  reorderStops: (fromIndex, toIndex) => {
    const stops = [...get().stopOrder]
    const [moved] = stops.splice(fromIndex, 1)
    stops.splice(toIndex, 0, moved)
    set({ stopOrder: stops })
  },

  /* ── City search filter ───────────────────────────────────── */
  cityFilters: { q: '', country: '' },
  setCityFilters: (filters) =>
    set((s) => ({ cityFilters: { ...s.cityFilters, ...filters } })),
  resetCityFilters: () => set({ cityFilters: { q: '', country: '' } }),

  /* ── Activity search filter ───────────────────────────────── */
  activityFilters: { q: '', type: '', city_id: null, maxCost: '' },
  setActivityFilters: (filters) =>
    set((s) => ({ activityFilters: { ...s.activityFilters, ...filters } })),
  resetActivityFilters: () =>
    set({ activityFilters: { q: '', type: '', city_id: null, maxCost: '' } }),

  /* ── Packing quick-state ──────────────────────────────────── */
  packingFilter: 'all', // 'all' | 'packed' | 'unpacked'
  setPackingFilter: (f) => set({ packingFilter: f }),

  /* ── UI helpers ───────────────────────────────────────────── */
  sidebarOpen: false,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  itineraryViewMode: 'timeline', // 'timeline' | 'calendar'
  setItineraryViewMode: (m) => set({ itineraryViewMode: m }),
}))

export default useTripStore
