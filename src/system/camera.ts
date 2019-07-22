import * as THREE from "three";
import { EntityPool } from "entity-component-system";
import { ComponentNames, GRID_SIZE } from "../constants";
import { Position } from "../component/position";
import { Vector3, addKeyListener } from "../utils";

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

camera.rotation.order = "YXZ";
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

  updatePosition(position, targetRotation);

  const positionHash = hashPosition(position);
  if (lastPositionHash == positionHash) {
    return;
  }

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
  const oneEighthTurn = Math.PI / 4;
  const threeEighthTurn = (3 * Math.PI) / 4;

  const x = (position.x + 0.5) * GRID_SIZE;
  const y = position.y * GRID_SIZE;
  const z = (position.z + 0.5) * GRID_SIZE;

  switch (rotation) {
    case CameraPosition.FrontRight:
      camera.position.set(zoom + x, zoom + y, zoom + z);
      camera.rotation.y = +oneEighthTurn;
      break;

    case CameraPosition.FrontLeft:
      camera.position.set(-zoom + x, zoom + y, zoom + z);
      camera.rotation.y = -oneEighthTurn;
      break;

    case CameraPosition.BackLeft:
      camera.position.set(-zoom + x, zoom + y, -zoom + z);
      camera.rotation.y = -threeEighthTurn;
      break;

    case CameraPosition.BackRight:
      camera.position.set(zoom + x, zoom + y, -zoom + z);
      camera.rotation.y = +threeEighthTurn;
      break;
  }

  needsUpdate = true;
}

function updateTargetCameraRotation(direction: 1 | -1) {
  targetRotation = (4 + targetRotation + direction) % 4;
}

addKeyListener("ArrowLeft", () => updateTargetCameraRotation(1));
addKeyListener("ArrowRight", () => updateTargetCameraRotation(-1));
