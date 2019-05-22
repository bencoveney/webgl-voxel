import "./index.scss";

import { EntityComponentSystem, EntityPool } from "entity-component-system";
import { EntityNames } from "./ecsNames";
import { positionFactory } from "./entity/position";
import { spriteFactory } from "./entity/sprite";
import { renderSystem } from "./system/render";
require("./system/render");

const ecs = new EntityComponentSystem();

// TODO: Add systems.
ecs.add(renderSystem);

// TODO: Add entities.
const entities = new EntityPool();
entities.registerComponent(EntityNames.position, positionFactory);
entities.registerComponent(EntityNames.sprite, spriteFactory);

entities.load(require("./world.json"));
console.log(entities.save());

let lastTime = performance.now();
function run(time: number): void {
  var deltaTime = time - lastTime;
  lastTime = time;
  ecs.run(entities, deltaTime);
  requestAnimationFrame(run);
}
run(lastTime);
