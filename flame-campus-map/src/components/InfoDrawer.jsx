import { motion, AnimatePresence } from 'framer-motion'
import { useMapStore } from '../store/useMapStore'

export default function InfoDrawer() {
	const selected = useMapStore((s) => s.selected)
	const close = useMapStore((s) => s.closeSelected)
	return (
		<AnimatePresence>
			{selected && (
				<motion.div className="fixed inset-x-0 bottom-0 z-20"
					initial={{ y: '100%' }}
					animate={{ y: 0 }}
					exit={{ y: '100%' }}
					transition={{ type: 'spring', stiffness: 300, damping: 30 }}
				>
					<div className="mx-auto w-full max-w-md rounded-t-2xl bg-white dark:bg-zinc-900 shadow-soft border border-zinc-200 dark:border-zinc-800 p-4">
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-lg font-semibold">{selected.name}</h3>
							<button aria-label="Close" className="rounded-full w-8 h-8 border border-zinc-200 dark:border-zinc-700" onClick={close}>✕</button>
						</div>
						<p className="text-sm text-zinc-600 dark:text-zinc-300">Type: {selected.type} · Status: {selected.status}{selected.capacity ? ` · Capacity: ${selected.capacity}` : ''}</p>
						<div className="mt-4 grid grid-cols-3 gap-2">
							<button className="rounded-lg bg-brand-500 text-white py-2">Navigate</button>
							<button className="rounded-lg bg-zinc-200 dark:bg-zinc-800 py-2">Reserve</button>
							<a className="rounded-lg bg-zinc-200 dark:bg-zinc-800 py-2 text-center" href="tel:+000000000">Call</a>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}