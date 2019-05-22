import * as THREE from "three";
require("three/examples/js/controls/OrbitControls");

import { loadModel, FaceData, Model, FaceLookup } from "../model";
import { Color, toHexTriplet } from "../utils";

import { EntityPool } from "entity-component-system";

const GRID_SIZE = 16;
const DEBUG = false;
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

var controls = new THREE.OrbitControls(camera);
camera.position.set(GRID_SIZE * 1.5, 20, GRID_SIZE * 1.5);
controls.update();

if (SHADOWS) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
}

scene.add(new THREE.AmbientLight(SKY_COLOR));

export function renderSystem(entities: EntityPool, deltaTime: number): void {
  controls.update();
  renderer.render(scene, camera);
}

function createModelAt(
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

Promise.all(
  [
    "brick1",
    "chef",
    "grass1",
    "knight",
    "scientist1",
    "small_tree",
    "tall_grass",
    "woodcutter"
  ].map(loadModel)
).then(
  ([
    brick1,
    chef,
    grass1,
    knight,
    scientist,
    smallTree,
    tallGrass,
    woodcutter
  ]) => {
    for (let x = 0; x < 3; x++) {
      for (let z = 0; z < 3; z++) {
        createModelAt(grass1, scene, 1 - x, -1, 1 - z);
      }
    }

    createModelAt(woodcutter, scene, 0, 0, 0);
    createModelAt(smallTree, scene, -1, 0, 1);
    createModelAt(brick1, scene, -1, 0, -1);
    createModelAt(tallGrass, scene, 1, 0, -1);
    createModelAt(chef, scene, -1, 0, 0);
    createModelAt(scientist, scene, 1, 0, 0);
    createModelAt(knight, scene, 0, 0, -1);
  }
);
