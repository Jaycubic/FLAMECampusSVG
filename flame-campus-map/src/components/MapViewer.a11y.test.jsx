import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MapViewer from './MapViewer'

vi.stubGlobal('fetch', vi.fn(async () => ({ text: async () => '<svg viewBox="0 0 3000 4000"></svg>' })))

vi.stubGlobal('navigator', {
	geolocation: {
		watchPosition: vi.fn(() => 1),
		clearWatch: vi.fn(),
	},
	clipboard: { writeText: vi.fn() },
})

describe('MapViewer a11y basics', () => {
	it('renders zoom buttons and search input with labels', () => {
		render(<MapViewer />)
		expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument()
		expect(screen.getByLabelText(/search/i)).toBeInTheDocument()
	})
})