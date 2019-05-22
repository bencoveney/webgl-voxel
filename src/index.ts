import "./index.scss";

import { EntityComponentSystem, EntityPool } from "entity-component-system";
import { positionFactory } from "./entity/position";
import { spriteFactory } from "./entity/sprite";
import { renderSystem } from "./system/render";
import { EntityNames, SearchNames } from "./ecsNames";
require("./system/render");

const ecs = new EntityComponentSystem();

const entities = new EntityPool();
entities.registerComponent(EntityNames.position, positionFactory);
entities.registerComponent(EntityNames.sprite, spriteFactory);

entities.registerSearch(SearchNames.renderable, [EntityNames.sprite, EntityNames.position]);

ecs.add(renderSystem);

entities.load(require("./world.json"));

let lastTime = performance.now();
function run(time: number): void {
  var deltaTime = time - lastTime;
  lastTime = time;
  ecs.run(entities, deltaTime);
  requestAnimationFrame(run);
}
run(lastTime);
