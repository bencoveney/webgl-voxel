import { loadModel, getModel, addModel } from "./voxel/model";
import { groupVoxels } from "./voxel/groupVoxels";
import { CHUNK_SIZE } from "./constants";

export function loadWorld(name): Promise<any[]> {
  const loading = document.createElement("div");
  loading.setAttribute("id", "loading");
  loading.innerText = "Loading!";
  document.body.appendChild(loading);

  const entities: any[] = require(`./${name}.json`);

  return loadSprites(entities).then(() => {
    const groupedEntities = groupTerrain(entities);
    document.body.removeChild(loading);
    return groupedEntities;
  });
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

  return otherEntities;
}
