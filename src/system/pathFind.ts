import { EntityPool } from "entity-component-system";
import { SearchNames, ComponentNames, DEBUG } from "../constants";
import { Position } from "../component/position";
import { PathTo } from "../component/pathTo";
import { Terrain } from "../component/terrain";
import { createMask3d, Mask3d, Vector3, mask3dGet } from "../utils";

interface NavigationNode extends Vector3 {
  walkSpeed: number;
  neighbours: Vector3[];
};
let navigationMesh: Mask3d<NavigationNode>;
const allNodes: NavigationNode[] = []

export function buildWalkMask(entities: EntityPool) {
  const walkableTiles = entities.find(SearchNames.TERRAIN);

  const terrainPositions: { position: Position; terrain: Terrain }[] = [];

  const first: Position = entities.getComponent(
    walkableTiles[0],
    ComponentNames.POSITION
  );
  let minX = first.x;
  let maxX = first.x;
  let minY = first.y;
  let maxY = first.y;
  let minZ = first.z;
  let maxZ = first.z;

  walkableTiles.forEach(entityId => {
    const terrain: Terrain = entities.getComponent(
      entityId,
      ComponentNames.TERRAIN
    );
    const position: Position = entities.getComponent(
      entityId,
      ComponentNames.POSITION
    );

    minX = Math.min(position.x, minX);
    maxX = Math.max(position.x, maxX);
    minY = Math.min(position.y, minY);
    maxY = Math.max(position.y, maxY);
    minZ = Math.min(position.z, minZ);
    maxZ = Math.max(position.z, maxZ);

    terrainPositions.push({ terrain, position });
  });

  const mask = createMask3d(maxX - minX + 1, maxY - minY + 1, maxZ - minZ + 1);
  navigationMesh = createMask3d(maxX - minX + 1, maxY - minY + 1, maxZ - minZ + 1);

  terrainPositions.forEach(({ terrain, position }) => {
    let x = position.x - minX;
    let y = position.y - minY;
    let z = position.z - minZ;
    mask[x][y][z] = terrain.walkSpeed;
  });

  mask.forEach((xArray, xIndex) => {
    xArray.forEach((yArray, yIndex) => {
      yArray.forEach((walkSpeed, zIndex) => {
        if (walkSpeed !== undefined && walkSpeed <= 0 && yIndex > 0) {
          mask[xIndex][yIndex - 1][zIndex] = undefined;
          mask[xIndex][yIndex][zIndex] = undefined;
        }
      });
    });
  });

  if (DEBUG) {
    let walkMap = "";
    mask.forEach(xArray => {
      xArray[0].forEach(walkSpeed => {
        if (walkSpeed !== undefined) {
          walkMap += `X,`;
        } else {
          walkMap += `_,`;
        }
      });
      walkMap += "\n";
    });
    console.log(walkMap);
  }

  mask.forEach((xArray, xIndex) => {
    xArray.forEach((yArray, yIndex) => {
      yArray.forEach((walkSpeed, zIndex) => {
        if (walkSpeed === undefined) {
          return;
        }

        const neighbours: Array<Vector3> = [];

        function addNeighbour(x, y, z) {
          const value = mask3dGet(mask, x, y, z);
          if (value !== undefined) {
            neighbours.push({x: x + minX, y: y + minY, z: z + minZ});
          }
        }

        addNeighbour(xIndex - 1, yIndex, zIndex);
        addNeighbour(xIndex + 1, yIndex, zIndex);
        addNeighbour(xIndex, yIndex, zIndex - 1);
        addNeighbour(xIndex, yIndex, zIndex + 1);

        const node: NavigationNode = {
          x: xIndex + minX,
          y: yIndex + minY,
          z: zIndex + minZ,
          walkSpeed,
          neighbours
        }

        navigationMesh[xIndex][yIndex][zIndex] = node;
        allNodes.push(node);
      });
    });
  });

  console.log(allNodes);
}

export function getRandomDestination(): Vector3 {
  const index = Math.floor(Math.random() * allNodes.length);
  const {x, y, z} = allNodes[index];
  return {x, y: y + 1, z};
}

export function pathFindSystem(entities: EntityPool, deltaTime: number): void {
  entities.find(SearchNames.PATHABLE).forEach(entityId => {
    const path = entities.getComponent<PathTo>(entityId, ComponentNames.PATH);
    const position = entities.getComponent<Position>(
      entityId,
      ComponentNames.POSITION
    );

    const speed = deltaTime * 0.005;

    const deltaX = path.x - position.x;
    const deltaY = path.y - position.y;
    const deltaZ = path.z - position.z;

    const magnitude = Math.sqrt(
      deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ
    );

    if (magnitude <= speed) {
      position.x = path.x;
      position.y = path.y;
      position.z = path.z;
      entities.removeComponent(entityId, ComponentNames.PATH);
      return;
    }

    position.x += (deltaX / magnitude) * speed;
    position.y += (deltaY / magnitude) * speed;
    position.z += (deltaZ / magnitude) * speed;
  });
}
