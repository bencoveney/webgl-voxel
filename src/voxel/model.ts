
import { loadSprite } from "./loadSprite";
import { spriteToVoxels } from "./spriteToVoxels";
import { voxelsToFaces } from "./voxelsToFaces";
import { facesToGroup } from "./facesToGroup";

export interface Model {
  name: string;
  size: number;
  group: THREE.Group;
}

const models = new Map<string, Model>();

export function loadModel(name: string): Promise<void> {
  return loadSprite(name).then(({ size, data }) => {
    const voxels = spriteToVoxels({ size, data });
    const faces = voxelsToFaces(voxels);
    const group = facesToGroup(faces);
    models.set(name, { name, size, group });
  });
}

export function getModel(name: string): Model {
  return models.get(name);
}
