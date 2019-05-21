export interface Color {
	r: number;
	g: number;
	b: number;
}

// https://en.wikipedia.org/wiki/Web_colors#Hex_triplet

export function toHexTriplet({r, g, b}: Color): number {
	return (1 << 24) + (r << 16) + (g << 8) + b;
}

export function fromHexTriplet(hexTriplet: number): Color {
	return {
		r: hexTriplet >> 16,
		g: (hexTriplet >> 8) & 255,
		b: hexTriplet & 255
	};
}