import { CHUNK_SIZE } from "./constants";
import { Position } from "./component/position";

export function loadWorld(name): any[] {
  createScreen();

  const entities: any[] = require(`./${name}.json`);

  const groupedEntities = groupTerrain(entities);
  destroyScreen();
  return groupedEntities;
}

let wrapper: HTMLDivElement;
let inner: HTMLDivElement;

function createScreen() {
  wrapper = document.createElement("div");
  wrapper.setAttribute("id", "loading-wrapper");

  document.body.appendChild(wrapper);

  inner = document.createElement("div");
  inner.setAttribute("id", "loading");

  inner.innerText = "Loading!";

  wrapper.appendChild(inner);
}

function destroyScreen() {
  wrapper.removeChild(inner);
  document.body.removeChild(wrapper);
  wrapper = undefined;
  inner = undefined;
}

function groupTerrain(entities: any[]): any[] {
  const terrainEntities = entities.filter(
    entity => !!entity.position && !!entity.sprite && !!entity.terrain
  );
  const otherEntities = entities.filter(
    entity => terrainEntities.indexOf(entity) === -1
  );

  const chunks = new Map<string, any[]>();
  terrainEntities.forEach(entity => {
    const chunkX = Math.floor(entity.position.x / CHUNK_SIZE);
    const chunkZ = Math.floor(entity.position.z / CHUNK_SIZE);
    const chunkKey = `chunk_${chunkX}_${chunkZ}`;
    chunks.set(chunkKey, (chunks.get(chunkKey) || []).concat(entity));
  });

  let id = 10000;

  chunks.forEach((value, key) => {
    const terrainVoxels = value.map(({ position }) => position);

    const position = getGroupPosition(terrainVoxels);

    otherEntities.push({
      id: id++,
      position,
      sprite: {
        name: key
      }
    });
  });

  return otherEntities.concat(
    terrainEntities.map(entity => ({ ...entity, sprite: undefined }))
  );
}

function getGroupPosition(positions: Position[]): Position {
  let minX = positions[0].x;
  let maxX = positions[0].x;
  let minY = positions[0].y;
  let maxY = positions[0].y;
  let minZ = positions[0].z;
  let maxZ = positions[0].z;

  positions.forEach(position => {
    minX = Math.min(position.x, minX);
    maxX = Math.max(position.x, maxX);
    minY = Math.min(position.y, minY);
    maxY = Math.max(position.y, maxY);
    minZ = Math.min(position.z, minZ);
    maxZ = Math.max(position.z, maxZ);
  });

  return {
    x: minX,
    y: minY,
    z: minZ,
    rotation: 0
  };
}
