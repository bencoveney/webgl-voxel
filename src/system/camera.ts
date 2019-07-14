import * as THREE from "three";
import { EntityPool } from "entity-component-system";
import { ComponentNames, GRID_SIZE } from "../constants";
import { Position } from "../component/position";
import { Vector3 } from "../utils";

enum CameraPosition {
  // +x +z
  FrontRight = 0,
  // -x +z
  FrontLeft = 1,
  // -x -z
  BackLeft = 2,
  // +x -z
  BackRight = 3
}

const aspectRatio = window.innerWidth / window.innerHeight;
const depth = 75;
const camera = new THREE.OrthographicCamera(
  -depth * aspectRatio,
  depth * aspectRatio,
  depth,
  -depth
);

let needsUpdate = true;

const zoom = 100;
let targetRotation = CameraPosition.FrontLeft;

camera.rotation.x = Math.atan(-1 / Math.sqrt(2));
updatePosition({ rotation: -1, x: 0, y: 0, z: 0 }, targetRotation);

let target;
let lastPositionHash;

export const intersectionPoint: Partial<Vector3> = {};

let sceneObjects: THREE.Object3D[];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
document.addEventListener("mousemove", onDocumentMouseMove, false);
function onDocumentMouseMove(event) {
  event.preventDefault();
  if (!sceneObjects || sceneObjects.length == 0) {
    return;
  }

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

export function cameraSystem(entities: EntityPool, deltaTime: number) {
  if (!target) {
    return;
  }

  const position = entities.getComponent<Position>(
    target,
    ComponentNames.POSITION
  );

  const positionHash = hashPosition(position);
  if (lastPositionHash == positionHash) {
    return;
  }

  updatePosition(position, targetRotation);

  lastPositionHash = positionHash;
}

export function setCameraTarget(entityId: number) {
  target = entityId;
}

export function getCamera(sceneObjectsRef: THREE.Object3D[]): THREE.Camera {
  sceneObjects = sceneObjectsRef;
  return camera;
}

export function cameraNeedsUpdate(): boolean {
  let temp = needsUpdate;
  needsUpdate = false;
  return temp;
}

function hashPosition(position: Position) {
  return `${position.x}_${position.y}_${position.z}`;
}

function updatePosition(position: Position, rotation: CameraPosition) {
  camera.position.set(
    -zoom + position.x * GRID_SIZE,
    zoom + position.y * GRID_SIZE,
    zoom + position.z * GRID_SIZE
  );

  camera.rotation.order = "YXZ";
  camera.rotation.y = -Math.PI / 4;

  needsUpdate = true;
}
