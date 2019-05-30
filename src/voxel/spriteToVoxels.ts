import { Voxels } from "./voxels";
import { Sprite } from "./sprite";

export function spriteToVoxels({data, size}: Sprite): Voxels {
	const result = new Voxels(size);

	const partsPerPixel = 4;
	for (let x = 0; x < size; x++) {
		for (let z = 0; z < size; z++) {
			for (let y = 0; y < size; y++) {
				const pixelIndex = x + z * size + y * size * size;
				const imageDataIndex = pixelIndex * partsPerPixel;
				const [r, g, b, a] = data.slice(
					imageDataIndex,
					imageDataIndex + partsPerPixel
				);

				if (a !== 0) {
					result.populate(x, size - (y + 1), z, r, g, b);
				}
			}
		}
	}

	return result;
}