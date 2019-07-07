import { Position, Rotation } from "../../src/component/position";
import { Voxels, VoxelLookup } from "./voxels";
import { GRID_SIZE } from "../../src/constants";

export interface PositionedVoxel {
  position: Position;
  voxels: Voxels;
}

export function groupVoxels(
  positionedVoxels: PositionedVoxel[]
): PositionedVoxel {
  let minX = positionedVoxels[0].position.x;
  let maxX = positionedVoxels[0].position.x;
  let minY = positionedVoxels[0].position.y;
  let maxY = positionedVoxels[0].position.y;
  let minZ = positionedVoxels[0].position.z;
  let maxZ = positionedVoxels[0].position.z;

  positionedVoxels.forEach(positionedVoxel => {
    minX = Math.min(positionedVoxel.position.x, minX);
    maxX = Math.max(positionedVoxel.position.x, maxX);
    minY = Math.min(positionedVoxel.position.y, minY);
    maxY = Math.max(positionedVoxel.position.y, maxY);
    minZ = Math.min(positionedVoxel.position.z, minZ);
    maxZ = Math.max(positionedVoxel.position.z, maxZ);
  });

  const groupSize = Math.max(maxX - minX, maxY - minY, maxZ - minZ) + 1;
  const group = new Voxels(groupSize * GRID_SIZE);

  positionedVoxels.forEach(positionedVoxel => {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let z = 0; z < GRID_SIZE; z++) {
          if (positionedVoxel.voxels.existsByPos(x, y, z)) {
            // TODO: Rotation
            const r = positionedVoxel.voxels.getByPos(x, y, z, VoxelLookup.r);
            const g = positionedVoxel.voxels.getByPos(x, y, z, VoxelLookup.g);
            const b = positionedVoxel.voxels.getByPos(x, y, z, VoxelLookup.b);
            const xOffset = (positionedVoxel.position.x - minX) * GRID_SIZE;
            const yOffset = (positionedVoxel.position.y - minY) * GRID_SIZE;
						const zOffset = (positionedVoxel.position.z - minZ) * GRID_SIZE;
            switch (positionedVoxel.position.rotation) {
              case Rotation.TURN_0:
                group.populate(xOffset + x, yOffset + y, zOffset + z, r, g, b);
                break;
							case Rotation.TURN_1:
                 group.populate(xOffset + z, yOffset + y, zOffset + invert(x), r, g, b);
                break;
              case Rotation.TURN_2:
                group.populate(xOffset + invert(x), yOffset + y, zOffset + invert(z), r, g, b);
                break;
              case Rotation.TURN_3:
                group.populate(xOffset + invert(z), yOffset + y, zOffset + x, r, g, b);
                 break;
            }
          }
        }
      }
    }
  });

  return {
    position: {
      x: minX,
      y: minY,
      z: minZ,
      rotation: 0
    },
    voxels: group
  };
}

function invert(value: number) {
	return (GRID_SIZE - 1) - value;
}
