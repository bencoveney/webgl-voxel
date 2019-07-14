import { EntityPool } from "entity-component-system";
import { Position, Rotation } from "../component/position";
import { Sprite } from "../component/sprite";
import { SearchNames, ComponentNames, GRID_SIZE } from "../constants";
import * as THREE from "three";
import { loadModel } from "../modelLoader";
import { getCamera, cameraNeedsUpdate } from "./camera";
const CLEAR_COLOR = 0x6df7c1;
const SKY_COLOR = 0xdddddd;

const scene = new THREE.Scene();

const sceneObjects: THREE.Object3D[] = [];
const camera = getCamera(sceneObjects);

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  alpha: false,
  stencil: false,
  powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight, true);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(CLEAR_COLOR);
window.document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(SKY_COLOR));

var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

let needsRender = true;

export function renderSystem(entities: EntityPool): void {
  // For each renderable entity...
  entities.find(SearchNames.RENDERABLE).forEach(entityId => {
    const sprite = entities.getComponent<Sprite>(
      entityId,
      ComponentNames.SPRITE
    );
    const position = entities.getComponent<Position>(
      entityId,
      ComponentNames.POSITION
    );
    const clampedPosition = clampPosition(position);
    const entityHash = hashComponents(sprite, clampedPosition);

    // Has it changed?
    if (lastUpdates.get(entityId) === entityHash) {
      return;
    }

    needsRender = true;

    // Is there an instance of it?
    const object = objects.get(entityId);
    if (object) {
      setPosition(object, clampedPosition);
      lastUpdates.set(entityId, entityHash);
      return;
    }

    // Does the model exist?
    const mesh = loadModel(sprite.name);
    if (mesh) {
      const object = mesh.clone();
      object.matrixAutoUpdate = false;
      sceneObjects.push(object);

      const rotationWrapper = new THREE.Object3D();
      rotationWrapper.matrixAutoUpdate = false;
      rotationWrapper.add(object);

      scene.add(rotationWrapper);

      objects.set(entityId, rotationWrapper);

      setPosition(rotationWrapper, clampedPosition);

      lastUpdates.set(entityId, entityHash);
      return;
    }
  });

  if (needsRender || cameraNeedsUpdate()) {
    renderer.render(scene, camera);
    needsRender = false;
  }
}

// Hash determines which components need to be updated.
const lastUpdates = new Map<number, string>();
function hashComponents(
  { name }: Sprite,
  { x, y, z, rotation }: Position
): string {
  return [name, x, y, z, rotation].join();
}

const objects = new Map<number, THREE.Object3D>();

function setPosition(object: THREE.Object3D, position: Position) {
  if (object.children[0].rotation.y !== position.rotation) {
    object.children[0].rotation.set(0, position.rotation, 0);
    object.children[0].updateMatrix();
  }
  object.position.set(position.x, position.y, position.z);
  object.updateMatrix();
}

function clampPosition({ x, y, z, rotation }: Position): Position {
  x = Math.floor(x * GRID_SIZE);
  y = Math.floor(y * GRID_SIZE);
  z = Math.floor(z * GRID_SIZE);

  switch (rotation) {
    case Rotation.TURN_0:
    default:
      break;
    case Rotation.TURN_1:
      z = z + GRID_SIZE - 1;
      break;
    case Rotation.TURN_2:
      x = x + GRID_SIZE - 1;
      z = z + GRID_SIZE - 1;
      break;
    case Rotation.TURN_3:
      x = x + GRID_SIZE - 1;
      break;
  }

  rotation = (Math.PI / 2) * rotation;

  return { x, y, z, rotation };
}
