import * as THREE from "three";
import "three/examples/js/controls/OrbitControls";
import { EntityPool } from "entity-component-system";
import { getModel } from "../voxel/model";
import { Position, Rotation } from "../component/position";
import { Sprite } from "../component/sprite";
import { SearchNames, ComponentNames, GRID_SIZE } from "../constants";

const CLEAR_COLOR = 0x6DF7C1;
const SKY_COLOR = 0xDDDDDD;

const scene = new THREE.Scene();

const aspectRatio = window.innerWidth / window.innerHeight;
const depth = 75;
const camera = new THREE.OrthographicCamera(
  -depth * aspectRatio,
  depth * aspectRatio,
  depth,
  -depth
);

const zoom = 250;
camera.position.set(-zoom, zoom, zoom);
camera.rotation.order = "YXZ";
camera.rotation.y = -Math.PI / 4;
camera.rotation.x = Math.atan(-1 / Math.sqrt(2));

const controls = new (THREE as any).OrbitControls(camera) as any;
controls.update();
controls.addEventListener("change", () => needsRender = true);

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  alpha: false,
  stencil: false,
  powerPreference: "high-performance",

});
renderer.setSize(window.innerWidth, window.innerHeight, true);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(CLEAR_COLOR);
window.document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(SKY_COLOR));

var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );

let needsRender = false;

export function renderSystem(entities: EntityPool, deltaTime: number): void {
  // For each renderable entity...
  entities.find(SearchNames.RENDERABLE).forEach(entityId => {
    const sprite = entities.getComponent<Sprite>(entityId, ComponentNames.SPRITE);
    const position = entities.getComponent<Position>(entityId, ComponentNames.POSITION);
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
      object.position.set(
        clampedPosition.x,
        clampedPosition.y,
        clampedPosition.z
      );
      object.rotateY((Math.PI / 2) * clampedPosition.rotation);
      object.updateMatrix();
      lastUpdates.set(entityId, entityHash);
      return;
    }

    // Does the model exist?
    const model = getModel(sprite.name);
    if (model) {
      const object = model.mesh.clone();
      object.matrixAutoUpdate = false;
      scene.add(object);
      objects.set(entityId, object);
      setPosition(object, clampedPosition);
      object.updateMatrix();
      lastUpdates.set(entityId, entityHash);
      return;
    }
  });

  controls.update();

  if (needsRender) {
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

function clampPosition({ x, y, z, rotation }: Position): Position {
  return {
    x: Math.floor(x * GRID_SIZE),
    y: Math.floor(y * GRID_SIZE),
    z: Math.floor(z * GRID_SIZE),
    rotation: rotation
  };
}

function setPosition(object: THREE.Object3D, { x, y, z, rotation }: Position) {
  switch (rotation) {
    case Rotation.TURN_0:
      object.position.set(x, y, z);
      break;
    case Rotation.TURN_1:
      object.position.set(x, y, z + GRID_SIZE - 1);
      break;
    case Rotation.TURN_2:
      object.position.set(x + GRID_SIZE - 1, y, z + GRID_SIZE - 1);
      break;
    case Rotation.TURN_3:
      object.position.set(x + GRID_SIZE - 1, y, z);
      break;
  }
  object.rotateY((Math.PI / 2) * rotation);
}
