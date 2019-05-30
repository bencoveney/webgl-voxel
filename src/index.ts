import "./index.scss";

import { EntityComponentSystem, EntityPool } from "entity-component-system";
import { positionFactory } from "./component/position";
import { spriteFactory } from "./component/sprite";
import { renderSystem } from "./system/render";
import { ComponentNames, SearchNames } from "./names";
import { terrainFactory } from "./component/terrain";
import { pathToFactory } from "./component/pathTo";
import { pathFindSystem } from "./system/pathFind";
import { dayNightSystem } from "./system/dayNight";
import { renderUi } from "./ui/render";
import { timeTriggerFactory } from "./component/timeTrigger";
import { loadWorld } from "./load";
require("./system/render");

type TickEcs = (deltaTime: number) => void;

function configureEcs(): TickEcs {
  const ecs = new EntityComponentSystem();

  const entities = new EntityPool();
  entities.registerComponent(ComponentNames.POSITION, positionFactory);
  entities.registerComponent(ComponentNames.SPRITE, spriteFactory);
  entities.registerComponent(ComponentNames.TERRAIN, terrainFactory);
  entities.registerComponent(ComponentNames.PATH, pathToFactory);
  entities.registerComponent(ComponentNames.TIME_TRIGGER, timeTriggerFactory);

  entities.registerSearch(SearchNames.RENDERABLE, [ComponentNames.SPRITE, ComponentNames.POSITION]);
  entities.registerSearch(SearchNames.PATHABLE, [ComponentNames.PATH, ComponentNames.POSITION]);
  entities.registerSearch(SearchNames.TRIGGERABLE, [ComponentNames.TIME_TRIGGER]);

  ecs.add(renderSystem);
  ecs.add(pathFindSystem);
  ecs.add(dayNightSystem);

  entities.load(require("./world.json"));

  return (deltaTime: number) => ecs.run(entities, deltaTime);
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

loadWorld("world").then(() => {
  const tickEcs = configureEcs();
  gameLoop(tickEcs);
});

