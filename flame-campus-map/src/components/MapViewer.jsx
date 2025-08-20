import { useEffect, useMemo, useRef, useState } from 'react'
import { useGesture } from '@use-gesture/react'
import { motion, AnimatePresence } from 'framer-motion'
import { gpsToSvg, svgToGps } from '../utils/coords'
import { useMapStore } from '../store/useMapStore'
import resources from '../data/resources.json'
import { clusterPoints } from '../utils/cluster'
import InfoDrawer from './InfoDrawer'
import SearchBar from './SearchBar'
import FiltersBar from './FiltersBar'

const MAP_SVG_URL = new URL('../assets/FLAMECampusSVG/CampusMap.svg', import.meta.url).href

function useInlineSvg(url) {
	const [svgElement, setSvgElement] = useState(null)
	useEffect(() => {
		let aborted = false
		async function fetchSvg() {
			const res = await fetch(url)
			const text = await res.text()
			if (aborted) return
			const parser = new DOMParser()
			const doc = parser.parseFromString(text, 'image/svg+xml')
			const el = doc.documentElement
			el.setAttribute('preserveAspectRatio', 'xMinYMin meet')
			setSvgElement(el)
		}
		fetchSvg()
		return () => { aborted = true }
	}, [url])
	return svgElement
}

function useExpoSmoothing(value, alpha = 0.2) {
	const [smoothed, setSmoothed] = useState(value)
	useEffect(() => {
		setSmoothed((prev) => {
			if (!prev) return value
			return {
				...value,
				x: prev.x + alpha * (value.x - prev.x),
				y: prev.y + alpha * (value.y - prev.y),
			}
		})
	}, [value?.x, value?.y, alpha])
	return smoothed
}

function Marker({ x, y, color = '#1f6feb', onClick, children }) {
	return (
		<g transform={`translate(${x}, ${y})`} onClick={(e) => { e.stopPropagation(); onClick && onClick(e) }} style={{ cursor: 'pointer' }}>
			<motion.circle r={8} fill={color} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} />
			<motion.circle r={18} fill={color} opacity={0.2} animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
			{children}
		</g>
	)
}

export default function MapViewer() {
	const containerRef = useRef(null)
	const svgEl = useInlineSvg(MAP_SVG_URL)
	const isPanningRef = useRef(false)

	const { zoom, translateX, translateY, setTranslate, centerOnUser, zoomAtPoint, filters, setSelected } = useMapStore()

	// gestures
	useGesture(
		{
			onDragStart: () => {
				isPanningRef.current = true
			},
			onDrag: ({ offset: [ox, oy] }) => {
				setTranslate(ox, oy)
			},
			onDragEnd: ({ velocities: [vx, vy] }) => {
				const { translateX: tx, translateY: ty } = useMapStore.getState()
				const momentum = 260
				setTranslate(tx + vx * momentum, ty + vy * momentum)
				setTimeout(() => { isPanningRef.current = false }, 50)
			},
			onPinch: ({ origin: [clientX, clientY], delta: [d], event }) => {
				event.preventDefault()
				const next = Math.max(0.5, Math.min(8, zoom * (d > 0 ? 1.02 : 0.98)))
				zoomAtPoint(clientX, clientY, next)
			},
			onWheel: ({ event, delta: [, dy] }) => {
				event.preventDefault()
				const rect = containerRef.current.getBoundingClientRect()
				const clientX = event.clientX - rect.left
				const clientY = event.clientY - rect.top
				const next = zoom * (dy > 0 ? 0.9 : 1.1)
				zoomAtPoint(clientX, clientY, next)
			},
			onDoubleClick: ({ event }) => {
				event.preventDefault()
				const rect = containerRef.current.getBoundingClientRect()
				zoomAtPoint(event.clientX - rect.left, event.clientY - rect.top, Math.min(8, zoom * 1.6))
			},
		},
		{
			target: containerRef,
			wheel: { eventOptions: { passive: false } },
		}
	)

	function handleContainerClick(e) {
		if (isPanningRef.current) return
		const rect = containerRef.current.getBoundingClientRect()
		const clientX = e.clientX - rect.left
		const clientY = e.clientY - rect.top
		const worldX = (clientX - translateX) / zoom
		const worldY = (clientY - translateY) / zoom
		const { lat, lng } = svgToGps(worldX, worldY)
		navigator.clipboard?.writeText(`${lat.toFixed(7)}, ${lng.toFixed(7)}`)
	}

	// user geolocation
	useEffect(() => {
		if (!('geolocation' in navigator)) return
		const watchId = navigator.geolocation.watchPosition(
			(pos) => {
				const { latitude, longitude, accuracy } = pos.coords
				const { x, y } = gpsToSvg(latitude, longitude)
				useMapStore.getState().setUser({ lat: latitude, lng: longitude, x, y, accuracy })
			},
			(err) => {
				console.warn('geolocation error', err)
			},
			{ enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
		)
		return () => navigator.geolocation.clearWatch(watchId)
	}, [])

	const user = useMapStore((s) => s.user)
	const smoothedUser = useExpoSmoothing(user, 0.25)

	const resourcePoints = useMemo(() => resources.map((r) => ({ ...r, ...gpsToSvg(r.lat, r.lng) })), [])
	const filtered = resourcePoints.filter((r) => filters[r.type] !== false)
	const clustered = clusterPoints(filtered, zoom, 48)

	return (
		<div ref={containerRef} className="relative h-[100dvh] w-full overflow-hidden touch-none bg-white dark:bg-black" onClick={handleContainerClick}>
			<div className="absolute z-10 left-2 right-2 top-2 flex items-center gap-2">
				<SearchBar />
				<button className="rounded-full bg-white/90 dark:bg-zinc-900 px-3 py-2 shadow-soft border border-zinc-200 dark:border-zinc-800" onClick={(e) => { e.stopPropagation(); centerOnUser() }}>Center on me</button>
			</div>
			<div className="absolute z-10 left-0 right-0 bottom-16">
				<FiltersBar />
			</div>
			<div className="absolute z-10 right-2 bottom-2 flex flex-col gap-2">
				<button aria-label="Zoom in" className="rounded-full bg-white/90 dark:bg-zinc-900 w-10 h-10 shadow-soft border border-zinc-200 dark:border-zinc-800" onClick={(e) => { e.stopPropagation(); useMapStore.getState().zoomAtPoint(window.innerWidth/2, window.innerHeight/2, Math.min(8, zoom * 1.2)) }}>+</button>
				<button aria-label="Zoom out" className="rounded-full bg-white/90 dark:bg-zinc-900 w-10 h-10 shadow-soft border border-zinc-200 dark:border-zinc-800" onClick={(e) => { e.stopPropagation(); useMapStore.getState().zoomAtPoint(window.innerWidth/2, window.innerHeight/2, Math.max(0.5, zoom / 1.2)) }}>-</button>
			</div>
			<motion.div className="absolute inset-0 will-change-transform" style={{ transformOrigin: '0 0' }} animate={{ x: translateX, y: translateY, scale: zoom }} transition={{ type: 'spring', stiffness: 160, damping: 26 }}>
				{svgEl && (
					<div dangerouslySetInnerHTML={{ __html: svgEl.outerHTML }} />
				)}
				<svg className="absolute left-0 top-0 overflow-visible">
					<AnimatePresence>
						{smoothedUser?.x != null && smoothedUser?.y != null && (
							<Marker x={smoothedUser.x} y={smoothedUser.y} color="#22c55e" />
						)}
					</AnimatePresence>
					{clustered.map((c) => (
						c.type === 'cluster' ? (
							<g key={`c-${c.x}-${c.y}`} transform={`translate(${c.x}, ${c.y})`}>
								<motion.circle r={16} fill="#0ea5e9" initial={{ scale: 0.8 }} animate={{ scale: 1 }} />
								<text x={0} y={4} fontSize={12} textAnchor="middle" fill="#fff">{c.count}</text>
							</g>
						) : (
							<Marker key={c.id} x={c.x} y={c.y} color={c.type === 'food' ? '#f59e0b' : c.type === 'library' ? '#3b82f6' : c.type === 'restroom' ? '#06b6d4' : c.type === 'study' ? '#8b5cf6' : c.type === 'transport' ? '#10b981' : c.type === 'gym' ? '#ef4444' : '#64748b'} onClick={() => setSelected(c)} />
						)
					))}
				</svg>
			</motion.div>
			<InfoDrawer />
		</div>
	)
}