import { Faces, FaceData } from "./faces";
import { Voxels, VoxelLookup } from "./voxels";
import { createMask2d, toHexTriplet, Mask2d, fromHexTriplet } from "../utils";

export function voxelsToFaces(voxels: Voxels): Faces {
	const faces: Faces = {
		topFaces: [],
		bottomFaces: [],
		leftFaces: [],
		rightFaces: [],
		backFaces: [],
		frontFaces: []
	}

  voxels.populatedOffsets.forEach(offset => {
    const { x, y, z } = voxels.getPosition(offset);

    if (!voxels.existsByPos(x - 1, y, z)) {
      voxels.setByOffset(offset, VoxelLookup.isLeftVisible, 1);
    }

    if (!voxels.existsByPos(x + 1, y, z)) {
      voxels.setByOffset(offset, VoxelLookup.isRightVisible, 1);
    }

    if (!voxels.existsByPos(x, y - 1, z)) {
      voxels.setByOffset(offset, VoxelLookup.isBottomVisible, 1);
    }

    if (!voxels.existsByPos(x, y + 1, z)) {
      voxels.setByOffset(offset, VoxelLookup.isTopVisible, 1);
    }

    if (!voxels.existsByPos(x, y, z - 1)) {
      voxels.setByOffset(offset, VoxelLookup.isBackVisible, 1);
    }

    if (!voxels.existsByPos(x, y, z + 1)) {
      voxels.setByOffset(offset, VoxelLookup.isFrontVisible, 1);
    }
  });

  // Tops/bottoms
  for (let y = 0; y < voxels.size; y++) {
    const topMask = createMask2d(voxels.size);
    const bottomMask = createMask2d(voxels.size);
    for (let x = 0; x < voxels.size; x++) {
      for (let z = 0; z < voxels.size; z++) {
        const topVoxel = voxels.getByPos(
          x,
          y,
          z,
          VoxelLookup.isTopVisible
        );
        if (topVoxel) {
          topMask[x][z] = toHexTriplet({
            r: voxels.getByPos(x, y, z, VoxelLookup.r),
            g: voxels.getByPos(x, y, z, VoxelLookup.g),
            b: voxels.getByPos(x, y, z, VoxelLookup.b)
          });
        }

        const bottomVoxel = voxels.getByPos(
          x,
          y,
          z,
          VoxelLookup.isBottomVisible
        );
        if (bottomVoxel) {
          bottomMask[x][z] = toHexTriplet({
            r: voxels.getByPos(x, y, z, VoxelLookup.r),
            g: voxels.getByPos(x, y, z, VoxelLookup.g),
            b: voxels.getByPos(x, y, z, VoxelLookup.b)
          });
        }
      }
    }

    function combineFaces(mask: Mask2d, target: FaceData[]) {
      for (let x = 0; x < voxels.size; x++) {
        for (let z = 0; z < voxels.size; z++) {
          // Starting point
          const color = mask[x][z];
          if (color !== undefined) {
            mask[x][z] = undefined;
            let width = 1;
            let canExpandWidth = true;
            while (canExpandWidth) {
              const nextWidth = width + 1;
              const xToCheck = x + nextWidth - 1;

              if (xToCheck >= voxels.size) {
                canExpandWidth = false;
              } else if (mask[xToCheck][z] === color) {
                width = nextWidth;
                mask[xToCheck][z] = undefined;
              } else {
                canExpandWidth = false;
              }
            }

            let depth = 1;
            let canExpandDepth = true;
            while (canExpandDepth) {
              const nextDepth = depth + 1;
              const zToCheck = z + nextDepth - 1;

              if (zToCheck >= voxels.size) {
                canExpandDepth = false;
              } else {
                let nextRowMatches = true;
                for (let i = 0; i < width; i++) {
                  if (mask[x + i][zToCheck] !== color) {
                    nextRowMatches = false;
                  }
                }

                if (nextRowMatches) {
                  depth = nextDepth;
                  for (let i = 0; i < width; i++) {
                    mask[x + i][zToCheck] = undefined;
                  }
                } else {
                  canExpandDepth = false;
                }
              }
            }

            const { r, g, b } = fromHexTriplet(color);
            target.push(new Uint8Array([
              x,
              y,
              z,
              width,
              depth,
              r,
              g,
              b
            ]) as FaceData);
          }
        }
      }
    }

    combineFaces(topMask, faces.topFaces);
    combineFaces(bottomMask, faces.bottomFaces);
  }

  // Lefts/rights
  for (let x = 0; x < voxels.size; x++) {
    const leftMask = createMask2d(voxels.size);
    const rightMask = createMask2d(voxels.size);
    for (let y = 0; y < voxels.size; y++) {
      for (let z = 0; z < voxels.size; z++) {
        const leftVoxel = voxels.getByPos(
          x,
          y,
          z,
          VoxelLookup.isLeftVisible
        );
        if (leftVoxel) {
          leftMask[y][z] = toHexTriplet({
            r: voxels.getByPos(x, y, z, VoxelLookup.r),
            g: voxels.getByPos(x, y, z, VoxelLookup.g),
            b: voxels.getByPos(x, y, z, VoxelLookup.b)
          });
        }

        const rightVoxel = voxels.getByPos(
          x,
          y,
          z,
          VoxelLookup.isRightVisible
        );
        if (rightVoxel) {
          rightMask[y][z] = toHexTriplet({
            r: voxels.getByPos(x, y, z, VoxelLookup.r),
            g: voxels.getByPos(x, y, z, VoxelLookup.g),
            b: voxels.getByPos(x, y, z, VoxelLookup.b)
          });
        }
      }
    }

    function combineFaces(mask: Mask2d, target: FaceData[]) {
      for (let y = 0; y < voxels.size; y++) {
        for (let z = 0; z < voxels.size; z++) {
          // Starting point
          const color = mask[y][z];
          if (color !== undefined) {
            mask[y][z] = undefined;
            let height = 1;
            let canExpandHeight = true;
            while (canExpandHeight) {
              const nextHeight = height + 1;
              const yToCheck = y + nextHeight - 1;

              if (yToCheck >= voxels.size) {
                canExpandHeight = false;
              } else if (mask[yToCheck][z] === color) {
                height = nextHeight;
                mask[yToCheck][z] = undefined;
              } else {
                canExpandHeight = false;
              }
            }

            let depth = 1;
            let canExpandDepth = true;
            while (canExpandDepth) {
              const nextDepth = depth + 1;
              const zToCheck = z + nextDepth - 1;

              if (zToCheck >= voxels.size) {
                canExpandDepth = false;
              } else {
                let nextRowMatches = true;
                for (let i = 0; i < height; i++) {
                  if (mask[y + i][zToCheck] !== color) {
                    nextRowMatches = false;
                  }
                }

                if (nextRowMatches) {
                  depth = nextDepth;
                  for (let i = 0; i < height; i++) {
                    mask[y + i][zToCheck] = undefined;
                  }
                } else {
                  canExpandDepth = false;
                }
              }
            }

            const { r, g, b } = fromHexTriplet(color);
            target.push(new Uint8Array([
              x,
              y,
              z,
              depth,
              height,
              r,
              g,
              b
            ]) as FaceData);
          }
        }
      }
    }

    combineFaces(leftMask, faces.leftFaces);
    combineFaces(rightMask, faces.rightFaces);
  }

  // Fronts/backs
  for (let z = 0; z < voxels.size; z++) {
    const frontMask = createMask2d(voxels.size);
    const backMask = createMask2d(voxels.size);
    for (let x = 0; x < voxels.size; x++) {
      for (let y = 0; y < voxels.size; y++) {
        const frontVoxel = voxels.getByPos(
          x,
          y,
          z,
          VoxelLookup.isFrontVisible
        );
        if (frontVoxel) {
          frontMask[x][y] = toHexTriplet({
            r: voxels.getByPos(x, y, z, VoxelLookup.r),
            g: voxels.getByPos(x, y, z, VoxelLookup.g),
            b: voxels.getByPos(x, y, z, VoxelLookup.b)
          });
        }

        const backVoxel = voxels.getByPos(
          x,
          y,
          z,
          VoxelLookup.isBackVisible
        );
        if (backVoxel) {
          backMask[x][y] = toHexTriplet({
            r: voxels.getByPos(x, y, z, VoxelLookup.r),
            g: voxels.getByPos(x, y, z, VoxelLookup.g),
            b: voxels.getByPos(x, y, z, VoxelLookup.b)
          });
        }
      }
    }

    function combineFaces(mask: Mask2d, target: FaceData[]) {
      for (let x = 0; x < voxels.size; x++) {
        for (let y = 0; y < voxels.size; y++) {
          // Starting point
          const color = mask[x][y];
          if (color !== undefined) {
            mask[x][y] = undefined;
            let width = 1;
            let canExpandWidth = true;
            while (canExpandWidth) {
              const nextWidth = width + 1;
              const xToCheck = x + nextWidth - 1;

              if (xToCheck >= voxels.size) {
                canExpandWidth = false;
              } else if (mask[xToCheck][y] === color) {
                width = nextWidth;
                mask[xToCheck][y] = undefined;
              } else {
                canExpandWidth = false;
              }
            }

            let height = 1;
            let canExpandHeight = true;
            while (canExpandHeight) {
              const nextHeight = height + 1;
              const yToCheck = y + nextHeight - 1;

              if (yToCheck >= voxels.size) {
                canExpandHeight = false;
              } else {
                let nextRowMatches = true;
                for (let i = 0; i < width; i++) {
                  if (mask[x + i][yToCheck] !== color) {
                    nextRowMatches = false;
                  }
                }

                if (nextRowMatches) {
                  height = nextHeight;
                  for (let i = 0; i < width; i++) {
                    mask[x + i][yToCheck] = undefined;
                  }
                } else {
                  canExpandHeight = false;
                }
              }
            }

            const { r, g, b } = fromHexTriplet(color);
            target.push(new Uint8Array([
              x,
              y,
              z,
              width,
              height,
              r,
              g,
              b
            ]) as FaceData);
          }
        }
      }
    }

    combineFaces(frontMask, faces.frontFaces);
    combineFaces(backMask, faces.backFaces);
	}

	return faces;
}