import "three/examples/js/controls/OrbitControls";
import "three/examples/js/loaders/deprecated/LegacyJSONLoader";
import { EntityPool } from "entity-component-system";
import { Position, Rotation } from "../component/position";
import { Sprite } from "../component/sprite";
import { SearchNames, ComponentNames, GRID_SIZE } from "../constants";
import { Vector3 } from "../utils";
import * as THREE from "three";
import { loadModel } from "../modelLoader";
const CLEAR_COLOR = 0x6df7c1;
const SKY_COLOR = 0xdddddd;

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
controls.addEventListener("change", () => (needsRender = true));

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

let needsRender = false;

export const intersectionPoint: Partial<Vector3> = {};

const sceneObjects = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
document.addEventListener("mousemove", onDocumentMouseMove, false);
function onDocumentMouseMove(event) {
  event.preventDefault();
  mouse.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(sceneObjects);
  if (intersects.length > 0) {
    const point = intersects[0].point;
    intersectionPoint.x = Math.floor(point.x / 16);
    intersectionPoint.y = Math.floor(point.y / 16);
    intersectionPoint.z = Math.floor(point.z / 16);
  } else {
    intersectionPoint.x = undefined;
    intersectionPoint.y = undefined;
    intersectionPoint.z = undefined;
  }
}

export function renderSystem(entities: EntityPool, deltaTime: number): void {
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
    const mesh = loadModel(sprite.name);
    if (mesh) {
      const object = mesh.clone();
      object.matrixAutoUpdate = false;
      scene.add(object);
      sceneObjects.push(object);
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
