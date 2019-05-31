
import { loadSprite } from "./loadSprite";
import { spriteToVoxels } from "./spriteToVoxels";
import { voxelsToFaces } from "./voxelsToFaces";
import { facesToGroup } from "./facesToGroup";
import { Voxels } from "./voxels";
import { Faces } from "./faces";

export interface Model {
  name: string;
  voxels: Voxels;
  faces: Faces;
  group: THREE.Group;
}

const models = new Map<string, Model>();

export function loadModel(name: string): Promise<void> {
  return loadSprite(name).then(({ size, data }) => {
    const voxels = spriteToVoxels({ size, data });
    addModel(name, voxels);
  });
}

export function addModel(name: string, voxels: Voxels) {
  const faces = voxelsToFaces(voxels);
  const group = facesToGroup(faces);
  models.set(name, { name, voxels, faces, group });
}

export function getModel(name: string): Model {
  return models.get(name);
}
