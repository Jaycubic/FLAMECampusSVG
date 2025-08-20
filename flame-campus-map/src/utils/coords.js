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

/**
 * Convert GPS (lat,lng) -> SVG pixel coordinates (x,y)
 * Strict linear interpolation between the two calibration points.
 * Clamps the fractional values to [0,1] so markers remain on the campus map.
 */
export function gpsToSvg(lat, lng) {
	const x1 = pixelTopLeft.x, y1 = pixelTopLeft.y, lat1 = pixelTopLeft.lat, lng1 = pixelTopLeft.lng;
	const x2 = pixelBottomRight.x, y2 = pixelBottomRight.y, lat2 = pixelBottomRight.lat, lng2 = pixelBottomRight.lng;

	// east-west fraction (0 = left, 1 = right)
	const denomLng = (lng2 - lng1);
	let u = denomLng !== 0 ? (lng - lng1) / denomLng : 0;

	// north-south fraction (0 = top, 1 = bottom)
	// careful: latitude decreases as you go south, so use lat1 (top) and lat2 (bottom)
	const denomLat = (lat1 - lat2);
	let v = denomLat !== 0 ? (lat1 - lat) / denomLat : 0;

	// clamp to [0,1]
	u = Math.max(0, Math.min(1, u));
	v = Math.max(0, Math.min(1, v));

	const x = x1 + u * (x2 - x1);
	const y = y1 + v * (y2 - y1);

	return { x, y };
}

/**
 * Convert SVG pixel (x,y) -> GPS (lat,lng)
 * Inverse linear interpolation of gpsToSvg.
 */
export function svgToGps(x, y) {
	const x1 = pixelTopLeft.x, y1 = pixelTopLeft.y, lat1 = pixelTopLeft.lat, lng1 = pixelTopLeft.lng;
	const x2 = pixelBottomRight.x, y2 = pixelBottomRight.y, lat2 = pixelBottomRight.lat, lng2 = pixelBottomRight.lng;

	const denomX = (x2 - x1);
	const denomY = (y2 - y1);

	let u = denomX !== 0 ? (x - x1) / denomX : 0;
	let v = denomY !== 0 ? (y - y1) / denomY : 0;

	u = Math.max(0, Math.min(1, u));
	v = Math.max(0, Math.min(1, v));

	const lng = lng1 + u * (lng2 - lng1);
	const lat = lat1 - v * (lat1 - lat2);

	return { lat, lng };
}