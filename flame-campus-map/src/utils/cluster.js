export function clusterPoints(points, zoom, screenRadiusPx = 40) {
	if (!points || points.length === 0) return []
	const cellSize = screenRadiusPx / Math.max(zoom, 0.0001)
	const buckets = new Map()
	for (const p of points) {
		const keyX = Math.floor(p.x / cellSize)
		const keyY = Math.floor(p.y / cellSize)
		const key = keyX + ',' + keyY
		let bucket = buckets.get(key)
		if (!bucket) {
			bucket = { items: [], sumX: 0, sumY: 0 }
			buckets.set(key, bucket)
		}
		bucket.items.push(p)
		bucket.sumX += p.x
		bucket.sumY += p.y
	}
	const clusters = []
	for (const [, b] of buckets) {
		const count = b.items.length
		const cx = b.sumX / count
		const cy = b.sumY / count
		if (count === 1) {
			clusters.push({ type: 'point', ...b.items[0] })
		} else {
			clusters.push({ type: 'cluster', x: cx, y: cy, count, items: b.items })
		}
	}
	return clusters
}