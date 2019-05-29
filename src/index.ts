import "./index.scss";

import { EntityComponentSystem, EntityPool } from "entity-component-system";
import { positionFactory } from "./entity/position";
import { spriteFactory } from "./entity/sprite";
import { renderSystem } from "./system/render";
import { EntityNames, SearchNames } from "./names";
import { walkFactory } from "./entity/walk";
import { pathToFactory } from "./entity/pathTo";
import { pathFindSystem } from "./system/pathFind";
import { dayNightSystem } from "./system/dayNight";
import { renderUi } from "./ui/render";
import { timeTriggerFactory } from "./entity/timeTrigger";
require("./system/render");

const ecs = new EntityComponentSystem();

const entities = new EntityPool();
entities.registerComponent(EntityNames.POSITION, positionFactory);
entities.registerComponent(EntityNames.SPRITE, spriteFactory);
entities.registerComponent(EntityNames.WALK, walkFactory);
entities.registerComponent(EntityNames.PATH, pathToFactory);
entities.registerComponent(EntityNames.TIME_TRIGGER, timeTriggerFactory);

entities.registerSearch(SearchNames.RENDERABLE, [EntityNames.SPRITE, EntityNames.POSITION]);
entities.registerSearch(SearchNames.PATHABLE, [EntityNames.PATH, EntityNames.POSITION]);
entities.registerSearch(SearchNames.TRIGGERABLE, [EntityNames.TIME_TRIGGER]);

ecs.add(renderSystem);
ecs.add(pathFindSystem);
ecs.add(dayNightSystem);

entities.load(require("./world.json"));

let lastTime = performance.now();
function run(time: number): void {
  var deltaTime = time - lastTime;
  lastTime = time;

  // HACK: Prevent walks jumping while models load.
  const clampedDeltaTime = Math.max(Math.min(deltaTime, 50), 1);
  ecs.run(entities, clampedDeltaTime);

  renderUi(deltaTime);

  requestAnimationFrame(run);
}
run(lastTime);
