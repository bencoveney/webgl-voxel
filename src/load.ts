import { loadModel, getModel, addModel } from "./voxel/model";
import { groupVoxels } from "./voxel/groupVoxels";
import { CHUNK_SIZE } from "./constants";
import { resolve } from "url";

export function loadWorld(name): Promise<any[]> {
  createScreen();

  const entities: any[] = require(`./${name}.json`);

  return loadSprites(entities)
    .then(() => groupTerrain(entities))
    .then(groupedEntities => {
      destroyScreen();

      return groupedEntities;
    });
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

function loadSprites(entities: any[]): Promise<any> {
  const spritesToLoad = new Set<string>();
  entities.forEach(
    entity => entity.sprite && spritesToLoad.add(entity.sprite.name)
  );

  return Promise.all(Array.from(spritesToLoad.values()).map(loadModel));
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
    const terrainVoxels = value.map(({ position, sprite }) => ({
      position,
      voxels: getModel(sprite.name).voxels
    }));

    const groupedTerrainVoxels = groupVoxels(terrainVoxels);
    addModel(key, groupedTerrainVoxels.voxels);

    otherEntities.push({
      id: id++,
      position: groupedTerrainVoxels.position,
      sprite: {
        name: key
      }
    });
  });

  return otherEntities.concat(
    terrainEntities.map(entity => ({ ...entity, sprite: undefined }))
  );
}
