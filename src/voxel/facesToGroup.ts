import * as THREE from "three";
import { FaceData, FaceLookup, Faces } from "./faces";
import { toHexTriplet, Color } from "../utils";
import { DEBUG } from "../constants";

export function facesToGroup({
  topFaces,
  bottomFaces,
  leftFaces,
  rightFaces,
  backFaces,
  frontFaces
}: Faces): THREE.Group {
  const result = new THREE.Group();

  function createSides(voxels, side) {
    voxels.forEach(definition => {
      const voxel = createFace(definition, side);
      result.add(voxel);
    });
  }

  createSides(leftFaces, "left");
  createSides(rightFaces, "right");
  createSides(topFaces, "top");
  createSides(bottomFaces, "bottom");
  createSides(frontFaces, "front");
  createSides(backFaces, "back");

  return result;
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
    : new THREE.MeshLambertMaterial({ color: threeColor });

  materialCache[hexTriplet] = material;

  return material;
}

function createMesh(geometry: THREE.Geometry, material: THREE.Material) {
  if (DEBUG) {
    const wireframe = new THREE.WireframeGeometry(geometry);
    return new THREE.LineSegments(wireframe, material);
  } else {
    return new THREE.Mesh(geometry, material);
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

function createFace(data: FaceData, side) {
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
        data[FaceLookup.x] - 0.5,
        data[FaceLookup.y] + 0.5 * data[FaceLookup.height] - 0.5,
        data[FaceLookup.z] + 0.5 * data[FaceLookup.width] - 0.5
      );
      break;
    case "right":
      mesh.rotateY(quarterTurn);
      mesh.position.set(
        data[FaceLookup.x] + 0.5,
        data[FaceLookup.y] + 0.5 * data[FaceLookup.height] - 0.5,
        data[FaceLookup.z] + 0.5 * data[FaceLookup.width] - 0.5
      );
      break;
    case "bottom":
      mesh.rotateX(quarterTurn);
      mesh.position.set(
        data[FaceLookup.x] + 0.5 * data[FaceLookup.width] - 0.5,
        data[FaceLookup.y] - 0.5,
        data[FaceLookup.z] + 0.5 * data[FaceLookup.height] - 0.5
      );
      break;
    case "top":
      mesh.rotateX(-quarterTurn);
      mesh.position.set(
        data[FaceLookup.x] + 0.5 * data[FaceLookup.width] - 0.5,
        data[FaceLookup.y] + 0.5,
        data[FaceLookup.z] + 0.5 * data[FaceLookup.height] - 0.5
      );
      break;
    case "back":
      mesh.rotateX(halfTurn);
      mesh.position.set(
        data[FaceLookup.x] + 0.5 * data[FaceLookup.width] - 0.5,
        data[FaceLookup.y] + 0.5 * data[FaceLookup.height] - 0.5,
        data[FaceLookup.z] - 0.5
      );
      break;
    case "front":
      mesh.position.set(
        data[FaceLookup.x] + 0.5 * data[FaceLookup.width] - 0.5,
        data[FaceLookup.y] + 0.5 * data[FaceLookup.height] - 0.5,
        data[FaceLookup.z] + 0.5
      );
      break;
  }
  return mesh;
}
