import { useMapStore } from '../store/useMapStore'

const FILTERS = [
	{ key: 'library', label: 'Library' },
	{ key: 'food', label: 'Food' },
	{ key: 'restroom', label: 'Restroom' },
	{ key: 'study', label: 'Study' },
	{ key: 'transport', label: 'Transport' },
	{ key: 'gym', label: 'Gym' },
	{ key: 'laundry', label: 'Laundry' },
]

export default function FiltersBar() {
	const filters = useMapStore((s) => s.filters)
	const toggle = useMapStore((s) => s.toggleFilter)
	return (
		<div className="flex gap-2 overflow-x-auto px-2 py-2">
			{FILTERS.map((f) => (
				<button key={f.key} onClick={() => toggle(f.key)} className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm ${filters[f.key] ? 'bg-brand-500 text-white border-brand-500' : 'bg-white/90 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}>{f.label}</button>
			))}
		</div>
	)
}