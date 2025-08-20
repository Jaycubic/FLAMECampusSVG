import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MapViewer from './MapViewer'
import { useMapStore } from '../store/useMapStore'

vi.stubGlobal('fetch', vi.fn(async () => ({ text: async () => '<svg viewBox="0 0 3000 4000"></svg>' })))

vi.stubGlobal('navigator', {
	geolocation: {
		watchPosition: vi.fn(() => 1),
		clearWatch: vi.fn(),
	},
})

describe('MapViewer', () => {
	beforeEach(() => {
		useMapStore.setState({ zoom: 1, translateX: 0, translateY: 0, user: { lat: null, lng: null, x: null, y: null, accuracy: null } })
	})

	it('centers on user when clicking the button', async () => {
		render(<MapViewer />)
		useMapStore.getState().setUser({ x: 1200, y: 1600, lat: 0, lng: 0 })
		const btn = await screen.findByText(/center on me/i)
		fireEvent.click(btn)
		const { translateX, translateY, zoom } = useMapStore.getState()
		expect(zoom).toBeGreaterThanOrEqual(2)
		expect(translateX).toBeLessThan(0 + window.innerWidth)
		expect(translateY).toBeLessThan(0 + window.innerHeight)
	})
})