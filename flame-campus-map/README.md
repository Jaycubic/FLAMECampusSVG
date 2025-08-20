# FLAME Campus Interactive Map

Mobile-first, production-quality interactive campus map for FLAME University. Renders the official campus SVG and provides smooth, Google-Maps-like pan/zoom with precise GPS↔SVG mapping.

## Tech stack
- React + Vite
- TailwindCSS
- Framer Motion
- Zustand
- @use-gesture/react
- Testing: Vitest + Testing Library

## Setup
```bash
npm install
npm run dev
```
Open the dev URL in a mobile device or emulator. Allow location permission when prompted.

### Build
```bash
npm run build
npm run preview
```

## Strict linear interpolation mapping
Two fixed calibration points define a strictly linear mapping between GPS and SVG pixels.

```javascript
// utils/coords.js
export const pixelTopLeft = {
  x: 132.75,
  y: 133.55,
  lat: 18.5271557,
  lng: 73.7276252,
};
export const pixelBottomRight = {
  x: 2512.5,
  y: 3776.5,
  lat: 18.5180856,
  lng: 73.7339646,
};
```

- `gpsToSvg(lat,lng) → {x,y}` and `svgToGps(x,y) → {lat,lng}` use strict linear interpolation and clamp to campus bounds.
- For campus scale, projection error is negligible; no other projection math is used.

## Features
- Inline SVG injection for full interactivity
- Smooth pinch/wheel zoom, drag pan with inertia, double-tap zoom (pointer-centered)
- GPS integration with high-accuracy and exponential smoothing + pulsing dot
- Resource markers from `src/data/resources.json` with status colors
- Clustering when zoomed out; expands naturally as you zoom
- Filters bar for layers (library, food, restroom, study, transport, gym, laundry)
- "Center on me" with animated camera move
- Tap anywhere to copy GPS via `svgToGps`
- Accessible controls and dark mode friendly styling

## Testing / QA
```bash
npm run test
```
- Coordinate round-trip unit tests: `src/utils/coords.test.js`
- UI tests: center-on-me flow and a11y basics under `src/components/*.test.jsx`

Manual checks:
- Calibration points render exactly at their pixel coordinates
- Center-on-me works at different zoom levels
- Filters toggle visibility smoothly
- Search recenters and opens details drawer

## Assets
- Campus SVG: `src/assets/FLAMECampusSVG/CampusMap.svg` (cloned from the provided repo)

## Notes
- For campus-sized areas, linear interpolation is acceptable and documented here. A multi-point affine transform can be added as an optional enhancement.
- Performance: GPU-accelerated transforms, minimal reflow, and debounced geolocation updates.
