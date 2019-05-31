import * as THREE from "three";
import { FaceData, FaceLookup, Faces } from "./faces";
import { toHexTriplet, Color } from "../utils";
import { DEBUG } from "../constants";
import { Vector3, Mesh } from "three";

export function facesToMesh({
  topFaces,
  bottomFaces,
  leftFaces,
  rightFaces,
  backFaces,
  frontFaces
}: Faces): THREE.Mesh {
  const geometry = new THREE.Geometry();

  function createSides(voxels, side) {
    voxels.forEach(definition => {
      createFace(definition, side, geometry);
    });
  }

  createSides(leftFaces, "left");
  createSides(rightFaces, "right");
  createSides(topFaces, "top");
  createSides(bottomFaces, "bottom");
  createSides(frontFaces, "front");
  createSides(backFaces, "back");

  return new Mesh(geometry, materials.map(material => material.material));
}

interface Material {
  hexTriplet: number;
  material: THREE.Material;
}
const materials: Material[] = [];
function createMaterial(color: Color): number {
  const hexTriplet = toHexTriplet(color);

  const found = materials.findIndex(
    material => material.hexTriplet === hexTriplet
  );
  if (found != -1) {
    return found;
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

  materials.push({ hexTriplet, material });
  return materials.length - 1;
}

const geometryCache = {};
function createGeometry(width: number, height: number): THREE.Geometry {
  if (geometryCache[width] === undefined) {
    geometryCache[width] = {};
  }

  if (geometryCache[width][height] === undefined) {
    geometryCache[width][height] = new THREE.PlaneGeometry(width, height);
  }

  return geometryCache[width][height];
}

const quarterTurn = Math.PI / 2;
const halfTurn = Math.PI;

function createFace(data: FaceData, side, mainMesh: THREE.Geometry) {
  const material = createMaterial({
    r: data[FaceLookup.r],
    g: data[FaceLookup.g],
    b: data[FaceLookup.b]
  });
  const geometry = createGeometry(
    data[FaceLookup.width],
    data[FaceLookup.height]
  );
  const matrix = new THREE.Matrix4();
  switch (side) {
    case "left":
      matrix.makeRotationY(-quarterTurn);
      matrix.setPosition(
        new Vector3(
          data[FaceLookup.x] - 0.5,
          data[FaceLookup.y] + 0.5 * data[FaceLookup.height] - 0.5,
          data[FaceLookup.z] + 0.5 * data[FaceLookup.width] - 0.5
        )
      );
      break;
    case "right":
      matrix.makeRotationY(quarterTurn);
      matrix.setPosition(
        new Vector3(
          data[FaceLookup.x] + 0.5,
          data[FaceLookup.y] + 0.5 * data[FaceLookup.height] - 0.5,
          data[FaceLookup.z] + 0.5 * data[FaceLookup.width] - 0.5
        )
      );
      break;
    case "bottom":
      matrix.makeRotationX(quarterTurn);
      matrix.setPosition(
        new Vector3(
          data[FaceLookup.x] + 0.5 * data[FaceLookup.width] - 0.5,
          data[FaceLookup.y] - 0.5,
          data[FaceLookup.z] + 0.5 * data[FaceLookup.height] - 0.5
        )
      );
      break;
    case "top":
      matrix.makeRotationX(-quarterTurn);
      matrix.setPosition(
        new Vector3(
          data[FaceLookup.x] + 0.5 * data[FaceLookup.width] - 0.5,
          data[FaceLookup.y] + 0.5,
          data[FaceLookup.z] + 0.5 * data[FaceLookup.height] - 0.5
        )
      );
      break;
    case "back":
      matrix.makeRotationX(halfTurn);
      matrix.setPosition(
        new Vector3(
          data[FaceLookup.x] + 0.5 * data[FaceLookup.width] - 0.5,
          data[FaceLookup.y] + 0.5 * data[FaceLookup.height] - 0.5,
          data[FaceLookup.z] - 0.5
        )
      );
      break;
    case "front":
      matrix.setPosition(
        new Vector3(
          data[FaceLookup.x] + 0.5 * data[FaceLookup.width] - 0.5,
          data[FaceLookup.y] + 0.5 * data[FaceLookup.height] - 0.5,
          data[FaceLookup.z] + 0.5
        )
      );
      break;
  }
  mainMesh.merge(geometry, matrix, material);
}
