import "./index.scss";

import * as THREE from "three";

// @ts-ignore
window.THREE = THREE;
require("three/examples/js/controls/OrbitControls");

import { loadModel, Voxel, FaceData, Model, FaceLookup } from "./model";
import { Color, toHexTriplet } from "./utils";

function initScene(): THREE.Scene {
  return new THREE.Scene();
}

const gridSize = 16;
const debug = false;
const shadows = false;

function initCamera(): THREE.Camera {
  var aspect = window.innerWidth / window.innerHeight;
  var d = 30;
  const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d);
  camera.position.set(0, 100, 0);
  camera.rotation.order = "YXZ";
  camera.rotation.y = -Math.PI / 4;
  camera.rotation.x = Math.atan(-1 / Math.sqrt(2));
  return camera;
}

function initRenderer(): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  window.document.body.appendChild(renderer.domElement);
  return renderer;
}

const materialCache = {};

function createMaterial(color: Color): THREE.Material {
  const hexTriplet = toHexTriplet(color);

  if (materialCache[hexTriplet]) {
    return materialCache[hexTriplet];
  }

  const threeColor = new THREE.Color(hexTriplet);

  let material = debug
    ? new THREE.LineBasicMaterial({
        color: threeColor,
        linewidth: 1,
        depthTest: false,
        transparent: true
      })
    : shadows
    ? new THREE.MeshStandardMaterial({ color: threeColor })
    : new THREE.MeshLambertMaterial({ color: threeColor });

  materialCache[hexTriplet] = material;

  return material;
}

function createMesh(geometry: THREE.Geometry, material: THREE.Material) {
  if (debug) {
    const wireframe = new THREE.WireframeGeometry(geometry);
    return new THREE.LineSegments(wireframe, material);
  } else {
    const mesh = new THREE.Mesh(geometry, material);

    if (shadows) {
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

function createLight(): THREE.Light {
  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(gridSize * 1.5, 32, gridSize * 1.5);
  if (shadows) {
    light.castShadow = true;
  }
  return light;
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
        x * gridSize,
        y * gridSize,
        z * gridSize,
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
    const scene = initScene();
    const camera = initCamera();
    const renderer = initRenderer();

    if (shadows) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    }

    scene.add(new THREE.AmbientLight(0x404040));

    var controls = new THREE.OrbitControls(camera);
    camera.position.set(gridSize * 1.5, 20, gridSize * 1.5);
    controls.update();

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

    const light = createLight();
    scene.add(light);

    function animate() {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();
  }
);
