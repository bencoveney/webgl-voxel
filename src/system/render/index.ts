import * as THREE from "three";
require("three/examples/js/controls/OrbitControls");

import { EntityPool } from "entity-component-system";

import { loadModel, Model } from "./model";
import { Position } from "../../entity/position";
import { Sprite } from "../../entity/sprite";
import { SearchNames, EntityNames } from "../../ecsNames";
import { createModelAt } from "./createModelAt";

const GRID_SIZE = 16;
const SHADOWS = false;
const SKY_COLOR = 0x404070;

const scene = new THREE.Scene();

var aspectRatio = window.innerWidth / window.innerHeight;
var depth = 30;
const camera = new THREE.OrthographicCamera(-depth * aspectRatio, depth * aspectRatio, depth, -depth);
camera.position.set(0, 100, 0);
camera.rotation.order = "YXZ";
camera.rotation.y = -Math.PI / 4;
camera.rotation.x = Math.atan(-1 / Math.sqrt(2));

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(SKY_COLOR);
window.document.body.appendChild(renderer.domElement);

const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(GRID_SIZE * 1.5, 32, GRID_SIZE * 1.5);
if (SHADOWS) {
  light.castShadow = true;
}
scene.add(light);

// @ts-ignore
var controls = new THREE.OrbitControls(camera);
camera.position.set(GRID_SIZE * 1.5, 20, GRID_SIZE * 1.5);
controls.update();

if (SHADOWS) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
}

scene.add(new THREE.AmbientLight(SKY_COLOR));

export function renderSystem(entities: EntityPool, deltaTime: number): void {
  // For each renderable entity...
  entities.find(SearchNames.renderable).forEach(entityId => {
    const sprite = entities.getComponent(entityId, EntityNames.sprite);
    const position = entities.getComponent(entityId, EntityNames.position);
    const entityHash = hashComponents(sprite, position);

    // Has it changed?
    if (lastUpdates.get(entityId) === entityHash) {
      return;
    }

    const model = getModel(sprite.name);
    if (model) {
      createModelAt(model, scene, position.x, position.y, position.z);
      lastUpdates.set(entityId, entityHash);
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
