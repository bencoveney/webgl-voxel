import { loadSprite } from "./loadSprite";
import { spriteToVoxels } from "./spriteToVoxels";
import { voxelsToFaces } from "./voxelsToFaces";
import { Voxels } from "./voxels";
import { Faces } from "./faces";
import * as fs from "fs";

export interface Model {
  name: string;
  voxels: Voxels;
  faces: Faces;
}

const models = new Map<string, Model>();

export function loadModel(name: string): Promise<void> {
  console.log(`loading model ${name}`);
  return loadSprite(name).then(({ size, data }) => {
    console.log(`converting ${name} to voxels`);
    const voxels = spriteToVoxels({ size, data });
    addModel(name, voxels);
  });
}

export function addModel(name: string, voxels: Voxels) {
  console.log(`converting ${name} voxels to faces`);
  const faces = voxelsToFaces(voxels);
  console.log(`converting ${name} faces to mesh`);
  models.set(name, { name, voxels, faces });
}

export function getModel(name: string): Model {
  return models.get(name);
}

export function saveModels(): void {
  for (const model of models.values()) {
    fs.writeFileSync(
      `./models/compiled/${model.name}.json`,
      JSON.stringify(model.faces, null, 2)
    );
  }
}
