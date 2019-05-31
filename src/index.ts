import "./index.scss";

import { EntityComponentSystem, EntityPool } from "entity-component-system";
import { positionFactory } from "./component/position";
import { spriteFactory } from "./component/sprite";
import { renderSystem } from "./system/render";
import { ComponentNames, SearchNames } from "./constants";
import { terrainFactory } from "./component/terrain";
import { pathToFactory } from "./component/pathTo";
import { pathFindSystem } from "./system/pathFind";
import { dayNightSystem } from "./system/dayNight";
import { renderUi } from "./ui/render";
import { timeTriggerFactory } from "./component/timeTrigger";
import { loadWorld } from "./load";
require("./system/render");

type TickEcs = (deltaTime: number) => void;

function configureEcs(entities: any[]): TickEcs {
  const ecs = new EntityComponentSystem();

  const entityPool = new EntityPool();
  entityPool.registerComponent(ComponentNames.POSITION, positionFactory);
  entityPool.registerComponent(ComponentNames.SPRITE, spriteFactory);
  entityPool.registerComponent(ComponentNames.TERRAIN, terrainFactory);
  entityPool.registerComponent(ComponentNames.PATH, pathToFactory);
  entityPool.registerComponent(ComponentNames.TIME_TRIGGER, timeTriggerFactory);

  entityPool.registerSearch(SearchNames.RENDERABLE, [ComponentNames.SPRITE, ComponentNames.POSITION]);
  entityPool.registerSearch(SearchNames.PATHABLE, [ComponentNames.PATH, ComponentNames.POSITION]);
  entityPool.registerSearch(SearchNames.TRIGGERABLE, [ComponentNames.TIME_TRIGGER]);

  ecs.add(renderSystem);
  ecs.add(pathFindSystem);
  ecs.add(dayNightSystem);

  entityPool.load(entities);

  return (deltaTime: number) => ecs.run(entityPool, deltaTime);
}

function gameLoop(onTick: TickEcs) {
  let lastTime = performance.now();
  function run(time: number): void {
    var deltaTime = time - lastTime;
    lastTime = time;

    // HACK: Prevent walks jumping while models load.
    const clampedDeltaTime = Math.max(Math.min(deltaTime, 50), 1);
    onTick(clampedDeltaTime);

    renderUi(deltaTime);

    requestAnimationFrame(run);
  }
  run(lastTime);
}

loadWorld("world").then(entities => {
  const tickEcs = configureEcs(entities);
  gameLoop(tickEcs);
});

