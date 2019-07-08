import { EntityPool } from "entity-component-system";
import { SearchNames, ComponentNames, DEBUG } from "../constants";
import { Position, Rotation } from "../component/position";
import { PathTo } from "../component/pathTo";
import { Terrain } from "../component/terrain";
import { createMask3d, Vector3, mask3dGet, distanceManhattan3 } from "../utils";
import createGraph from "ngraph.graph";
import { aStar } from "ngraph.path";

interface NavMeshNode {
  position: Position;
  terrain: Terrain;
  entityId: number;
}
const navMeshNodes = new Map<string, NavMeshNode>();

const navMesh = createGraph<void, void>();

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

    // TODO: Some of these shouldn't be in the map.
    navMeshNodes.set(`${position.x},${position.y},${position.z}`, {
      entityId,
      position,
      terrain
    });

    terrainPositions.push({ terrain, position });
  });

  const mask = createMask3d(maxX - minX + 1, maxY - minY + 1, maxZ - minZ + 1);

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

  mask.forEach((xArray, xIndex) => {
    xArray.forEach((yArray, yIndex) => {
      yArray.forEach((walkSpeed, zIndex) => {
        if (walkSpeed === undefined) {
          return;
        }

        let nodeX = xIndex + minX;
        let nodeY = yIndex + minY;
        let nodeZ = zIndex + minZ;

        const nodeKey = `${nodeX},${nodeY},${nodeZ}`;
        navMesh.addNode(nodeKey);

        function addNeighbour(x, y, z) {
          const value = mask3dGet(mask, x, y, z);
          if (value !== undefined) {
            let neighbourX = x + minX;
            let neighbourY = y + minY;
            let neighbourZ = z + minZ;
            const neighbourKey = `${neighbourX},${neighbourY},${neighbourZ}`;
            navMesh.addNode(neighbourKey);
            navMesh.addLink(nodeKey, neighbourKey);
          }
        }

        addNeighbour(xIndex - 1, yIndex, zIndex);
        addNeighbour(xIndex + 1, yIndex, zIndex);
        addNeighbour(xIndex, yIndex, zIndex - 1);
        addNeighbour(xIndex, yIndex, zIndex + 1);
      });
    });
  });
}

const pathFinder = aStar(navMesh, {
  distance(from, to) {
    const fromNode = navMeshNodes.get(from.id as string);
    const toNode = navMeshNodes.get(to.id as string);
    return distanceManhattan3(fromNode.position, toNode.position);
  },
  heuristic(from, to) {
    const fromNode = navMeshNodes.get(from.id as string);
    const toNode = navMeshNodes.get(to.id as string);
    return distanceManhattan3(fromNode.position, toNode.position);
  }
});

export function getRandomDestination(): Vector3 {
  const index = Math.floor(Math.random() * navMeshNodes.size);
  const iterator = navMeshNodes.values();
  let result: NavMeshNode;
  for (let i = 0; i < index; i++) {
    result = iterator.next().value;
  }
  return { ...result.position, y: result.position.y + 1 };
}

export function pathFindSystem(entities: EntityPool, deltaTime: number): void {
  entities.find(SearchNames.PATHABLE).forEach(entityId => {
    const path: PathTo = entities.getComponent<PathTo>(
      entityId,
      ComponentNames.PATH
    );
    const position = entities.getComponent<Position>(
      entityId,
      ComponentNames.POSITION
    );

    if (path.waypoints.length === 0) {
      try {
        path.waypoints = pathFinder
          .find(
            `${path.x},${path.y - 1},${path.z}`,
            `${Math.floor(position.x)},${Math.floor(
              position.y - 1
            )},${Math.floor(position.z)}`
          )
          .map(waypoint => waypoint.id) as string[];
      } catch (error) {
        console.error(error);
      }

      if (path.waypoints.length === 0) {
        console.error(
          `Could not pathfind to ${path.x},${path.y - 1},${path.z}`
        );
        entities.removeComponent(entityId, ComponentNames.PATH);
        return;
      }
    }

    const nextWaypoint = navMeshNodes.get(path.waypoints[0]);

    const nextX = nextWaypoint.position.x;
    const nextY = nextWaypoint.position.y + 1;
    const nextZ = nextWaypoint.position.z;

    const speed = deltaTime * 0.005;

    const deltaX = nextX - position.x;
    const deltaY = nextY - position.y;
    const deltaZ = nextZ - position.z;

    const magnitude = Math.sqrt(
      deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ
    );

    if (magnitude <= speed) {
      position.x = nextX;
      position.y = nextY;
      position.z = nextZ;
      path.waypoints.shift();
      if (path.waypoints.length === 0) {
        entities.removeComponent(entityId, ComponentNames.PATH);
      }
      return;
    }

    position.x += (deltaX / magnitude) * speed;
    position.y += (deltaY / magnitude) * speed;
    position.z += (deltaZ / magnitude) * speed;
    position.rotation = getRotation(position, nextWaypoint.position);
  });
}

function getRotation(from: Position, to: Position): Rotation {
  if (from.x === to.x) {
    if (from.z > to.z) {
      return Rotation.TURN_2;
    } else {
      return Rotation.TURN_0;
    }
  } else {
    if (from.x > to.x) {
      return Rotation.TURN_3;
    } else {
      return Rotation.TURN_1;
    }
  }
}
