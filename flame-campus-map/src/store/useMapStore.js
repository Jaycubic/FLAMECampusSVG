import { create } from 'zustand'

export const useMapStore = create((set, get) => ({
	// pan/zoom state in SVG space
	zoom: 1,
	minZoom: 0.5,
	maxZoom: 8,
	translateX: 0,
	translateY: 0,
	setZoom: (zoom) => set((s) => ({ zoom: Math.max(s.minZoom, Math.min(s.maxZoom, zoom)) })),
	setTranslate: (x, y) => set({ translateX: x, translateY: y }),
	fitToPoint: ({ x, y }, targetZoom = 2) => {
		const clampedZoom = Math.max(get().minZoom, Math.min(get().maxZoom, targetZoom))
		const centerX = window.innerWidth / 2
		const centerY = window.innerHeight / 2
		set({
			zoom: clampedZoom,
			translateX: centerX - x * clampedZoom,
			translateY: centerY - y * clampedZoom,
		})
	},
	zoomAtPoint: (clientX, clientY, nextZoom) => {
		const { zoom, translateX, translateY, minZoom, maxZoom } = get()
		const clamped = Math.max(minZoom, Math.min(maxZoom, nextZoom))
		const worldX = (clientX - translateX) / zoom
		const worldY = (clientY - translateY) / zoom
		const nextTx = clientX - worldX * clamped
		const nextTy = clientY - worldY * clamped
		set({ zoom: clamped, translateX: nextTx, translateY: nextTy })
	},

	// user location
	user: {
		lat: null,
		lng: null,
		x: null,
		y: null,
		accuracy: null,
	},
	setUser: (partial) => set((s) => ({ user: { ...s.user, ...partial } })),
	centerOnUser: () => set((s) => {
		if (s.user?.x == null || s.user?.y == null) return {}
		const targetZoom = Math.max(2, s.zoom)
		return {
			zoom: targetZoom,
			translateX: -s.user.x * targetZoom + window.innerWidth / 2,
			translateY: -s.user.y * targetZoom + window.innerHeight / 2,
		}
	}),

	// filters
	filters: { library: true, food: true, restroom: true, study: true, transport: true, gym: true, laundry: true },
	toggleFilter: (key) => set((s) => ({ filters: { ...s.filters, [key]: !s.filters[key] } })),

	// selection & drawer
	selected: null,
	setSelected: (item) => set({ selected: item }),
	closeSelected: () => set({ selected: null }),
}))