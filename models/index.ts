import { loadModel, getModel, addModel, saveModels } from "./voxel/model";
import { groupVoxels } from "./voxel/groupVoxels";
import { CHUNK_SIZE } from "../src/constants";
import * as fs from "fs";
import * as path from "path";

const entities: any[] = require(`../src/world.json`);

clean();

console.log(`Loaded ${entities.length} entities`);

loadSprites(entities)
  .then(() => groupTerrain(entities))
  .then(saveModels);

function loadSprites(entities: any[]): Promise<any> {
  const spritesToLoad = new Set<string>();
  entities.forEach(
    entity => entity.sprite && spritesToLoad.add(entity.sprite.name)
  );

  return Promise.all(Array.from(spritesToLoad.values()).map(loadModel));
}

function groupTerrain(entities: any[]) {
  const terrainEntities = entities.filter(
    entity => !!entity.position && !!entity.sprite && !!entity.terrain
  );

  const chunks = new Map<string, any[]>();
  terrainEntities.forEach(entity => {
    const chunkX = Math.floor(entity.position.x / CHUNK_SIZE);
    const chunkZ = Math.floor(entity.position.z / CHUNK_SIZE);
    const chunkKey = `chunk_${chunkX}_${chunkZ}`;
    chunks.set(chunkKey, (chunks.get(chunkKey) || []).concat(entity));
  });

  chunks.forEach((value, key) => {
    const terrainVoxels = value.map(({ position, sprite }) => ({
      position,
      voxels: getModel(sprite.name).voxels
    }));

    const groupedTerrainVoxels = groupVoxels(terrainVoxels);
    addModel(key, groupedTerrainVoxels.voxels);
  });
}

function clean() {
  const directory = "./models/compiled";
  console.log(`cleaning ${directory}`);
  const files = fs.readdirSync(directory);
  for (const file of files) {
    fs.unlinkSync(path.join(directory, file));
  }
}
