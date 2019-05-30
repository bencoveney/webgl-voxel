import { loadModel } from "./voxel/model";

export function loadWorld(name): Promise<any[]> {
  const loading = document.createElement("div");
  loading.setAttribute("id", "loading");
  loading.innerText = "Loading!";
  document.body.appendChild(loading);

  const spritesToLoad = new Set<string>();

  const entities: any[] = require(`./${name}.json`);

  entities.forEach(
    entity => entity.sprite && spritesToLoad.add(entity.sprite.name)
  );

  return Promise.all(Array.from(spritesToLoad.values()).map(loadModel)).then(
    () => {
      document.body.removeChild(loading);
      return entities;
    }
  );
}
