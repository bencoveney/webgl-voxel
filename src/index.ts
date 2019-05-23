import "./index.scss";

import { EntityComponentSystem, EntityPool } from "entity-component-system";
import { positionFactory } from "./entity/position";
import { spriteFactory } from "./entity/sprite";
import { renderSystem } from "./system/render";
import { EntityNames, SearchNames } from "./names";
import { walkFactory } from "./entity/walk";
import { pathToFactory } from "./entity/pathTo";
import { pathFindSystem } from "./system/pathFind";
require("./system/render");

const ecs = new EntityComponentSystem();

const entities = new EntityPool();
entities.registerComponent(EntityNames.position, positionFactory);
entities.registerComponent(EntityNames.sprite, spriteFactory);
entities.registerComponent(EntityNames.walk, walkFactory);
entities.registerComponent(EntityNames.path, pathToFactory);

entities.registerSearch(SearchNames.renderable, [EntityNames.sprite, EntityNames.position]);
entities.registerSearch(SearchNames.pathable, [EntityNames.path, EntityNames.position]);

ecs.add(renderSystem);
ecs.add(pathFindSystem);

entities.load(require("./world.json"));

let lastTime = performance.now();
function run(time: number): void {
  var deltaTime = time - lastTime;
  lastTime = time;

  // HACK: Prevent walks jumping while models load.
  const clampedDeltaTime = Math.min(deltaTime, 50);
  ecs.run(entities, clampedDeltaTime);

  requestAnimationFrame(run);
}
run(lastTime);
