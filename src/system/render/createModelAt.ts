import { Model, FaceLookup, FaceData } from "./model";
import { Color, toHexTriplet } from "../../utils";
import * as THREE from "three";

const DEBUG = false;
const GRID_SIZE = 16;
const SHADOWS = false;

export function createModelAt(
  model: Model,
  scene: THREE.Scene,
  x: number,
  y: number,
  z: number
) {
  function createSides(voxels, side) {
    voxels.forEach(definition => {
      const voxel = createFace(
        definition,
        x * GRID_SIZE,
        y * GRID_SIZE,
        z * GRID_SIZE,
        side
      );
      scene.add(voxel);
    });
  }

  createSides(model.leftFaces, "left");
  createSides(model.rightFaces, "right");
  createSides(model.topFaces, "top");
  createSides(model.bottomFaces, "bottom");
  createSides(model.frontFaces, "front");
  createSides(model.backFaces, "back");
}

const materialCache = {};
function createMaterial(color: Color): THREE.Material {
  const hexTriplet = toHexTriplet(color);

  if (materialCache[hexTriplet]) {
    return materialCache[hexTriplet];
  }

  const threeColor = new THREE.Color(hexTriplet);

  let material = DEBUG
    ? new THREE.LineBasicMaterial({
        color: threeColor,
        linewidth: 1,
        depthTest: false,
        transparent: true
      })
    : SHADOWS
    ? new THREE.MeshStandardMaterial({ color: threeColor })
    : new THREE.MeshLambertMaterial({ color: threeColor });

  materialCache[hexTriplet] = material;

  return material;
}

function createMesh(geometry: THREE.Geometry, material: THREE.Material) {
  if (DEBUG) {
    const wireframe = new THREE.WireframeGeometry(geometry);
    return new THREE.LineSegments(wireframe, material);
  } else {
    const mesh = new THREE.Mesh(geometry, material);

    if (SHADOWS) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }

    return mesh;
  }
}

const geometryCache = {};
function createGeometry(width: number, height: number) {
  if (geometryCache[width] === undefined) {
    geometryCache[width] = {};
  }

  if (geometryCache[width][height] === undefined) {
    geometryCache[width][height] = new THREE.PlaneBufferGeometry(width, height);
  }

  return geometryCache[width][height];
}

const quarterTurn = Math.PI / 2;
const halfTurn = Math.PI;

function createFace(data: FaceData, dx, dy, dz, side) {
  const material = createMaterial({
    r: data[FaceLookup.r],
    g: data[FaceLookup.g],
    b: data[FaceLookup.b]
  });
  const geometry = createGeometry(
    data[FaceLookup.width],
    data[FaceLookup.height]
  );
  const mesh = createMesh(geometry, material);
  switch (side) {
    case "left":
      mesh.rotateY(-quarterTurn);
      mesh.position.set(
        data[FaceLookup.x] + dx - 0.5,
        data[FaceLookup.y] + dy + 0.5 * data[FaceLookup.height] - 0.5,
        data[FaceLookup.z] + dz + 0.5 * data[FaceLookup.width] - 0.5
      );
      break;
    case "right":
      mesh.rotateY(quarterTurn);
      mesh.position.set(
        data[FaceLookup.x] + dx + 0.5,
        data[FaceLookup.y] + dy + 0.5 * data[FaceLookup.height] - 0.5,
        data[FaceLookup.z] + dz + 0.5 * data[FaceLookup.width] - 0.5
      );
      break;
    case "bottom":
      mesh.rotateX(quarterTurn);
      mesh.position.set(
        data[FaceLookup.x] + dx + 0.5 * data[FaceLookup.width] - 0.5,
        data[FaceLookup.y] + dy - 0.5,
        data[FaceLookup.z] + dz + 0.5 * data[FaceLookup.height] - 0.5
      );
      break;
    case "top":
      mesh.rotateX(-quarterTurn);
      mesh.position.set(
        data[FaceLookup.x] + dx + 0.5 * data[FaceLookup.width] - 0.5,
        data[FaceLookup.y] + dy + 0.5,
        data[FaceLookup.z] + dz + 0.5 * data[FaceLookup.height] - 0.5
      );
      break;
    case "back":
      mesh.rotateX(halfTurn);
      mesh.position.set(
        data[FaceLookup.x] + dx + 0.5 * data[FaceLookup.width] - 0.5,
        data[FaceLookup.y] + dy + 0.5 * data[FaceLookup.height] - 0.5,
        data[FaceLookup.z] + dz - 0.5
      );
      break;
    case "front":
      mesh.position.set(
        data[FaceLookup.x] + dx + 0.5 * data[FaceLookup.width] - 0.5,
        data[FaceLookup.y] + dy + 0.5 * data[FaceLookup.height] - 0.5,
        data[FaceLookup.z] + dz + 0.5
      );
      break;
  }
  return mesh;
}
