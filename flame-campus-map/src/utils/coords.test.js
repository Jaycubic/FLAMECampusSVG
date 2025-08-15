import { describe, it, expect } from 'vitest'
import { gpsToSvg, svgToGps, pixelTopLeft, pixelBottomRight } from './coords'

const EPS = 1e-6

describe('coords utils', () => {
	it('maps calibration points exactly', () => {
		const p1 = gpsToSvg(pixelTopLeft.lat, pixelTopLeft.lng)
		expect(Math.abs(p1.x - pixelTopLeft.x)).toBeLessThan(1e-9)
		expect(Math.abs(p1.y - pixelTopLeft.y)).toBeLessThan(1e-9)

		const p2 = gpsToSvg(pixelBottomRight.lat, pixelBottomRight.lng)
		expect(Math.abs(p2.x - pixelBottomRight.x)).toBeLessThan(1e-9)
		expect(Math.abs(p2.y - pixelBottomRight.y)).toBeLessThan(1e-9)
	})

	it('round-trips lat/lng -> svg -> lat/lng within epsilon', () => {
		const samples = [
			{ lat: 18.526, lng: 73.728 },
			{ lat: 18.523, lng: 73.731 },
			{ lat: 18.5215, lng: 73.7325 },
		]
		for (const s of samples) {
			const { x, y } = gpsToSvg(s.lat, s.lng)
			const { lat, lng } = svgToGps(x, y)
			expect(Math.abs(lat - s.lat)).toBeLessThan(EPS)
			expect(Math.abs(lng - s.lng)).toBeLessThan(EPS)
		}
	})
})