import { useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import resources from '../data/resources.json'
import { gpsToSvg } from '../utils/coords'
import { useMapStore } from '../store/useMapStore'

export default function SearchBar() {
	const [query, setQuery] = useState('')
	const [open, setOpen] = useState(false)
	const { fitToPoint, setSelected } = useMapStore()

	const items = useMemo(() => resources.map((r) => ({ ...r, ...gpsToSvg(r.lat, r.lng) })), [])
	const fuse = useMemo(() => new Fuse(items, { keys: ['name', 'type'], threshold: 0.4 }), [items])
	const results = query ? fuse.search(query).slice(0, 8).map((r) => r.item) : []

	return (
		<div className="relative w-full max-w-md">
			<input
				aria-label="Search"
				placeholder="Search buildings or resources"
				value={query}
				onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
				className="w-full rounded-full bg-white/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 shadow-soft"
			/>
			{open && results.length > 0 && (
				<div className="absolute left-0 right-0 mt-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-soft overflow-hidden">
					{results.map((r) => (
						<button key={r.id} className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => { fitToPoint({ x: r.x, y: r.y }, 3); setSelected(r); setOpen(false) }}>{r.name} <span className="text-xs text-zinc-500">({r.type})</span></button>
					))}
				</div>
			)}
		</div>
	)
}