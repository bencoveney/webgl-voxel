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

const cameraRadius = Math.SQRT2;

const oneEighthTurn = Math.PI / 4;
const threeEighthTurn = (3 * Math.PI) / 4;

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
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

let targetPosition = CameraPosition.FrontLeft;
let targetRadians = rotationToAngle(targetPosition);

let actualRadians = targetRadians;

camera.rotation.order = "YXZ";
camera.rotation.x = Math.atan(-1 / Math.sqrt(2));
updatePosition({ rotation: -1, x: 0, y: 0, z: 0 }, actualRadians);

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

  if (targetRadians != actualRadians) {
    const diff = targetRadians - actualRadians;
    if (diff < 0.05 && diff > -0.05) {
      actualRadians = targetRadians;
    } else {
      const moveDirection = targetRadians - actualRadians > 0 ? 1 : -1;
      const tweenAmount = moveDirection * 0.1;
      actualRadians = actualRadians + tweenAmount;
    }
  }

  updatePosition(position, actualRadians);

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

function updatePosition(position: Position, radians: number) {
  const x = (position.x + 0.5) * GRID_SIZE;
  const y = position.y * GRID_SIZE;
  const z = (position.z + 0.5) * GRID_SIZE;

  camera.rotation.y = radians;

  const degrees = toDegrees(radians);

  const cameraPosition = rotationToPosition(radians);
  camera.position.set(
    cameraPosition.x + x,
    cameraPosition.y + y,
    cameraPosition.z + z
  );

  console.log(degrees);

  needsUpdate = true;
}

function updateTargetCameraRotation(direction: 1 | -1) {
  targetPosition = (4 + targetPosition + direction) % 4;
  targetRadians = rotationToAngle(targetPosition);
}

function rotationToAngle(rotation: CameraPosition) {
  switch (rotation) {
    case CameraPosition.FrontRight:
      return +oneEighthTurn;

    case CameraPosition.FrontLeft:
      return -oneEighthTurn;

    case CameraPosition.BackLeft:
      return -threeEighthTurn;

    case CameraPosition.BackRight:
      return +threeEighthTurn;
  }

  throw new Error("Bad rotation");
}

function rotationToPosition(degrees: number): Vector3 {
  return {
    x: Math.sin(degrees) * zoom,
    y: zoom,
    z: Math.cos(degrees) * zoom
  };
}

addKeyListener("ArrowLeft", () => updateTargetCameraRotation(1));
addKeyListener("ArrowRight", () => updateTargetCameraRotation(-1));
