import * as THREE from "three";
import "three/examples/js/controls/OrbitControls";
import { EntityPool } from "entity-component-system";
import { loadModel, Model } from "./model";
import { Position } from "../../entity/position";
import { Sprite } from "../../entity/sprite";
import { SearchNames, EntityNames } from "../../names";

const GRID_SIZE = 16;
const SHADOWS = false;
const SKY_COLOR = 0x404070;

const scene = new THREE.Scene();

const aspectRatio = window.innerWidth / window.innerHeight;
const depth = 50;
const camera = new THREE.OrthographicCamera(-depth * aspectRatio, depth * aspectRatio, depth, -depth);

const zoom = 250
camera.position.set(-zoom, zoom, zoom);
camera.rotation.order = "YXZ";
camera.rotation.y = -Math.PI / 4;
camera.rotation.x = Math.atan(-1 / Math.sqrt(2));

const controls = new (THREE as any).OrbitControls(camera) as any;
controls.update();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight, true);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(SKY_COLOR);
window.document.body.appendChild(renderer.domElement);

const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(GRID_SIZE * 1.5, 32, GRID_SIZE * 1.5);
if (SHADOWS) {
  light.castShadow = true;
}
scene.add(light);

if (SHADOWS) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
}

scene.add(new THREE.AmbientLight(SKY_COLOR));

export function renderSystem(entities: EntityPool, deltaTime: number): void {
  // For each renderable entity...
  entities.find(SearchNames.RENDERABLE).forEach(entityId => {
    const sprite = entities.getComponent<Sprite>(entityId, EntityNames.SPRITE);
    const position = entities.getComponent<Position>(entityId, EntityNames.POSITION);
    const clampedPosition = clampPosition(position);
    const entityHash = hashComponents(sprite, clampedPosition);

    // Has it changed?
    if (lastUpdates.get(entityId) === entityHash) {
      return;
    }

    // Is there an instance of it?
    const object = objects.get(entityId);
    if (object) {
      object.position.set(clampedPosition.x, clampedPosition.y, clampedPosition.z);
      lastUpdates.set(entityId, entityHash);
      return;
    }

    // Does the model exist?
    const model = getModel(sprite.name);
    if (model) {
      const object = model.group.clone();
      scene.add(object);
      objects.set(entityId, object);
      object.position.set(clampedPosition.x, clampedPosition.y, clampedPosition.z);
      lastUpdates.set(entityId, entityHash);
      return;
    }
  });

  controls.update();
  renderer.render(scene, camera);
}

// Hash determines which components need to be updated.
const lastUpdates = new Map<number, string>();
function hashComponents({name}: Sprite, {x, y, z}: Position): string {
  return [name, x, y, z].join();
}

const models = new Map<string, "loading" | Model>();
function getModel(name: string): Model {
  const existing = models.get(name);
  if (existing === "loading") {
    return undefined;
  }
  if (existing === undefined) {
    models.set(name, "loading");
    loadModel(name).then(model => models.set(name, model));
    return undefined;
  }
  return existing;
}

const objects = new Map<number, THREE.Object3D>();

function clampPosition({x, y, z}: Position): Position {
  return {
    x: Math.floor(x * GRID_SIZE),
    y: Math.floor(y * GRID_SIZE),
    z: Math.floor(z * GRID_SIZE)
  }
}
